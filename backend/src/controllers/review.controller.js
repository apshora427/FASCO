import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const parseProductId = (value) => {
  if (!/^\d+$/.test(value)) throw new ApiError(400, "Product id must be a number");
  return Number(value);
};

export const getProductReviews = asyncHandler(async (req, res) => {
  const productId = parseProductId(req.params.id);
  if (!(await Product.exists({ id: productId }))) throw new ApiError(404, "Product not found");
  const reviews = await Review.find({ productId })
    .sort({ createdAt: -1 })
    .populate("user", "name");
  res.json({
    success: true,
    message: reviews.length ? "Product reviews" : "No reviews yet",
    reviews: reviews.map((review) => ({
      _id: review._id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      name: review.user?.name || "Customer",
    })),
  });
});

export const createProductReview = asyncHandler(async (req, res) => {
  const productId = parseProductId(req.params.id);
  if (req.user.role !== "user") throw new ApiError(403, "Only customer accounts can submit reviews");
  const rating = Number(req.body?.rating);
  const comment = typeof req.body?.comment === "string" ? req.body.comment.trim() : "";
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be a whole number from 1 to 5");
  }
  if (!comment || comment.length > 1000) {
    throw new ApiError(400, "Review must be between 1 and 1000 characters");
  }

  const product = await Product.findOne({ id: productId });
  if (!product) throw new ApiError(404, "Product not found");
  const deliveredOrder = await Order.exists({
    user: req.user.id,
    status: "delivered",
    "items.productId": productId,
  });
  if (!deliveredOrder) {
    throw new ApiError(403, "You can review a product after its order is delivered");
  }
  if (await Review.exists({ productId, user: req.user.id })) {
    throw new ApiError(409, "You have already reviewed this product");
  }

  let review;
  try {
    review = await Review.create({ productId, user: req.user.id, rating, comment });
  } catch (error) {
    if (error?.code === 11000) throw new ApiError(409, "You have already reviewed this product");
    throw error;
  }
  const [aggregate, reviewCount] = await Promise.all([
    Review.aggregate([
      { $match: { productId } },
      { $group: { _id: null, average: { $avg: "$rating" } } },
    ]),
    Review.countDocuments({ productId }),
  ]);
  product.rating = Math.round(aggregate[0].average * 10) / 10;
  product.reviews = `(${reviewCount})`;
  await product.save();

  const user = await User.findById(req.user.id).select("name");
  res.status(201).json({
    success: true,
    message: "Review submitted",
    review: {
      _id: review._id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      name: user?.name || "Customer",
    },
    product: { id: product.id, rating: product.rating, reviews: product.reviews },
  });
});
