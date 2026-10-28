import { Router } from "express";
import {
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  validateCoupon,
} from "../controllers/order.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

export const orderRouter = Router();

// Order history is customer-scoped; order management is admin-only.
orderRouter.get("/my-orders", requireAuth, getMyOrders);
orderRouter.get("/order", requireAuth, requireAdmin, getOrders)
orderRouter.get("/order/:id", requireAuth, requireAdmin, getOrderById);
orderRouter.patch("/order/:id/status", requireAuth, requireAdmin, updateOrderStatus);
orderRouter.post("/coupon/validate", validateCoupon);