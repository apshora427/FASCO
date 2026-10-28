import { Router } from "express";
import { getStats } from "../controllers/dashboard.controller.js";
import { getUsers, updateUserRole, deleteUser } from "../controllers/user.controller.js";
import { getCoupons } from "../controllers/coupon.controller.js";
import { getSubscribers } from "../controllers/subscriber.controller.js";
import { getOrders } from "../controllers/order.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

export const dashboardRouter = Router();

// dashboard-only endpoints: overview stats + the account management tables
dashboardRouter.get("/dashboard/stats", requireAuth, requireAdmin, getStats)
dashboardRouter.get("/users", requireAuth, requireAdmin, getUsers)
dashboardRouter.get("/coupons", requireAuth, requireAdmin, getCoupons)
dashboardRouter.get("/subscribers", requireAuth, requireAdmin, getSubscribers)
dashboardRouter.get("/orders", requireAuth, requireAdmin, getOrders);
dashboardRouter.patch("/user/:id/role", requireAuth, requireAdmin, updateUserRole);
dashboardRouter.delete("/user/:id", requireAuth, requireAdmin, deleteUser);