import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    productId: { type: Number, required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

reviewSchema.index({ productId: 1, user: 1 }, { unique: true });

export const Review = model("Review", reviewSchema);
