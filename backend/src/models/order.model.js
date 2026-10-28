import { Schema, model } from "mongoose";

// One checkout → one order. Prices are re-computed server-side from the
// catalogue at placement time (never trusted from the client), and no card
// data is ever stored — only the payment method label the demo checkout shows.
const orderItemSchema = new Schema(
  {
    productId: { type: Number, required: true },
    title: { type: String, required: true },
    image: { type: String, default: "" },
    category: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String, default: "" },
    color: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    items: {
      type: [orderItemSchema],
      validate: (v) => v.length > 0,
    },
    customer: {
      email: { type: String, required: true, lowercase: true, trim: true },
      firstName: { type: String, trim: true },
      lastName: { type: String, trim: true },
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      postal: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    paymentMethod: { type: String, default: "card" },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    discountCode: { type: String, trim: true, default: "" },
    shipping: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    // linked when a signed-in customer checks out; guests stay anonymous
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    isGuest: { type: Boolean, default: true },
    note: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export const Order = model("Order", orderSchema);