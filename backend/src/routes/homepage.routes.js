import { Router } from "express";
import { getHomepage, updateHomepage } from "../controllers/homepage.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

export const homepageRouter = Router();

homepageRouter.get("/homepage", getHomepage);
homepageRouter.put("/homepage", requireAuth, requireAdmin, updateHomepage);
