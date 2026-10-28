import { Schema, model } from "mongoose";

// Mirrors the product objects the frontend renders (frontend/src/data/products.js):
// the API returns documents with this numeric `id`, so carts/wishlists/routes that
// key on product.id keep working unchanged.
const productSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 }, // struck-through price on sale items
    discount: { type: String, trim: true }, // badge text, e.g. "50% OFF"
    brand: { type: String, trim: true, default: "Al Karam" },
    rating: { type: Number, min: 0, max: 5, default: 5 },
    reviews: { type: String, trim: true, default: "(0)" },
    tag: { type: String, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    // image key (e.g. "arrival-1") resolved by the frontend asset registry,
    // or an absolute URL / path for future admin uploads
    image: { type: String, required: true, trim: true },
    images: [{ type: String, trim: true }], // optional gallery override
    sizes: [{ type: String, trim: true }], // optional — page derives defaults when empty
    colors: [{ type: String, trim: true }],
    stock: { type: Number, min: 0 },
    arrival: { type: Boolean, default: false }, // part of the New Arrivals rail
  },
  { timestamps: true }
);

export const Product = model("Product", productSchema);