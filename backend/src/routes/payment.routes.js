import { Router } from "express";
import { createCheckoutSession, getPaymentConfig } from "../controllers/payment.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

export const paymentRouter = Router();

paymentRouter.get("/payment/config", getPaymentConfig);
paymentRouter.post("/payment/checkout-session", optionalAuth, createCheckoutSession);
