import { Schema, model } from "mongoose";

// Store categories (the filter pills on /shop and the product form's select).
// Kept as its own collection so the dashboard can rename/delete them, exactly
// like the guide project's category model.
const categorySchema = new Schema(
  {
    categoryName: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

export const Category = model("Category", categorySchema);