import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Review } from "../models/review.model.js";
import { User } from "../models/user.model.js";

// GET /product — full catalogue, optionally filtered by ?category=.
// Same envelope as every endpoint: { success, message, ...payload }.
export const getProducts = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = category ? { category: String(category).trim() } : {};

  const products = await Product.find(filter).sort({ id: 1 });

  res.json({
    success: true,
    message: products.length ? "Products" : "No products found",
    products,
  });
});

// GET /product/:id — single product by its numeric catalogue id.
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    throw new ApiError(400, "Product id must be a number");
  }

  const product = await Product.findOne({ id: Number(id) });
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res.json({
    success: true,
    message: "Product",
    product,
  });
});

// Fields the dashboard product form may set. `id` is server-assigned so new
// items slot in after the existing catalogue (1..n) without collisions.
const pickFields = (body) => {
  const str = (v) => (v === null ? null : typeof v === "string" ? v.trim() : undefined);
  const num = (v) => (v === undefined ? undefined : v === null || v === "" ? null : Number(v));
  const strArray = (v) =>
    Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean) : undefined;

  const fields = {
    title: str(body.title),
    brand: str(body.brand),
    category: str(body.category),
    image: str(body.image),
    tag: str(body.tag),
    discount: str(body.discount),
    price: num(body.price),
    originalPrice: num(body.originalPrice),
    rating: num(body.rating),
    stock: num(body.stock),
    reviews: str(body.reviews),
    images: strArray(body.images),
    sizes: strArray(body.sizes),
    colors: strArray(body.colors),
    arrival: typeof body.arrival === "boolean" ? body.arrival : undefined,
  };
  return Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
};

const validateProductFields = async (fields, { creating = false } = {}) => {
  if (creating) {
    for (const key of ["title", "price", "category", "image"]) {
      if (fields[key] === undefined || fields[key] === "") {
        throw new ApiError(400, `${key} is required`);
      }
    }
  }

  if (fields.title !== undefined && (!fields.title || fields.title.length > 160)) {
    throw new ApiError(400, "Product title must be between 1 and 160 characters");
  }
  if (fields.image !== undefined) {
    const imageIsSafe =
      fields.image.length <= 2048 &&
      !/^javascript:/i.test(fields.image) &&
      (!/^https?:/i.test(fields.image) || /^https?:\/\/\S+$/i.test(fields.image));
    if (!fields.image || !imageIsSafe) throw new ApiError(400, "A valid product image source is required");
  }

  for (const key of ["price", "originalPrice", "rating", "stock"]) {
    if (fields[key] === undefined) continue;
    if (key === "originalPrice" && fields[key] === null) continue;
    if (!Number.isFinite(fields[key])) throw new ApiError(400, `${key} must be a valid number`);
    if (key === "stock" && (!Number.isInteger(fields[key]) || fields[key] < 0)) {
      throw new ApiError(400, "Stock must be a non-negative whole number");
    }
    if (key === "price" && fields[key] < 0) throw new ApiError(400, "Price cannot be negative");
    if (key === "originalPrice" && fields[key] < 0) {
      throw new ApiError(400, "Original price cannot be negative");
    }
    if (key === "rating" && (fields[key] < 0 || fields[key] > 5)) {
      throw new ApiError(400, "Rating must be between 0 and 5");
    }
  }
  if (
    fields.price !== undefined &&
    fields.originalPrice !== undefined &&
    fields.originalPrice < fields.price
  ) {
    throw new ApiError(400, "Original price cannot be lower than the current price");
  }
  if (fields.category !== undefined) {
    const category = await Category.findOne({ categoryName: fields.category });
    if (!category) throw new ApiError(400, "Select a valid product category");
  }
  for (const key of ["images", "sizes", "colors"]) {
    if (fields[key] && fields[key].some((value) => value.length > 2048)) {
      throw new ApiError(400, `${key} entries must be 2048 characters or fewer`);
    }
  }
};

// POST /product/create — admin: add a product (auto id, validated essentials).
export const createProduct = asyncHandler(async (req, res) => {
  const fields = pickFields(req.body || {});
  await validateProductFields(fields, { creating: true });

  const last = await Product.findOne().sort({ id: -1 });
  const product = await Product.create({ ...fields, id: (last?.id ?? 0) + 1 });

  res.status(201).json({ success: true, message: "Product created", product });
});

// PUT /product/:id — admin: edit any part of a product.
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!/^\d+$/.test(id)) throw new ApiError(400, "Product id must be a number");

  const product = await Product.findOne({ id: Number(id) });
  if (!product) throw new ApiError(404, "Product not found");

  const fields = pickFields(req.body || {});
  await validateProductFields(fields);
  if (Object.keys(fields).length === 0) throw new ApiError(400, "Provide at least one product field to update");

  Object.assign(product, fields);
  await product.save();

  res.json({ success: true, message: "Product updated", product });
});

// DELETE /product/:id — admin: remove a product from the catalogue.
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!/^\d+$/.test(id)) throw new ApiError(400, "Product id must be a number");

  const product = await Product.findOneAndDelete({ id: Number(id) });
  if (!product) throw new ApiError(404, "Product not found");
  await Review.deleteMany({ productId: product.id });
  await User.updateMany({ wishlistIds: product.id }, { $pull: { wishlistIds: product.id } });

  res.json({ success: true, message: "Product deleted" });
});