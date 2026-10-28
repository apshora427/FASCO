import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Coupon } from "../models/coupon.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Shipping rules mirrored from the checkout page (Checkout.jsx).
const SHIPPING_FLAT = 40;
const FREE_SHIPPING_OVER = 75;

// Resolves a code against the coupon collection — shared by checkout and the
// dashboard's preview. Returns { code, discount } or throws.
const resolveCoupon = async (code) => {
  if (!code) return null;
  const coupon = await Coupon.findOne({ code: String(code).toUpperCase().trim() });
  if (!coupon || !coupon.active) throw new ApiError(400, "Invalid discount code");
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new ApiError(400, "Discount code expired");
  return coupon;
};

// POST /coupon/validate — the checkout "Apply" button, priced server-side.
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code = "", subtotal = 0 } = req.body || {};

  if (!String(code).trim()) {
    throw new ApiError(400, "Please enter a discount code");
  }

  const numericSubtotal = Number(subtotal);
  if (!Number.isFinite(numericSubtotal) || numericSubtotal < 0) {
    throw new ApiError(400, "Invalid subtotal");
  }

  const coupon = await resolveCoupon(code);
  const discount = Math.round(numericSubtotal * coupon.discount * 100) / 100;

  res.json({
    success: true,
    message: `Code ${coupon.code} applied`,
    coupon: {
      code: coupon.code,
      discount: coupon.discount,
      amount: discount,
    },
  });
});

// POST /order — placed by the checkout. Prices/shipping/discount are always
// recomputed from the database, never taken from the browser.
export const placeOrder = asyncHandler(async (req, res) => {
  const { items = [], customer = {}, discountCode = "", note = "" } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) throw new ApiError(400, "Your cart is empty");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email || "")) {
    throw new ApiError(400, "Please enter a valid email address");
  }

  const ids = [...new Set(items.map((i) => Number(i.id ?? i.productId)).filter(Number.isFinite))];
  const products = await Product.find({ id: { $in: ids } });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines = items.map((item) => {
    const product = byId.get(Number(item.id ?? item.productId));
    if (!product) throw new ApiError(400, `Product ${item.id} is no longer available`);

    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
    if (product.stock !== undefined && product.stock !== null && quantity > product.stock) {
      throw new ApiError(400, `Only ${product.stock} left of ${product.title}`);
    }
    return {
      productId: product.id,
      title: product.title,
      image: product.image,
      category: product.category,
      price: product.price,
      quantity,
      size: item.size || "",
      color: item.color || "",
    };
  });

  const subtotal = Math.round(lines.reduce((sum, l) => sum + l.price * l.quantity, 0) * 100) / 100;

  let coupon = null;
  try {
    coupon = await resolveCoupon(discountCode);
  } catch {
    throw new ApiError(400, "Invalid discount code");
  }
  const discount = coupon ? Math.round(subtotal * coupon.discount * 100) / 100 : 0;
  const shipping = subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FLAT;
  const total = Math.max(0, subtotal - discount) + shipping;

  // sequential, human-friendly order number: FS-0001, FS-0002, …
  const count = await Order.countDocuments();
  const order = await Order.create({
    orderNumber: `FS-${String(count + 1).padStart(4, "0")}`,
    items: lines,
    customer: {
      email: customer.email,
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      address: customer.address || "",
      city: customer.city || "",
      postal: customer.postal || "",
      country: customer.country || "",
    },
    subtotal,
    discount,
    discountCode: coupon ? coupon.code : "",
    shipping,
    total,
    user: req.user?.id || null,
    isGuest: !req.user,
    note: String(note || ""),
  });

  if (coupon) await Coupon.updateOne({ _id: coupon._id }, { $inc: { usageCount: 1 } });
  // free the reserved stock so the storefront reflects the sale
  await Promise.all(
    lines.map((l) => Product.updateOne({ id: l.productId }, { $inc: { stock: -l.quantity } }))
  );

  res.status(201).json({ success: true, message: "Order placed successfully", order });
});

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

// GET /order/:id — admin: one order for the detail drawer.
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");
  res.json({ success: true, message: "Order", order });
});

// PATCH /order/:id/status — admin: move an order through the pipeline.
const STATUSES = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"];
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  if (!STATUSES.includes(status)) throw new ApiError(400, "Invalid order status");

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  if (!order) throw new ApiError(404, "Order not found");

  res.json({ success: true, message: `Order marked ${status}`, order });
});
