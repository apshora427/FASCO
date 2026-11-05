import { Schema, model } from "mongoose";

const stripeWebhookEventSchema = new Schema(
  {
    eventId: { type: String, required: true, unique: true },
    eventType: { type: String, required: true },
    eventData: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ["processing", "processed", "failed"],
      default: "processing",
      index: true,
    },
    attempts: { type: Number, default: 1 },
    leaseId: { type: String, default: "" },
    leaseUntil: { type: Date, default: null },
    nextAttemptAt: { type: Date, default: null, index: true },
    lastError: { type: String, default: "" },
    receivedAt: { type: Date, default: Date.now },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const StripeWebhookEvent = model("StripeWebhookEvent", stripeWebhookEventSchema);
