import { Router } from "express";
import {
  register,
  verifyEmail,
  resendCode,
  login,
  forgotPassword,
  setNewPassword,
  me,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const authRouter = Router();

// Endpoints match frontend/src/api/backend.js exactly (register / verify/:token /
// forgot-password / setnew-password/:token) plus login, resend and session restore.
authRouter.post("/register", register);
authRouter.post("/verify/:token", verifyEmail);
authRouter.post("/revarify-email", resendCode);
authRouter.post("/login", login);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/setnew-password/:token", setNewPassword);
authRouter.get("/me", requireAuth, me);