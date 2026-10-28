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
  const { code = "", discount, active = true, description = "", expiresAt = null } = req.body || {};
  const normalized = String(code).toUpperCase().trim();

  if (!normalized) throw new ApiError(400, "Coupon code is required");
  const value = Number(discount);
  if (!Number.isFinite(value) || value <= 0 || value > 1) {
    throw new ApiError(400, "Discount must be between 0 and 1 (e.g. 0.1 for 10%)");
  }
  if (await Coupon.exists({ code: normalized })) throw new ApiError(409, "Coupon already exists");

  const coupon = await Coupon.create({
    code: normalized,
    discount: value,
    active: Boolean(active),
    description: String(description || ""),
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  });

  res.status(201).json({ success: true, message: "Coupon created", coupon });
});

// PUT /coupon/:id — admin: toggle/edit a code.
export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");

  const { discount, active, description, expiresAt, code } = req.body || {};
  if (discount !== undefined) {
    const value = Number(discount);
    if (!Number.isFinite(value) || value <= 0 || value > 1) {
      throw new ApiError(400, "Discount must be between 0 and 1 (e.g. 0.1 for 10%)");
    }
    coupon.discount = value;
  }
  if (active !== undefined) coupon.active = Boolean(active);
  if (description !== undefined) coupon.description = String(description);
  if (expiresAt !== undefined) coupon.expiresAt = expiresAt ? new Date(expiresAt) : null;
  if (code !== undefined && String(code).toUpperCase().trim() !== coupon.code) {
    const normalized = String(code).toUpperCase().trim();
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