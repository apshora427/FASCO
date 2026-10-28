import { Router } from "express";
import { subscribe, getSubscribers, deleteSubscriber } from "../controllers/subscriber.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

export const subscriberRouter = Router();

// the newsletter box is public; the subscriber list lives in the dashboard
subscriberRouter.post("/subscribe", subscribe);
subscriberRouter.get("/subscriber", requireAuth, requireAdmin, getSubscribers)
subscriberRouter.post("/subscriber", requireAuth, requireAdmin, subscribe);
subscriberRouter.delete("/subscriber/:id", requireAuth, requireAdmin, deleteSubscriber);