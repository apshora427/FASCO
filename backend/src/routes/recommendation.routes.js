import { Router } from "express";
import { getRecommendations, trackRecommendationEvent } from "../controllers/recommendation.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const recommendationRouter = Router();

recommendationRouter.get("/recommendations", requireAuth, getRecommendations);
recommendationRouter.post("/recommendations/events", requireAuth, trackRecommendationEvent);
