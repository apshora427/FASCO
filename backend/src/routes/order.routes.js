import { Router } from "express";
import {
  placeOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  validateCoupon,
} from "../controllers/order.controller.js";
import { requireAuth, requireAdmin, optionalAuth } from "../middleware/auth.middleware.js";

export const orderRouter = Router();

// checkout is public (guest checkout by design) but links the buyer when a
// token is present; management endpoints are admin-only.
orderRouter.post("/order", optionalAuth, placeOrder);
orderRouter.get("/order", requireAuth, requireAdmin, getOrders)
orderRouter.post("/order", optionalAuth, placeOrder);
orderRouter.get("/order/:id", requireAuth, requireAdmin, getOrderById);
orderRouter.patch("/order/:id/status", requireAuth, requireAdmin, updateOrderStatus);
orderRouter.post("/coupon/validate", validateCoupon);