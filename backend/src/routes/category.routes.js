import { Router } from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

export const categoryRouter = Router();

// reads are public (shop filter pills); writes are admin-only
categoryRouter.get("/category", getCategories);
categoryRouter.post("/category", requireAuth, requireAdmin, createCategory);
categoryRouter.put("/category/:id", requireAuth, requireAdmin, updateCategory);
categoryRouter.delete("/category/:id", requireAuth, requireAdmin, deleteCategory);