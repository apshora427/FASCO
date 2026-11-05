import { Schema, model } from "mongoose";

const recommendationEventSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Number, required: true },
    category: { type: String, required: true, trim: true },
    eventType: { type: String, enum: ["view", "cart", "wishlist"], required: true },
    count: { type: Number, default: 0, min: 0 },
    lastInteraction: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

recommendationEventSchema.index({ user: 1, productId: 1, eventType: 1 }, { unique: true });
recommendationEventSchema.index({ productId: 1, lastInteraction: -1 });

export const RecommendationEvent = model("RecommendationEvent", recommendationEventSchema);
