import { Router } from "express";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "../controllers/coupon.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

export const couponRouter = Router();

// discount codes are managed entirely from the dashboard
couponRouter.get("/coupon", requireAuth, requireAdmin, getCoupons)
couponRouter.post("/coupon", requireAuth, requireAdmin, createCoupon);
couponRouter.post("/coupon", requireAuth, requireAdmin, createCoupon);
couponRouter.put("/coupon/:id", requireAuth, requireAdmin, updateCoupon);
couponRouter.delete("/coupon/:id", requireAuth, requireAdmin, deleteCoupon);