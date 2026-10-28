import rateLimit from "express-rate-limit";

const createLimiter = (limit, message) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

export const authRateLimit = createLimiter(
  120,
  "Too many authentication requests. Please try again later."
);

export const loginRateLimit = createLimiter(
  10,
  "Too many sign-in attempts. Please try again in 15 minutes."
);

export const registrationRateLimit = createLimiter(
  5,
  "Too many registration attempts. Please try again in 15 minutes."
);

export const verificationRateLimit = createLimiter(
  10,
  "Too many code verification attempts. Please try again in 15 minutes."
);

export const resendRateLimit = createLimiter(
  5,
  "Too many verification code requests. Please try again in 15 minutes."
);

export const resetRequestRateLimit = createLimiter(
  5,
  "Too many password reset requests. Please try again in 15 minutes."
);

export const passwordResetRateLimit = createLimiter(
  10,
  "Too many password reset attempts. Please try again in 15 minutes."
);
