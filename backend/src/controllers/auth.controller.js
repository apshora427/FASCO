import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import { User } from "../models/user.model.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEmailChangeVerification,
} from "../utils/mailer.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])[a-zA-Z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{6,12}$/;
const nameRegex = /^[a-zA-Z]+(?:[-'\s][a-zA-Z]+)*$/;
const CODE_TTL_MINUTES = 10;
const CODE_MAX_ATTEMPTS = 5;
const googleClient = new OAuth2Client();

const newCode = (purpose) => ({
  verifyCode: crypto.randomInt(100000, 1000000).toString(),
  verifyCodeExpires: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
  verifyCodePurpose: purpose,
  verifyCodeAttempts: 0,
  verifyCodeLockedUntil: undefined,
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
  jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion || 0,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

const getCodeUser = async ({ email, code, purpose }) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const cleanCode = String(code || "").trim();

  if (!emailRegex.test(normalizedEmail) || !/^\d{6}$/.test(cleanCode)) {
    throw new ApiError(400, "A valid email and 6-digit code are required");
  }

  const user = await User.findOne({
    email: normalizedEmail,
    verifyCodePurpose: purpose,
  }).select("+verifyCode +verifyCodeExpires +verifyCodeAttempts +verifyCodeLockedUntil");

  if (!user) throw new ApiError(401, "Invalid or expired confirmation code");
  if (user.verifyCodeLockedUntil && user.verifyCodeLockedUntil > new Date()) {
    throw new ApiError(429, "Too many incorrect codes. Request a new code and try again.");
  }
  if (!user.verifyCodeExpires || user.verifyCodeExpires <= new Date()) {
    throw new ApiError(401, "Confirmation code expired. Request a new code.");
  }

  if (user.verifyCode !== cleanCode) {
    const attempts = (user.verifyCodeAttempts || 0) + 1;
    const lockedUntil =
      attempts >= CODE_MAX_ATTEMPTS
        ? new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000)
        : undefined;
    await User.updateOne(
      { _id: user._id },
      {
        $inc: { verifyCodeAttempts: 1 },
        ...(lockedUntil ? { $set: { verifyCodeLockedUntil: lockedUntil } } : {}),
      }
    );
    if (lockedUntil) {
      throw new ApiError(429, "Too many incorrect codes. Request a new code and try again.");
    }
    throw new ApiError(401, "Invalid or expired confirmation code");
  }

  return user;
};

const codeRequest = (req) => ({
  email: req.body?.email,
  code: req.body?.code,
});

const activeCodeFilter = (user, purpose) => {
  const now = new Date();
  return {
    _id: user._id,
    verifyCode: user.verifyCode,
    verifyCodePurpose: purpose,
    verifyCodeExpires: { $gt: now },
    verifyCodeAttempts: { $lt: CODE_MAX_ATTEMPTS },
    $or: [
      { verifyCodeLockedUntil: { $exists: false } },
      { verifyCodeLockedUntil: { $lte: now } },
    ],
  };
};

// POST /register
export const register = asyncHandler(async (req, res) => {
  const { name = "", email = "", password = "", phone = "" } = req.body || {};
  const cleanName = String(name).trim();
  const normalizedEmail = String(email).trim().toLowerCase();

  if (!cleanName || !normalizedEmail || !password) {
    throw new ApiError(400, "All fields are required");
  }
  if (!nameRegex.test(cleanName)) throw new ApiError(400, "Name contains invalid characters");
  if (!emailRegex.test(normalizedEmail)) throw new ApiError(400, "Invalid email address");
  if (typeof password !== "string" || !passwordRegex.test(password)) {
    throw new ApiError(400, "Password must be 6–12 characters and include an uppercase letter, a lowercase letter, a number, and a special character");
  }

  const user = await User.create({
    name: cleanName,
    email: normalizedEmail,
    password: await bcrypt.hash(password, 10),
    phone: String(phone).trim(),
    ...newCode("signup"),
  });

  const { delivered, code } = await sendVerificationEmail({
    to: user.email,
    name: user.name,
    code: user.verifyCode,
  });

  res.status(201).json({
    success: true,
    message: "Confirmation code sent to your email",
    data: { email: user.email },
    ...(!delivered && code && !env.isProduction ? { devCode: code } : {}),
  });
});

// POST /verify
export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await getCodeUser({ ...codeRequest(req), purpose: "signup" });
  if (user.isVerified) throw new ApiError(400, "User already verified");

  const result = await User.updateOne(
    { ...activeCodeFilter(user, "signup"), isVerified: false },
    {
      $set: { isVerified: true, verifyCodeAttempts: 0 },
      $unset: {
        verifyCode: 1,
        verifyCodeExpires: 1,
        verifyCodePurpose: 1,
        verifyCodeLockedUntil: 1,
      },
    }
  );
  if (!result.modifiedCount) throw new ApiError(401, "Invalid or expired confirmation code");
  res.json({ success: true, message: "Email verification successful" });
});

// POST /verify-reset-code
export const verifyResetCode = asyncHandler(async (req, res) => {
  await getCodeUser({ ...codeRequest(req), purpose: "reset" });
  res.json({ success: true, message: "Reset code verified" });
});

// POST /revarify-email
export const resendCode = asyncHandler(async (req, res) => {
  const normalizedEmail = String(req.body?.email || "").trim().toLowerCase();
  if (!emailRegex.test(normalizedEmail)) throw new ApiError(400, "A valid email is required");

  const user = await User.findOne({ email: normalizedEmail });
  if (!user || user.isVerified) {
    res.json({ success: true, message: "If the account can receive a code, one has been sent." });
    return;
  }

  Object.assign(user, newCode("signup"));
  await user.save();
  const { delivered, code } = await sendVerificationEmail({
    to: user.email,
    name: user.name,
    code: user.verifyCode,
  });
  res.json({
    success: true,
    message: "Confirmation code resent — please check your email",
    ...(!delivered && code && !env.isProduction ? { devCode: code } : {}),
  });
});

// POST /login
export const login = asyncHandler(async (req, res) => {
  const normalizedEmail = String(req.body?.email || "").trim().toLowerCase();
  const password = req.body?.password;
  const requestedRole = req.body?.role;
  if (
    !emailRegex.test(normalizedEmail) ||
    typeof password !== "string" ||
    !["user", "admin"].includes(requestedRole)
  ) {
    throw new ApiError(400, "Email, password, and account type are required");
  }

  const user = await User.findOne({ email: normalizedEmail }).select("+password +tokenVersion");
  const passwordMatches = user?.password
    ? await bcrypt.compare(password, user.password)
    : false;
  if (!passwordMatches) throw new ApiError(401, "Invalid email or password");
  if (user.role !== requestedRole) {
    throw new ApiError(403, `These credentials do not belong to a ${requestedRole === "admin" ? "administrator" : "customer"} account`);
  }
  if (!user.isVerified) {
    throw new ApiError(403, "Email not verified — check your confirmation code");
  }

  res.json({
    success: true,
    message: "Successfully logged in",
    userInfo: { ...publicUser(user), accesstoken: signToken(user) },
  });
});

// POST /forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const normalizedEmail = String(req.body?.email || "").trim().toLowerCase();
  if (!emailRegex.test(normalizedEmail)) throw new ApiError(400, "A valid email is required");

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    res.json({ success: true, message: "If an account exists for that email, a reset code has been sent." });
    return;
  }

  Object.assign(user, newCode("reset"));
  await user.save();
  const { delivered, code } = await sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    code: user.verifyCode,
  });
  res.json({
    success: true,
    message: "If an account exists for that email, a reset code has been sent.",
    ...(!delivered && code && !env.isProduction ? { devCode: code } : {}),
  });
});

// POST /setnew-password
export const setNewPassword = asyncHandler(async (req, res) => {
  const { newPassword = "", confirmPassword = "" } = req.body || {};
  const user = await getCodeUser({ ...codeRequest(req), purpose: "reset" });

  if (newPassword !== confirmPassword) throw new ApiError(400, "Passwords do not match");
  if (typeof newPassword !== "string" || !passwordRegex.test(newPassword)) {
    throw new ApiError(400, "Password must be 6–12 characters and include an uppercase letter, a lowercase letter, a number, and a special character");
  }

  const result = await User.updateOne(
    {
      ...activeCodeFilter(user, "reset"),
    },
    {
      $set: {
        password: await bcrypt.hash(newPassword, 10),
        isVerified: true,
        verifyCodeAttempts: 0,
      },
      $inc: { tokenVersion: 1 },
      $unset: {
        verifyCode: 1,
        verifyCodeExpires: 1,
        verifyCodePurpose: 1,
        verifyCodeLockedUntil: 1,
      },
    }
  );
  if (!result.modifiedCount) throw new ApiError(401, "Invalid or expired reset code");
  res.json({ success: true, message: "Successfully changed the password" });
});

// POST /google
export const googleLogin = asyncHandler(async (req, res) => {
  if (!env.googleClientId) throw new ApiError(503, "Google sign-in is not configured");
  const idToken = req.body?.credential;
  const requestedRole = req.body?.role;
  if (!["user", "admin"].includes(requestedRole)) {
    throw new ApiError(400, "Account type is required");
  }
  if (typeof idToken !== "string" || !idToken) throw new ApiError(400, "Google credential is required");

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.googleClientId,
    });
    payload = ticket.getPayload();
  } catch {
    throw new ApiError(401, "Google sign-in could not be verified");
  }

  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    throw new ApiError(401, "Google sign-in requires a verified email address");
  }

  let user = await User.findOne({ googleSubject: payload.sub }).select("+googleSubject +tokenVersion");
  if (!user) {
    const email = payload.email.toLowerCase();
    if (await User.exists({ email })) {
      throw new ApiError(409, "An account with this email already exists. Sign in with your password first.");
    }
    if (requestedRole !== "user") {
      throw new ApiError(403, "Administrator accounts must be provisioned by an existing administrator.");
    }
    user = await User.create({
      name: payload.name || payload.email.split("@")[0],
      email,
      googleSubject: payload.sub,
      avatar: payload.picture || "",
      isVerified: true,
    });
  }
  if (user.role !== requestedRole) {
    throw new ApiError(403, `This Google account does not belong to a ${requestedRole === "admin" ? "administrator" : "customer"} account`);
  }

  res.json({
    success: true,
    message: "Successfully signed in with Google",
    userInfo: { ...publicUser(user), accesstoken: signToken(user) },
  });
});

// POST /logout
export const logout = asyncHandler(async (req, res) => {
  await User.updateOne(
    { _id: req.user.id, tokenVersion: req.user.tokenVersion },
    { $inc: { tokenVersion: 1 } }
  );
  res.json({ success: true, message: "Logged out successfully" });
});

// GET /me
export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, message: "User", user: publicUser(user) });
});

// PATCH /profile
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("+tokenVersion");
  if (!user) throw new ApiError(404, "User not found");

  const updates = {};
  if (req.body?.name !== undefined) {
    const name = String(req.body.name).trim();
    if (!nameRegex.test(name)) throw new ApiError(400, "Name contains invalid characters");
    updates.name = name;
  }
  if (req.body?.phone !== undefined) {
    const phone = String(req.body.phone).trim();
    if (phone.length > 32 || (phone && !/^[+()\d\s.-]+$/.test(phone))) {
      throw new ApiError(400, "Enter a valid phone number");
    }
    updates.phone = phone;
  }
  if (req.body?.avatar !== undefined) {
    const avatar = req.body.avatar;
    if (avatar === "") {
      updates.avatar = "";
    } else if (typeof avatar === "string") {
      const match = avatar.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
      if (!match || avatar.length > 82_000) {
        throw new ApiError(400, "Profile photo must be a JPEG, PNG, or WebP image smaller than 60 KB");
      }
      const bytes = Buffer.from(match[2], "base64");
      const validSignature =
        (match[1] === "jpeg" && bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) ||
        (match[1] === "png" && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) ||
        (match[1] === "webp" && bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP");
      if (bytes.length > 60 * 1024 || !validSignature) {
        throw new ApiError(400, "Profile photo must be a valid JPEG, PNG, or WebP image smaller than 60 KB");
      }
      updates.avatar = avatar;
    } else {
      throw new ApiError(400, "Invalid profile photo");
    }
  }

  Object.assign(user, updates);
  await user.save();
  res.json({ success: true, message: "Profile updated", user: publicUser(user) });
});

// POST /profile/email/request
export const requestEmailChange = asyncHandler(async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!emailRegex.test(email)) throw new ApiError(400, "Enter a valid email address");

  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, "User not found");
  if (email === user.email) throw new ApiError(400, "That is already your email address");
  if (await User.exists({ email })) throw new ApiError(409, "An account with this email already exists");

  const code = crypto.randomInt(100000, 1000000).toString();
  user.emailChangeCode = code;
  user.emailChangeTarget = email;
  user.emailChangeCodeExpires = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);
  user.emailChangeCodeAttempts = 0;
  user.emailChangeCodeLockedUntil = undefined;
  await user.save();

  const delivery = await sendEmailChangeVerification({ to: email, name: user.name, code });
  res.json({
    success: true,
    message: "A confirmation code has been sent to your new email address",
    ...(!delivery.delivered && delivery.code && !env.isProduction ? { devCode: code } : {}),
  });
});

// POST /profile/email/verify
export const verifyEmailChange = asyncHandler(async (req, res) => {
  const code = String(req.body?.code || "").trim();
  if (!/^\d{6}$/.test(code)) throw new ApiError(400, "Enter the 6-digit confirmation code");
  const user = await User.findById(req.user.id)
    .select("+tokenVersion +emailChangeCode +emailChangeTarget +emailChangeCodeExpires +emailChangeCodeAttempts +emailChangeCodeLockedUntil");
  if (!user) throw new ApiError(404, "User not found");

  const now = new Date();
  if (!user.emailChangeCode || !user.emailChangeTarget || !user.emailChangeCodeExpires || user.emailChangeCodeExpires <= now) {
    throw new ApiError(401, "Confirmation code expired. Request a new code.");
  }
  if (user.emailChangeCodeLockedUntil && user.emailChangeCodeLockedUntil > now) {
    throw new ApiError(429, "Too many incorrect codes. Request a new code and try again.");
  }
  if (user.emailChangeCode !== code) {
    user.emailChangeCodeAttempts = (user.emailChangeCodeAttempts || 0) + 1;
    if (user.emailChangeCodeAttempts >= CODE_MAX_ATTEMPTS) {
      user.emailChangeCodeLockedUntil = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);
    }
    await user.save();
    if (user.emailChangeCodeLockedUntil) {
      throw new ApiError(429, "Too many incorrect codes. Request a new code and try again.");
    }
    throw new ApiError(401, "Invalid confirmation code");
  }

  user.email = user.emailChangeTarget;
  user.emailChangeCode = undefined;
  user.emailChangeTarget = undefined;
  user.emailChangeCodeExpires = undefined;
  user.emailChangeCodeAttempts = 0;
  user.emailChangeCodeLockedUntil = undefined;
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();

  res.json({
    success: true,
    message: "Email address updated",
    user: publicUser(user),
    accesstoken: signToken(user),
  });
});

// POST /profile/password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword = "", newPassword = "", confirmPassword = "" } = req.body || {};
  if (typeof currentPassword !== "string" || !currentPassword) {
    throw new ApiError(400, "Enter your current password");
  }
  if (newPassword !== confirmPassword) throw new ApiError(400, "Passwords do not match");
  if (typeof newPassword !== "string" || !passwordRegex.test(newPassword)) {
    throw new ApiError(400, "Password must be 6–12 characters and include an uppercase letter, a lowercase letter, a number, and a special character");
  }

  const user = await User.findById(req.user.id).select("+password +tokenVersion");
  if (!user) throw new ApiError(404, "User not found");
  if (!user.password || !(await bcrypt.compare(currentPassword, user.password))) {
    throw new ApiError(401, "Current password is incorrect. Google accounts can set a password using password recovery.");
  }
  if (await bcrypt.compare(newPassword, user.password)) {
    throw new ApiError(400, "Choose a password you have not used before");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();
  res.json({
    success: true,
    message: "Password updated",
    user: publicUser(user),
    accesstoken: signToken(user),
  });
});
