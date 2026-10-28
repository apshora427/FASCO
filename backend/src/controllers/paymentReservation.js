import Stripe from "stripe";
import { Coupon } from "../models/coupon.model.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export const releaseUnpaidOrder = async (orderId, paymentStatus, paymentSessionId) => {
  const filter = { _id: orderId, status: "pending", paymentStatus: "unpaid" };
  if (paymentSessionId) filter.paymentSessionId = paymentSessionId;
  const order = await Order.findOneAndUpdate(
    filter,
    { $set: { status: "cancelled", paymentStatus } },
    { returnDocument: "after" }
  );
  if (!order) return false;

  const quantities = new Map();
  for (const item of order.items) {
    quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
  }

  const restocked = [];
  let couponRestored = false;
  try {
    for (const [productId, quantity] of quantities) {
      const result = await Product.updateOne({ id: productId }, { $inc: { stock: quantity } });
      if (result.matchedCount !== 1) throw new ApiError(409, "A reserved product no longer exists");
      restocked.push({ productId, quantity });
    }
    if (order.discountCode) {
      const result = await Coupon.updateOne(
        { code: order.discountCode, usageCount: { $gt: 0 } },
        { $inc: { usageCount: -1 } }
      );
      couponRestored = result.modifiedCount === 1;
    }
  } catch (error) {
    await Promise.all(
      restocked.map(({ productId, quantity }) =>
        Product.updateOne({ id: productId }, { $inc: { stock: -quantity } })
      )
    );
    if (couponRestored && order.discountCode) {
      await Coupon.updateOne({ code: order.discountCode }, { $inc: { usageCount: 1 } });
    }
    await Order.updateOne(
      { _id: order._id, status: "cancelled", paymentStatus },
      { $set: { status: "pending", paymentStatus: "unpaid" } }
    );
    throw error;
  }
  return true;
};

export const expireUnpaidStripeSession = async (
  order,
  stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null
) => {
  if (order.paymentMethod !== "stripe" || order.paymentStatus !== "unpaid" || !order.paymentSessionId) {
    return false;
  }
  if (!stripe) throw new ApiError(503, "Stripe is required to safely cancel this unpaid order");

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(order.paymentSessionId);
    if (session.status === "complete" || session.payment_status === "paid") {
      throw new ApiError(409, "Payment has already completed; refresh the order before cancelling");
    }
    if (session.status === "expired") return true;
    if (session.status !== "open") {
      throw new ApiError(409, "This checkout session cannot be cancelled safely");
    }
    session = await stripe.checkout.sessions.expire(order.paymentSessionId);
    if (session.status === "expired") return true;
    if (session.status === "complete" || session.payment_status === "paid") {
      throw new ApiError(409, "Payment has already completed; refresh the order before cancelling");
    }
    throw new ApiError(502, "Stripe did not confirm checkout cancellation");
  } catch (error) {
    if (error instanceof ApiError) throw error;
    try {
      session = await stripe.checkout.sessions.retrieve(order.paymentSessionId);
    } catch (retrieveError) {
      console.error(`[payments] Could not verify checkout session ${order.paymentSessionId}:`, retrieveError.message);
      throw new ApiError(502, "Could not safely verify the Stripe checkout session");
    }
    if (session.status === "expired") return true;
    if (session.status === "complete" || session.payment_status === "paid") {
      throw new ApiError(409, "Payment has already completed; refresh the order before cancelling");
    }
    console.error(`[payments] Could not expire checkout session ${order.paymentSessionId}:`, error.message);
    throw new ApiError(502, "Could not safely cancel the Stripe checkout session");
  }
};

export const refundStripeOrder = async (order) => {
  if (order.paymentMethod !== "stripe" || order.paymentStatus !== "paid") return false;
  if (!env.stripeSecretKey || !order.paymentIntentId) {
    throw new ApiError(503, "This paid Stripe order cannot be refunded because payment details are unavailable");
  }
  try {
    const stripe = new Stripe(env.stripeSecretKey);
    await stripe.refunds.create(
      { payment_intent: order.paymentIntentId },
      { idempotencyKey: `fasco-refund-${order._id}` }
    );
    return true;
  } catch (error) {
    console.error(`[payments] Could not refund order ${order.orderNumber}:`, error.message);
    throw new ApiError(502, "Stripe could not complete the refund; the order status was not changed");
  }
};
