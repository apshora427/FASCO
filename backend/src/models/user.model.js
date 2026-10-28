import { Schema, model } from "mongoose";

// Accounts for the storefront + the staff who run it. Shape follows the guide
// project's user (name/email/password, role, isVerified, timestamps) but keeps
// FASCO's ESM + layer style. `verifyCode` is the short-lived confirmation code
// the Figma flow emails for signup and password recovery.
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    googleSubject: { type: String, unique: true, sparse: true, select: false },
    phone: { type: String, trim: true, default: "" },
    avatar: { type: String, trim: true, default: "" },
    wishlistIds: { type: [Number], default: [] },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    isVerified: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0, select: false },
    // 6-digit confirmation code + expiry (OTP-style, like the Confirmation screen)
    verifyCode: { type: String, select: false },
    verifyCodeExpires: { type: Date, select: false },
    verifyCodePurpose: { type: String, enum: ["signup", "reset"], select: false },
    verifyCodeAttempts: { type: Number, default: 0, select: false },
    verifyCodeLockedUntil: { type: Date, select: false },
    emailChangeCode: { type: String, select: false },
    emailChangeTarget: { type: String, lowercase: true, trim: true, select: false },
    emailChangeCodeExpires: { type: Date, select: false },
    emailChangeCodeAttempts: { type: Number, default: 0, select: false },
    emailChangeCodeLockedUntil: { type: Date, select: false },
  },
  { timestamps: true }
);

export const User = model("User", userSchema);