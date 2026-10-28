import Stripe from "stripe";
import { env } from "../config/env.js";
import { Order } from "../models/order.model.js";
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
      { _id: order._id, paymentStatus: "unpaid", status: "pending" },
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
  const order = await Order.findOne({
    _id: session.metadata.orderId,
    paymentSessionId: session.id,
    paymentStatus: "unpaid",
    status: "pending",
  });
  if (!order) return false;
  if (
    session.amount_total !== Math.round(order.total * 100) ||
    session.currency !== env.stripeCurrency
  ) {
    throw new ApiError(400, "Payment amount does not match the order");
  }

  const paidOrder = await Order.findOneAndUpdate(
    { _id: order._id, paymentStatus: "unpaid", status: "pending" },
    {
      $set: {
        paymentStatus: "paid",
        paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : "",
        status: "confirmed",
      },
    },
    { returnDocument: "after" }
  );
  if (!paidOrder) return false;
  await sendOrderConfirmation(paidOrder);
  return true;
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
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      await completeStripeCheckout(event.data.object);
    } else if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      const session = event.data.object;
      if (session.metadata?.orderId) {
        await releaseUnpaidOrder(session.metadata.orderId, "failed", session.id);
      }
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};
