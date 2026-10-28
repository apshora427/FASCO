import { Schema, model } from "mongoose";

// Discount codes managed from the dashboard and checked by the checkout's
// Apply button. `discount` is a fraction (0.1 = 10% off), matching
// COUPON_DISCOUNT in the frontend data layer.
const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discount: { type: Number, required: true, min: 0, max: 1 },
    active: { type: Boolean, default: true },
    description: { type: String, trim: true, default: "" },
    usageCount: { type: Number, default: 0, min: 0 },
    usageLimit: { type: Number, default: null, min: 1 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Coupon = model("Coupon", couponSchema);