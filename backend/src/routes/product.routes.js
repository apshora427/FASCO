import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import { createProductReview, getProductReviews } from "../controllers/review.controller.js";
import { uploadProductImage } from "../controllers/productImage.controller.js";
import { productImageUpload } from "../middleware/productImageUpload.js";

export const productRouter = Router();

// public reads…
productRouter.get("/product", getProducts);
productRouter.get("/product/:id/reviews", getProductReviews);
productRouter.post("/product/:id/reviews", requireAuth, createProductReview);
productRouter.get("/product/:id", getProductById);

// …admin-only writes (the dashboard sends its access token in Authorization)
productRouter.post("/product/create", requireAuth, requireAdmin, createProduct);
productRouter.post(
  "/product/upload-image",
  requireAuth,
  requireAdmin,
  productImageUpload.single("image"),
  uploadProductImage
);
productRouter.put("/product/:id", requireAuth, requireAdmin, updateProduct);
productRouter.delete("/product/:id", requireAuth, requireAdmin, deleteProduct);