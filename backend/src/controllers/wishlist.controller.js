import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("wishlistIds");
  if (!user) throw new ApiError(404, "Account not found");
  res.json({ success: true, message: "Wishlist", wishlistIds: user.wishlistIds });
});

export const updateWishlist = asyncHandler(async (req, res) => {
  const { wishlistIds } = req.body || {};
  if (
    !Array.isArray(wishlistIds) ||
    wishlistIds.length > 500 ||
    wishlistIds.some((id) => !Number.isSafeInteger(id) || id < 1)
  ) {
    throw new ApiError(400, "Wishlist must contain valid product IDs");
  }

  const uniqueIds = [...new Set(wishlistIds)];
  const availableCount = await Product.countDocuments({ id: { $in: uniqueIds } });
  if (availableCount !== uniqueIds.length) {
    throw new ApiError(400, "Wishlist contains a product that is no longer available");
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: { wishlistIds: uniqueIds } },
    { returnDocument: "after" }
  ).select("wishlistIds");
  if (!user) throw new ApiError(404, "Account not found");
  res.json({ success: true, message: "Wishlist updated", wishlistIds: user.wishlistIds });
});
