import { Coupon } from "../models/coupon.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /coupon — admin: the discount codes table.
export const getCoupons = asyncHandler(async (_req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, message: coupons.length ? "Coupons" : "No coupons found", coupons });
});

// POST /coupon — admin: create a code (0.1 = 10% off).
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code = "",
    discount,
    active = true,
    description = "",
    expiresAt = null,
    usageLimit = null,
    minOrderAmount = 0,
  } = req.body || {};
  const normalized = String(code).toUpperCase().trim();

  if (!normalized) throw new ApiError(400, "Coupon code is required");
  const value = Number(discount);
  if (!Number.isFinite(value) || value <= 0 || value > 1) {
    throw new ApiError(400, "Discount must be between 0 and 1 (e.g. 0.1 for 10%)");
  }
  const limit = usageLimit === null || usageLimit === "" ? null : Number(usageLimit);
  const minimum = Number(minOrderAmount);
  if (limit !== null && (!Number.isSafeInteger(limit) || limit < 1)) {
    throw new ApiError(400, "Usage limit must be a positive whole number");
  }
  if (!Number.isFinite(minimum) || minimum < 0) {
    throw new ApiError(400, "Minimum order amount must be a non-negative number");
  }
  const expiry = expiresAt ? new Date(expiresAt) : null;
  if (expiry && Number.isNaN(expiry.getTime())) throw new ApiError(400, "Expiration date is invalid");

  if (await Coupon.exists({ code: normalized })) throw new ApiError(409, "Coupon already exists");

  const coupon = await Coupon.create({
    code: normalized,
    discount: value,
    active: Boolean(active),
    description: String(description || ""),
    expiresAt: expiry,
    usageLimit: limit,
    minOrderAmount: minimum,
  });

  res.status(201).json({ success: true, message: "Coupon created", coupon });
});

// PUT /coupon/:id — admin: toggle/edit a code.
export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");

  const { discount, active, description, expiresAt, code, usageLimit, minOrderAmount } = req.body || {};
  if (discount !== undefined) {
    const value = Number(discount);
    if (!Number.isFinite(value) || value <= 0 || value > 1) {
      throw new ApiError(400, "Discount must be between 0 and 1 (e.g. 0.1 for 10%)");
    }
    coupon.discount = value;
  }
  if (active !== undefined) {
    if (typeof active !== "boolean") throw new ApiError(400, "Active must be a boolean");
    coupon.active = active;
  }
  if (description !== undefined) {
    if (typeof description !== "string" || description.length > 500) throw new ApiError(400, "Description must be 500 characters or fewer");
    coupon.description = description.trim();
  }
  if (expiresAt !== undefined) {
    const expiry = expiresAt ? new Date(expiresAt) : null;
    if (expiry && Number.isNaN(expiry.getTime())) throw new ApiError(400, "Expiration date is invalid");
    coupon.expiresAt = expiry;
  }
  if (usageLimit !== undefined) {
    const limit = usageLimit === null || usageLimit === "" ? null : Number(usageLimit);
    if (limit !== null && (!Number.isSafeInteger(limit) || limit < 1)) throw new ApiError(400, "Usage limit must be a positive whole number");
    coupon.usageLimit = limit;
  }
  if (minOrderAmount !== undefined) {
    const minimum = Number(minOrderAmount);
    if (!Number.isFinite(minimum) || minimum < 0) throw new ApiError(400, "Minimum order amount must be a non-negative number");
    coupon.minOrderAmount = minimum;
  }
  if (code !== undefined && String(code).toUpperCase().trim() !== coupon.code) {
    const normalized = String(code).toUpperCase().trim();
    if (!normalized || normalized.length > 50) throw new ApiError(400, "Coupon code must be between 1 and 50 characters");
    if (await Coupon.exists({ code: normalized })) throw new ApiError(409, "Coupon already exists");
    coupon.code = normalized;
  }

  await coupon.save();
  res.json({ success: true, message: "Coupon updated", coupon });
});

// DELETE /coupon/:id — admin: remove a code.
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");
  res.json({ success: true, message: "Coupon deleted" });
});