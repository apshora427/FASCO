import { Subscriber } from "../models/subscriber.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// POST /subscribe — the newsletter box anywhere on the storefront (public).
export const subscribe = asyncHandler(async (req, res) => {
  const { email = "" } = req.body || {};
  const normalized = String(email).toLowerCase().trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new ApiError(400, "Invalid Email");

  const existing = await Subscriber.findOne({ email: normalized });
  if (existing) return res.json({ success: true, message: "You're already subscribed" });

  await Subscriber.create({ email: normalized, source: req.body?.source || "newsletter" });
  res.status(201).json({ success: true, message: "Subscribed successfully" });
});

// GET /subscriber — admin: everyone who signed up.
export const getSubscribers = asyncHandler(async (_req, res) => {
  const subscribers = await Subscriber.find().sort({ createdAt: -1 });
  res.json({ success: true, message: subscribers.length ? "Subscribers" : "No subscribers yet", subscribers });
});

// DELETE /subscriber/:id — admin: remove an entry.
export const deleteSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
  if (!subscriber) throw new ApiError(404, "Subscriber not found");
  res.json({ success: true, message: "Subscriber removed" });
});