import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
  const str = (v) => (typeof v === "string" ? v.trim() : undefined);
  const num = (v) => (v === undefined || v === null || v === "" ? undefined : Number(v));
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

// POST /product/create — admin: add a product (auto id, validated essentials).
export const createProduct = asyncHandler(async (req, res) => {
  const fields = pickFields(req.body || {});

  for (const key of ["title", "price", "category", "image"]) {
    if (fields[key] === undefined || fields[key] === "" || Number.isNaN(fields[key])) {
      throw new ApiError(400, `${key} is required`);
    }
  }
  if (fields.price < 0) throw new ApiError(400, "Price cannot be negative");

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
  if (fields.price !== undefined && (Number.isNaN(fields.price) || fields.price < 0)) {
    throw new ApiError(400, "Price cannot be negative");
  }
  if (fields.title === "" || fields.category === "" || fields.image === "") {
    throw new ApiError(400, "title, category and image cannot be empty");
  }

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

  res.json({ success: true, message: "Product deleted" });
});