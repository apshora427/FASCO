import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Coupon } from "../models/coupon.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import crypto from "node:crypto";
import { sendOrderStatusUpdate } from "../utils/mailer.js";
import { expireUnpaidStripeSession, refundStripeOrder } from "./paymentReservation.js";

// Shipping rules mirrored from the checkout page (Checkout.jsx).
const SHIPPING_FLAT = 40;
const FREE_SHIPPING_OVER = 75;

// Resolves a code against the coupon collection — shared by checkout and the
// dashboard's preview. Returns { code, discount } or throws.
const resolveCoupon = async (code, subtotal) => {
  if (!code) return null;
  const coupon = await Coupon.findOne({ code: String(code).toUpperCase().trim() });
  if (!coupon || !coupon.active) throw new ApiError(400, "Invalid discount code");
  if (coupon.expiresAt && coupon.expiresAt <= new Date()) throw new ApiError(400, "Discount code expired");
  if (subtotal < (coupon.minOrderAmount || 0)) {
    throw new ApiError(400, `This code requires a minimum order of $${Number(coupon.minOrderAmount).toFixed(2)}`);
  }
  if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usageCount >= coupon.usageLimit) {
    throw new ApiError(400, "This discount code has reached its usage limit");
  }
  return coupon;
};

// POST /coupon/validate — the checkout "Apply" button, priced server-side.
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code = "", subtotal = 0 } = req.body || {};
  if (typeof code !== "string" || !code.trim()) throw new ApiError(400, "Discount code is required");
  if (!Number.isFinite(Number(subtotal)) || Number(subtotal) < 0) {
    throw new ApiError(400, "Subtotal must be a non-negative number");
  }
  const coupon = await resolveCoupon(code, Number(subtotal));

  const discount = Math.round(Number(subtotal) * coupon.discount * 100) / 100;
  res.json({
    success: true,
    message: `Code ${coupon.code} applied`,
    coupon: { code: coupon.code, discount: coupon.discount, amount: discount },
  });
});

// Shared by Stripe checkout and integration tests. Prices, shipping, and
// discounts are recalculated from database records, never trusted from clients.
export const createOrderFromRequest = async (req, { paymentStatus = "unpaid", paymentMethod = "stripe" } = {}) => {
  const { items = [], customer = {}, discountCode = "", note = "" } = req.body || {};
  const customerInfo =
    customer && typeof customer === "object" && !Array.isArray(customer)
      ? customer
      : {};

  if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
    throw new ApiError(400, "Your cart must contain between 1 and 100 items");
  }
  const requiredCustomerFields = ["firstName", "lastName", "address", "city", "postal", "country"];
  for (const key of requiredCustomerFields) {
    if (
      typeof customerInfo[key] !== "string" ||
      !customerInfo[key].trim() ||
      customerInfo[key].trim().length > 160
    ) {
      throw new ApiError(400, `${key} is required and must be 160 characters or fewer`);
    }
  }
  const email = String(customerInfo.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, "Please enter a valid email address");
  }

  const normalizedItems = items.map((item) => {
    const id = Number(item?.id ?? item?.productId);
    const quantity = Number(item?.quantity);
    if (!Number.isSafeInteger(id) || id < 1) throw new ApiError(400, "Invalid product in cart");
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new ApiError(400, "Item quantities must be whole numbers between 1 and 99");
    }
    return { ...item, id, quantity };
  });
  const ids = [...new Set(normalizedItems.map((item) => item.id))];
  const products = await Product.find({ id: { $in: ids } });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines = normalizedItems.map((item) => {
    const product = byId.get(item.id);
    if (!product) throw new ApiError(400, `Product ${item.id} is no longer available`);

    const size = typeof item.size === "string" ? item.size.trim() : "";
    const color = typeof item.color === "string" ? item.color.trim() : "";
    if (product.sizes.length && size && !product.sizes.includes(size)) {
      throw new ApiError(400, `The selected size is not available for ${product.title}`);
    }
    if (product.colors.length && color && !product.colors.includes(color)) {
      throw new ApiError(400, `The selected color is not available for ${product.title}`);
    }
    return {
      productId: product.id,
      title: product.title,
      image: product.image,
      category: product.category,
      price: product.price,
      quantity: item.quantity,
      size,
      color,
    };
  });

  const quantitiesByProduct = new Map();
  for (const line of lines) {
    quantitiesByProduct.set(
      line.productId,
      (quantitiesByProduct.get(line.productId) || 0) + line.quantity
    );
  }
  for (const [productId, quantity] of quantitiesByProduct) {
    const product = byId.get(productId);
    if (quantity > product.stock) {
      throw new ApiError(400, `Only ${product.stock} left of ${product.title}`);
    }
  }

  const subtotal = Math.round(lines.reduce((sum, l) => sum + l.price * l.quantity, 0) * 100) / 100;

  let coupon = await resolveCoupon(discountCode, subtotal);
  let discount = coupon ? Math.round(subtotal * coupon.discount * 100) / 100 : 0;
  const shipping = subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FLAT;
  let total = Math.max(0, subtotal - discount) + shipping;

  const reserved = [];
  let couponReserved = false;
  let order;
  try {
    if (coupon) {
      const now = new Date();
      const couponFilter = {
        _id: coupon._id,
        active: true,
        $and: [
          { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
          { $or: [{ minOrderAmount: null }, { minOrderAmount: { $lte: subtotal } }] },
        ],
      };
      if (coupon.usageLimit !== null && coupon.usageLimit !== undefined) {
        couponFilter.usageCount = { $lt: coupon.usageLimit };
      }
      const reservedCoupon = await Coupon.findOneAndUpdate(
        couponFilter,
        { $inc: { usageCount: 1 } },
        { returnDocument: "after" }
      );
      if (!reservedCoupon) {
        await resolveCoupon(discountCode, subtotal);
        throw new ApiError(409, "Discount code is no longer available");
      }
      coupon = reservedCoupon;
      couponReserved = true;
      discount = Math.round(subtotal * coupon.discount * 100) / 100;
      total = Math.max(0, subtotal - discount) + shipping;
    }

    for (const [productId, quantity] of quantitiesByProduct) {
      const product = await Product.findOneAndUpdate(
        { id: productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { returnDocument: "after" }
      );
      if (!product) {
        const latest = await Product.findOne({ id: productId }).select("title stock");
        throw new ApiError(
          409,
          latest
            ? `Only ${latest.stock} left of ${latest.title}`
            : "A product in your cart is no longer available"
        );
      }
      reserved.push({ productId, quantity });
    }

    order = await Order.create({
      orderNumber: `FS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
      items: lines,
      customer: {
        email,
        firstName: customerInfo.firstName.trim(),
        lastName: customerInfo.lastName.trim(),
        address: customerInfo.address.trim(),
        city: customerInfo.city.trim(),
        postal: customerInfo.postal.trim(),
        country: customerInfo.country.trim(),
      },
      subtotal,
      discount,
      discountCode: coupon ? coupon.code : "",
      shipping,
      total,
      paymentStatus,
      paymentMethod,
      user: req.user?.id || null,
      isGuest: !req.user,
      note: String(note || ""),
    });

  } catch (error) {
    if (couponReserved) await Coupon.updateOne({ _id: coupon._id, usageCount: { $gt: 0 } }, { $inc: { usageCount: -1 } });
    if (order) await Order.deleteOne({ _id: order._id });
    await Promise.all(
      reserved.map(({ productId, quantity }) =>
        Product.updateOne({ id: productId }, { $inc: { stock: quantity } })
      )
    );
    throw error;
  }

  return order;
};

// GET /order — admin: newest first, filterable by ?status= / ?search=.
export const getOrders = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const filter = {};
  if (status) filter.status = String(status);
  if (search) {
    const rx = new RegExp(String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ orderNumber: rx }, { "customer.email": rx }, { "customer.firstName": rx }, { "customer.lastName": rx }];
  }

  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, message: orders.length ? "Orders" : "No orders found", orders });
});

// GET /my-orders — a customer can only see orders linked to their own account.
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ success: true, message: orders.length ? "Your orders" : "No orders found", orders });
});

// GET /order/:id — admin: one order for the detail drawer.
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");
  res.json({ success: true, message: "Order", order });
});

// PATCH /order/:id/status — admin: move an order through the pipeline.
const STATUS_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};
const STATUSES = Object.keys(STATUS_TRANSITIONS);
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  if (!STATUSES.includes(status)) throw new ApiError(400, "Invalid order status");

  const order = await Order.findById(req.params.id).select("+paymentIntentId +paymentSessionId");
  if (!order) throw new ApiError(404, "Order not found");
  if (status === order.status) {
    res.json({ success: true, message: `Order remains ${status}`, order });
    return;
  }
  if (!STATUS_TRANSITIONS[order.status]?.includes(status)) {
    throw new ApiError(400, `Cannot move an order from ${order.status} to ${status}`);
  }
  if (order.paymentStatus === "unpaid" && status !== "cancelled") {
    throw new ApiError(409, "An unpaid order cannot advance until payment is confirmed");
  }
  if (order.paymentStatus === "refunded" && status !== "cancelled") {
    throw new ApiError(409, "A refunded order cannot advance");
  }
  if (status === "cancelled" && order.paymentStatus === "unpaid") {
    await expireUnpaidStripeSession(order);
  }
  const refunded = status === "cancelled" ? await refundStripeOrder(order) : false;
  const previousStatus = order.status;
  const update = { status };
  if (refunded) update.paymentStatus = "refunded";
  const updatedOrder = await Order.findOneAndUpdate(
    { _id: order._id, status: previousStatus },
    { $set: update },
    { returnDocument: "after", runValidators: true }
  );
  if (!updatedOrder) throw new ApiError(409, "The order status changed; refresh and try again");
  if (status === "cancelled") {
    const quantities = new Map();
    for (const item of order.items) {
      quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
    }
    const restocked = [];
    let couponRestored = false;
    try {
      for (const [productId, quantity] of quantities) {
        const result = await Product.updateOne({ id: productId }, { $inc: { stock: quantity } });
        if (result.matchedCount !== 1) throw new ApiError(409, "A product for this order no longer exists");
        restocked.push({ productId, quantity });
      }
      if (order.discountCode) {
        const couponResult = await Coupon.updateOne(
          { code: order.discountCode, usageCount: { $gt: 0 } },
          { $inc: { usageCount: -1 } }
        );
        couponRestored = couponResult.modifiedCount === 1;
      }
    } catch (error) {
      await Promise.all(
        restocked.map(({ productId, quantity }) =>
          Product.updateOne({ id: productId }, { $inc: { stock: -quantity } })
        )
      );
      await Order.updateOne(
        { _id: order._id, status: "cancelled" },
        { $set: { status: previousStatus } }
      );
      if (couponRestored && order.discountCode) {
        await Coupon.updateOne({ code: order.discountCode }, { $inc: { usageCount: 1 } });
      }
      throw error;
    }
  }

  await sendOrderStatusUpdate(updatedOrder);
  res.json({ success: true, message: `Order marked ${status}`, order: updatedOrder });
});