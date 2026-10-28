import { Schema, model } from "mongoose";

// Newsletter signups from the home/shop footer — one entry per inbox.
const subscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    source: { type: String, trim: true, default: "newsletter" },
  },
  { timestamps: true }
);

export const Subscriber = model("Subscriber", subscriberSchema);