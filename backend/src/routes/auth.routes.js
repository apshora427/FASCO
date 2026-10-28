import { Router } from "express";
import {
  register,
  verifyEmail,
  verifyResetCode,
  resendCode,
  login,
  forgotPassword,
  setNewPassword,
  googleLogin,
  logout,
  me,
  updateProfile,
  requestEmailChange,
  verifyEmailChange,
  changePassword,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  authRateLimit,
  loginRateLimit,
  registrationRateLimit,
  verificationRateLimit,
  resendRateLimit,
  resetRequestRateLimit,
  passwordResetRateLimit,
} from "../middleware/authRateLimit.js";

export const authRouter = Router();

authRouter.post("/register", authRateLimit, registrationRateLimit, register);
authRouter.post("/verify", authRateLimit, verificationRateLimit, verifyEmail);
authRouter.post("/verify-reset-code", authRateLimit, verificationRateLimit, verifyResetCode);
authRouter.post("/revarify-email", authRateLimit, resendRateLimit, resendCode);
authRouter.post("/login", authRateLimit, loginRateLimit, login);
authRouter.post("/forgot-password", authRateLimit, resetRequestRateLimit, forgotPassword);
authRouter.post("/setnew-password", authRateLimit, passwordResetRateLimit, setNewPassword);
authRouter.post("/google", authRateLimit, loginRateLimit, googleLogin);
authRouter.post("/logout", authRateLimit, requireAuth, logout);
authRouter.get("/me", authRateLimit, requireAuth, me);
authRouter.patch("/profile", authRateLimit, requireAuth, updateProfile);
authRouter.post("/profile/email/request", authRateLimit, requireAuth, resendRateLimit, requestEmailChange);
authRouter.post("/profile/email/verify", authRateLimit, requireAuth, verificationRateLimit, verifyEmailChange);
authRouter.post("/profile/password", authRateLimit, requireAuth, passwordResetRateLimit, changePassword);