import Stripe from "stripe";
import crypto from "node:crypto";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { Order } from "../models/order.model.js";
import { StripeWebhookEvent } from "../models/stripeWebhookEvent.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createOrderFromRequest } from "./order.controller.js";
import { releaseUnpaidOrder } from "./paymentReservation.js";
import { sendOrderConfirmation } from "../utils/mailer.js";

const getStripe = () => env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;

export const getPaymentConfig = (_req, res) => {
  res.json({ success: true, paymentEnabled: Boolean(env.stripeSecretKey && env.stripeWebhookSecret) });
};

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const stripe = getStripe();
  if (!stripe || !env.stripeWebhookSecret) {
    throw new ApiError(503, "Online payments are not configured");
  }
  const origin = env.clientOrigins[0];
  if (!origin) throw new ApiError(503, "Storefront return URL is not configured");

  const order = await createOrderFromRequest(req, { paymentStatus: "unpaid", paymentMethod: "stripe" });
  let session;
  try {
    session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer_email: order.customer.email,
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        line_items: [{
          quantity: 1,
          price_data: {
            currency: env.stripeCurrency,
            unit_amount: Math.round(order.total * 100),
            product_data: { name: `FASCO order ${order.orderNumber}` },
          },
        }],
        metadata: { orderId: String(order._id), orderNumber: order.orderNumber },
        success_url: `${origin}/thankyou?payment=success`,
        cancel_url: `${origin}/checkout?payment=cancelled`,
      },
      { idempotencyKey: `fasco-order-${order._id}` }
    );
    if (!session.url) throw new Error("Stripe returned no checkout URL");
    const savedSession = await Order.updateOne(
      {
        _id: order._id,
        $or: [
          { paymentSessionId: "", paymentStatus: "unpaid", status: "pending" },
          { paymentSessionId: session.id },
        ],
      },
      { $set: { paymentSessionId: session.id } }
    );
    if (savedSession.matchedCount !== 1) {
      throw new Error("Order changed before the payment session was saved");
    }
  } catch (error) {
    if (session?.id) {
      try {
        await stripe.checkout.sessions.expire(session.id);
      } catch (expireError) {
        console.error("[payments] Could not expire an unlinked Stripe session:", expireError.message);
      }
    }
    await releaseUnpaidOrder(order._id, "failed");
    if (error instanceof ApiError) throw error;
    console.error("[payments] Could not create Stripe Checkout session:", error.message);
    throw new ApiError(502, "Could not start secure checkout. Your reserved stock has been released.");
  }

  res.status(201).json({
    success: true,
    message: "Secure checkout session created",
    checkoutUrl: session.url,
    orderNumber: order.orderNumber,
  });
});

export const completeStripeCheckout = async (session) => {
  if (session.payment_status !== "paid" || !session.metadata?.orderId) return false;
  const transaction = await mongoose.startSession();
  try {
    let completed = false;
    await transaction.withTransaction(async () => {
      completed = false;
      const order = await Order.findOne({
        _id: session.metadata.orderId,
        paymentSessionId: { $in: ["", session.id] },
      }).select("+paymentSessionId").session(transaction);
      if (!order || order.paymentStatus !== "unpaid" || order.status !== "pending") return;
      if (
        session.amount_total !== Math.round(order.total * 100) ||
        session.currency !== env.stripeCurrency
      ) {
        throw new ApiError(400, "Payment amount does not match the order");
      }

      const result = await Order.updateOne(
        { _id: order._id, paymentStatus: "unpaid", status: "pending" },
        {
          $set: {
            paymentStatus: "paid",
            paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : "",
            paymentSessionId: session.id,
            status: "confirmed",
            confirmationEmailStatus: "queued",
            confirmationEmailNextAttemptAt: new Date(),
            confirmationEmailLastError: "",
          },
        },
        { session: transaction }
      );
      completed = result.modifiedCount === 1;
    });
    return completed;
  } finally {
    await transaction.endSession();
  }
};

const webhookLeaseMs = 5 * 60 * 1000;

const storedSessionData = (session) => ({
  id: session.id,
  payment_status: session.payment_status,
  payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : "",
  amount_total: session.amount_total,
  currency: session.currency,
  metadata: { orderId: session.metadata?.orderId || "" },
});

const claimWebhookEvent = async (event, ignoreBackoff) => {
  const now = new Date();
  const leaseId = crypto.randomUUID();
  const eventData = storedSessionData(event.data?.object || {});
  try {
    const [created] = await StripeWebhookEvent.create([{
      eventId: event.id,
      eventType: event.type,
      eventData,
      status: "processing",
      attempts: 1,
      leaseId,
      leaseUntil: new Date(now.getTime() + webhookLeaseMs),
    }]);
    return created;
  } catch (error) {
    if (error.code !== 11000) throw error;
  }

  const retryFilter = {
    eventId: event.id,
    $or: [
      { status: "processing", leaseUntil: { $lte: now } },
      ...(ignoreBackoff ? [{ status: "failed" }] : [{ status: "failed", nextAttemptAt: { $lte: now } }]),
    ],
  };
  return StripeWebhookEvent.findOneAndUpdate(
    retryFilter,
    {
      $set: {
        eventType: event.type,
        eventData,
        status: "processing",
        leaseId,
        leaseUntil: new Date(now.getTime() + webhookLeaseMs),
        lastError: "",
      },
      $inc: { attempts: 1 },
    },
    { returnDocument: "after" }
  );
};

const retryOrderConfirmation = async (orderId, force = false, paymentSessionId = "") => {
  const now = new Date();
  const leaseId = crypto.randomUUID();
  const filter = {
    _id: orderId,
    paymentStatus: "paid",
    ...(paymentSessionId ? { paymentSessionId } : {}),
    $and: [
      {
        $or: [
          { confirmationEmailStatus: "queued" },
          { confirmationEmailStatus: "failed" },
          { confirmationEmailStatus: "sending", confirmationEmailLeaseUntil: { $lte: now } },
        ],
      },
      ...(force ? [] : [{
        $or: [
          { confirmationEmailNextAttemptAt: null },
          { confirmationEmailNextAttemptAt: { $lte: now } },
        ],
      }]),
    ],
  };
  const order = await Order.findOneAndUpdate(
    filter,
    {
      $set: {
        confirmationEmailStatus: "sending",
        confirmationEmailLeaseUntil: new Date(now.getTime() + webhookLeaseMs),
        confirmationEmailLeaseId: leaseId,
      },
      $inc: { confirmationEmailAttempts: 1 },
    },
    { returnDocument: "after" }
  ).select("+confirmationEmailAttempts");
  if (!order) return false;

  try {
    const delivered = await sendOrderConfirmation(order);
    if (delivered) {
      await Order.updateOne(
        { _id: order._id, confirmationEmailStatus: "sending", confirmationEmailLeaseId: leaseId },
        {
          $set: {
            confirmationEmailStatus: "sent",
            confirmationEmailLeaseUntil: null,
            confirmationEmailLeaseId: "",
            confirmationEmailLastError: "",
          },
        }
      );
      return true;
    }

    const retryDelay = Math.min(60 * 2 ** Math.min(order.confirmationEmailAttempts - 1, 6), 3600);
    await Order.updateOne(
      { _id: order._id, confirmationEmailStatus: "sending", confirmationEmailLeaseId: leaseId },
      {
        $set: {
          confirmationEmailStatus: "failed",
          confirmationEmailLeaseUntil: null,
          confirmationEmailLeaseId: "",
          confirmationEmailLastError: "Email delivery failed; see server logs",
          confirmationEmailNextAttemptAt: new Date(Date.now() + retryDelay * 1000),
        },
      }
    );
    return false;
  } catch (error) {
    const retryDelay = Math.min(60 * 2 ** Math.min(order.confirmationEmailAttempts - 1, 6), 3600);
    await Order.updateOne(
      { _id: order._id, confirmationEmailStatus: "sending", confirmationEmailLeaseId: leaseId },
      {
        $set: {
          confirmationEmailStatus: "failed",
          confirmationEmailLeaseUntil: null,
          confirmationEmailLeaseId: "",
          confirmationEmailLastError: error.message,
          confirmationEmailNextAttemptAt: new Date(Date.now() + retryDelay * 1000),
        },
      }
    );
    console.error(`[payments] Could not queue order confirmation for ${order.orderNumber}:`, error.message);
    return false;
  }
};

const applyStripeWebhookEvent = async (event) => {
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    await completeStripeCheckout(event.data.object);
    const orderId = event.data.object.metadata?.orderId;
    if (orderId) await retryOrderConfirmation(orderId, true, event.data.object.id);
  } else if (
    event.type === "checkout.session.expired" ||
    event.type === "checkout.session.async_payment_failed"
  ) {
    const session = event.data.object;
    if (session.metadata?.orderId) {
      await releaseUnpaidOrder(session.metadata.orderId, "failed", session.id);
    }
  }
};

export const processStripeWebhookEvent = async (event, { ignoreBackoff = true } = {}) => {
  const claimed = await claimWebhookEvent(event, ignoreBackoff);
  if (!claimed) {
    const previous = await StripeWebhookEvent.findOne({ eventId: event.id });
    if (previous?.status === "processed" && (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    )) {
      const orderId = event.data.object.metadata?.orderId;
      if (orderId) {
        await retryOrderConfirmation(orderId, true, event.data.object.id);
      }
    }
    return { duplicate: true, status: previous?.status || "processing" };
  }

  try {
    await applyStripeWebhookEvent(event);
    await StripeWebhookEvent.updateOne(
      { eventId: event.id, status: "processing", leaseId: claimed.leaseId },
      {
        $set: { status: "processed", processedAt: new Date(), nextAttemptAt: null, leaseUntil: null },
      }
    );
    return { duplicate: false, status: "processed" };
  } catch (error) {
    const attempts = claimed.attempts;
    const retryDelay = Math.min(60 * 2 ** Math.min(attempts - 1, 6), 3600);
    await StripeWebhookEvent.updateOne(
      { eventId: event.id, status: "processing", leaseId: claimed.leaseId },
      {
        $set: {
          status: "failed",
          lastError: error.message,
          leaseUntil: null,
          nextAttemptAt: new Date(Date.now() + retryDelay * 1000),
        },
      }
    );
    throw error;
  }
};

export const recoverPaymentWork = async () => {
  const now = new Date();
  const retryableEvents = await StripeWebhookEvent.find({
    $or: [
      { status: "failed", nextAttemptAt: { $lte: now } },
      { status: "processing", leaseUntil: { $lte: now } },
    ],
  }).sort({ nextAttemptAt: 1 }).limit(25);
  for (const stored of retryableEvents) {
    try {
      await processStripeWebhookEvent(
        { id: stored.eventId, type: stored.eventType, data: { object: stored.eventData } },
        { ignoreBackoff: false }
      );
    } catch (error) {
      console.error(`[payments] Webhook event ${stored.eventId} recovery failed:`, error.message);
    }
  }

  const pendingEmails = await Order.find({
    paymentStatus: "paid",
    confirmationEmailStatus: { $in: ["queued", "failed", "sending"] },
    $or: [
      { confirmationEmailNextAttemptAt: null },
      { confirmationEmailNextAttemptAt: { $lte: now } },
      { confirmationEmailStatus: "sending", confirmationEmailLeaseUntil: { $lte: now } },
    ],
  }).select("_id").limit(25);
  for (const order of pendingEmails) {
    try {
      await retryOrderConfirmation(order._id);
    } catch (error) {
      console.error(`[payments] Confirmation email recovery for ${order._id} failed:`, error.message);
    }
  }
};

export const handleStripeWebhook = async (req, res, next) => {
  const stripe = getStripe();
  if (!stripe || !env.stripeWebhookSecret) {
    res.status(503).json({ success: false, message: "Payment webhook is not configured" });
    return;
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      env.stripeWebhookSecret
    );
  } catch (error) {
    res.status(400).json({ success: false, message: `Invalid payment signature: ${error.message}` });
    return;
  }

  try {
    await processStripeWebhookEvent(event);
    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};
