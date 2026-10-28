import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/mailer.js";

// Same rules the frontend forms enforce (UserContext) — mirrored server-side
// so the API can never be bypassed with a raw request.
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])^[a-zA-Z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{6,12}$/;
const nameRegex = /^[a-zA-Z]+(?:[-'\s][a-zA-Z]+)*$/;

const CODE_TTL_MINUTES = 10;

const newCode = () => ({
  verifyCode: crypto.randomInt(100000, 1000000).toString(),
  verifyCodeExpires: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
});

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  avatar: user.avatar || "",
  role: user.role,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

const signToken = (user) =>
  jwt.sign({ id: user._id, email: user.email, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

// POST /register — create the account, email a confirmation code.
// The Figma flow does NOT sign the user in here: Confirmation → Login.
export const register = asyncHandler(async (req, res) => {
  const { name = "", email = "", password = "", phone = "" } = req.body || {};

  if (!name || !email || !password) throw new ApiError(400, "All fields are required");
  if (!nameRegex.test(name)) throw new ApiError(400, "Name contains invalid characters");
  if (!emailRegex.test(email)) throw new ApiError(400, "Invalid Email");
  if (!passwordRegex.test(password)) throw new ApiError(400, "The password must be strong");

  const normalized = email.toLowerCase();
  if (await User.exists({ email: normalized })) throw new ApiError(409, "Email already in use");

  const user = await User.create({
    name: name.trim(),
    email: normalized,
    password: bcrypt.hashSync(password, 10),
    phone: String(phone).trim(),
    ...newCode(),
  });

  const { delivered, code } = await sendVerificationEmail({ to: user.email, name: user.name, code: user.verifyCode });

  res.status(201).json({
    success: true,
    message: "Confirmation code sent to your email",
    data: { email: user.email },
    // dev-only aid when SMTP isn't configured — never present in production
    ...(!delivered && code && !env.isProduction ? { devCode: code } : {}),
  });
});

// POST /verify/:token — the 6-digit code typed on the Confirmation screen.
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({ verifyCode: String(token || "").trim() }).select("+verifyCode +verifyCodeExpires");
  if (!user) throw new ApiError(401, "Invalid confirmation code");
  if (user.isVerified) throw new ApiError(400, "User already verified");
  if (!user.verifyCodeExpires || user.verifyCodeExpires < new Date()) {
    throw new ApiError(401, "Confirmation code expired");
  }

  user.isVerified = true;
  user.verifyCode = undefined;
  user.verifyCodeExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Email verification successful" });
});

// POST /revarify-email — "Resend Now" on the Confirmation screen.
export const resendCode = asyncHandler(async (req, res) => {
  const { email = "" } = req.body || {};
  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email: email.toLowerCase() }).select("+verifyCode +verifyCodeExpires");
  if (!user) throw new ApiError(404, "User not found!");
  if (user.isVerified) throw new ApiError(400, "User already verified");

  Object.assign(user, newCode());
  await user.save();

  const { delivered, code } = await sendVerificationEmail({ to: user.email, name: user.name, code: user.verifyCode });

  res.json({
    success: true,
    message: "Confirmation code resent — please check your email",
    ...(!delivered && code && !env.isProduction ? { devCode: code } : {}),
  });
});

// POST /login — verify credentials, return the access token + user summary.
export const login = asyncHandler(async (req, res) => {
  const { email = "", password = "" } = req.body || {};

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) throw new ApiError(404, "User Not Found!");

  if (!bcrypt.compareSync(password, user.password)) throw new ApiError(401, "Credential error");
  if (!user.isVerified) throw new ApiError(403, "Email not verified — check your confirmation code");

  res.json({
    success: true,
    message: "Successfully Login",
    userInfo: { ...publicUser(user), accesstoken: signToken(user) },
  });
});

// POST /forgot-password — emails a fresh 6-digit code (10 minute window).
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email = "" } = req.body || {};

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) throw new ApiError(404, "User Not Found!");

  Object.assign(user, newCode());
  await user.save();

  const { delivered, code } = await sendPasswordResetEmail({ to: user.email, name: user.name, code: user.verifyCode });

  res.json({
    success: true,
    message: "Check your email and set the new password",
    ...(!delivered && code && !env.isProduction ? { devCode: code } : {}),
  });
});

// POST /setnew-password/:token — token is the emailed code; replaces the password.
export const setNewPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword = "", confirmPassword = "" } = req.body || {};

  if (!token) throw new ApiError(401, "Token Not Found!");
  if (newPassword !== confirmPassword) throw new ApiError(400, "Passwords do not match");
  if (!passwordRegex.test(newPassword)) throw new ApiError(400, "The password must be strong");

  const user = await User.findOne({ verifyCode: String(token).trim() }).select("+verifyCode +verifyCodeExpires");
  if (!user) throw new ApiError(401, "Invalid or expired reset code");
  if (!user.verifyCodeExpires || user.verifyCodeExpires < new Date()) {
    throw new ApiError(401, "Reset code expired");
  }

  user.password = bcrypt.hashSync(newPassword, 10);
  user.isVerified = true; // proving control of the inbox implies ownership
  user.verifyCode = undefined;
  user.verifyCodeExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Successfully changed the password" });
});

// GET /me — session restore: the frontend re-validates its stored token on boot.
export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, "User not found");

  res.json({ success: true, message: "User", user: publicUser(user) });
});