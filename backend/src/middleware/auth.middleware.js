import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

// Verifies the access token issued at login. The frontend sends it raw in the
// Authorization header (same convention as the guide project) and the decoded
// payload lands on req.user for controllers to scope by.
export const requireAuth = async (req, _res, next) => {
  const token = req.headers.authorization || req.headers.Authorization;

  if (!token) {
    return next(new ApiError(401, "Token not found!"));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
    return;
  }

  const user = await User.findById(decoded.id).select("+tokenVersion role isVerified");
  const tokenVersion = user?.tokenVersion || 0;
  if (!user || !user.isVerified || (decoded.tokenVersion ?? 0) !== tokenVersion) {
    next(new ApiError(401, "Session is no longer valid"));
    return;
  }

  req.user = { ...decoded, role: user.role, tokenVersion };
  next();
};

// Attaches req.user when a valid token is present, but never rejects — used
// by checkout so a signed-in customer's order is linked while guests pass through.
export const optionalAuth = async (req, _res, next) => {
  const token = req.headers.authorization || req.headers.Authorization;
  if (!token) {
    next();
    return;
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch {
    next();
    return;
  }

  const user = await User.findById(decoded.id).select("+tokenVersion role isVerified");
  if (
    user?.isVerified &&
    (decoded.tokenVersion ?? 0) === (user.tokenVersion || 0)
  ) {
    req.user = { ...decoded, role: user.role, tokenVersion: user.tokenVersion || 0 };
  }
  next();
};

// Guard for every dashboard endpoint — runs after requireAuth.
export const requireAdmin = (req, _res, next) => {
  if (req.user?.role !== "admin") {
    return next(new ApiError(403, "Admin access only"));
  }
  next();
};