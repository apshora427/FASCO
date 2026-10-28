import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /category — public list; the frontend maps categoryName into its pills.
export const getCategories = asyncHandler(async (_req, res) => {
  const category = await Category.find().sort({ categoryName: 1 });
  res.json({ success: true, message: category.length ? "Categories" : "No categories found", category });
});

// POST /category — admin: add a category.
export const createCategory = asyncHandler(async (req, res) => {
  const { categoryName = "" } = req.body || {};
  const name = String(categoryName).trim();
  if (!name) throw new ApiError(400, "Category name is required");

  if (await Category.exists({ categoryName: name })) throw new ApiError(409, "Category already exists");

  const category = await Category.create({ categoryName: name });
  res.status(201).json({ success: true, message: "Category created", category });
});

// PUT /category/:id — admin: rename a category (and its products' field).
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { categoryName = "" } = req.body || {};
  const name = String(categoryName).trim();
  if (!name) throw new ApiError(400, "Category name is required");

  const category = await Category.findById(id);
  if (!category) throw new ApiError(404, "Category not found");

  const previous = category.categoryName;
  if (previous !== name) {
    if (await Category.exists({ categoryName: name })) throw new ApiError(409, "Category already exists");

    category.categoryName = name;
    await category.save();
    // keep products consistent so storefront filters keep finding them
    await Product.updateMany({ category: previous }, { $set: { category: name } });
  }

  res.json({ success: true, message: "Category updated", category });
});

// DELETE /category/:id — admin: remove a category that no products use.
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) throw new ApiError(404, "Category not found");

  const inUse = await Product.countDocuments({ category: category.categoryName });
  if (inUse > 0) {
    throw new ApiError(400, `Cannot delete — ${inUse} product(s) still use this category`);
  }

  await category.deleteOne();
  res.json({ success: true, message: "Category deleted" });
});