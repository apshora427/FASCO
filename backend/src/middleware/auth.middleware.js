import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

// Verifies the access token issued at login. The frontend sends it raw in the
// Authorization header (same convention as the guide project) and the decoded
// payload lands on req.user for controllers to scope by.
export const requireAuth = (req, _res, next) => {
  const token = req.headers.authorization || req.headers.Authorization;

  if (!token) {
    return next(new ApiError(401, "Token not found!"));
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
};

// Attaches req.user when a valid token is present, but never rejects — used
// by checkout so a signed-in customer's order is linked while guests pass through.
export const optionalAuth = (req, _res, next) => {
  const token = req.headers.authorization || req.headers.Authorization;
  if (token) {
    try {
      req.user = jwt.verify(token, env.jwtSecret);
    } catch {
      // ignore — treated as a guest
    }
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