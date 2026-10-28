import { Router } from "express";
import { getWishlist, updateWishlist } from "../controllers/wishlist.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const wishlistRouter = Router();

wishlistRouter.get("/wishlist", requireAuth, getWishlist);
wishlistRouter.put("/wishlist", requireAuth, updateWishlist);
