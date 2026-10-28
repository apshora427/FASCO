import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

export const productRouter = Router();

// public reads…
productRouter.get("/product", getProducts);
productRouter.get("/product/:id", getProductById);

// …admin-only writes (the dashboard sends its access token in Authorization)
productRouter.post("/product/create", requireAuth, requireAdmin, createProduct);
productRouter.put("/product/:id", requireAuth, requireAdmin, updateProduct);
productRouter.delete("/product/:id", requireAuth, requireAdmin, deleteProduct);