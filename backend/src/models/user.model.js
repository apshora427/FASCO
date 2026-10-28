import { Schema, model } from "mongoose";

// Accounts for the storefront + the staff who run it. Shape follows the guide
// project's user (name/email/password, role, isVerified, timestamps) but keeps
// FASCO's ESM + layer style. `verifyCode` is the short-lived confirmation code
// the Figma flow emails for signup and password recovery.
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // bcrypt hash — never a plain value
    phone: { type: String, trim: true, default: "" },
    avatar: { type: String, trim: true, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    isVerified: { type: Boolean, default: false },
    // 6-digit confirmation code + expiry (OTP-style, like the Confirmation screen)
    verifyCode: { type: String, select: false },
    verifyCodeExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

export const User = model("User", userSchema);