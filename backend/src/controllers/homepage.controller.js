import { HomepageContent } from "../models/homepageContent.model.js";
import { Product } from "../models/product.model.js";
import { defaultHomepageContent } from "../data/homepage.seed.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const HOMEPAGE_IMAGE_KEYS = new Set([
  ...Array.from({ length: 6 }, (_, index) => `arrival-${index + 1}`),
  ...Array.from({ length: 5 }, (_, index) => `brand-${index + 1}`),
  ...Array.from({ length: 4 }, (_, index) => `feature-${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `follow-${index + 1}`),
  ...Array.from({ length: 3 }, (_, index) => `customer-${index + 1}`),
  "hero-left",
  "hero-right",
  "hero-top",
  "hero-bottom",
  "promo-base",
  "promo-tag-cap",
  "promo-tag-suspender",
  "promo-tag-hugo-boss",
  "promo-tag-hugo-boss-lower",
  "promo-tag-santoni",
  "newsletter-left",
  "newsletter-right",
]);

const validateValue = (value, template, path) => {
  if (typeof template === "string") {
    if (typeof value !== "string" || value.length > 2000) {
      throw new ApiError(400, `${path} must be a string of at most 2000 characters`);
    }
    if (!value.trim()) throw new ApiError(400, `${path} cannot be empty`);
    const isImageField =
      path.endsWith(".image") ||
      path.endsWith(".icon") ||
      path.toLowerCase().includes("images.");
    if (isImageField && !isSafeImage(value)) {
      throw new ApiError(400, `${path} must be an image key, /uploads path, or HTTPS URL`);
    }
    if (
      path.endsWith(".buttonHref")
        ? !isInternalPath(value)
        : path.endsWith(".href") &&
          (path.includes(".navigation.") ? !isInternalPath(value) : !isSafeLink(value))
    ) {
      throw new ApiError(400, `${path} must be a site path or HTTPS URL`);
    }
    return value;
  }

  if (typeof template === "number") {
    if (!Number.isFinite(value) || Math.abs(value) > 5000) {
      throw new ApiError(400, `${path} must be a valid number`);
    }
    if (path.endsWith(".rating") && (value < 1 || value > 5)) {
      throw new ApiError(400, `${path} must be between 1 and 5`);
    }
    if (path.endsWith(".featuredProductId") && (!Number.isInteger(value) || value < 1)) {
      throw new ApiError(400, `${path} must be a positive product id`);
    }
    if (path.endsWith(".height") && (value < 1 || value > 1000)) {
      throw new ApiError(400, `${path} must be between 1 and 1000`);
    }
    if (path.endsWith(".width") && (value < 1 || value > 1000)) {
      throw new ApiError(400, `${path} must be between 1 and 1000`);
    }
    return value;
  }

  if (Array.isArray(template)) {
    if (!Array.isArray(value) || value.length < 1 || value.length > 30) {
      throw new ApiError(400, `${path} must be an array of 1 to 30 items`);
    }
    if (path.endsWith(".countdownLabels") && value.length !== 4) {
      throw new ApiError(400, `${path} must contain exactly four labels`);
    }
    return value.map((item, index) =>
      validateValue(item, template[0], `${path}[${index}]`)
    );
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError(400, `${path} must be an object`);
  }
  const expectedKeys = Object.keys(template);
  if (
    Object.keys(value).length !== expectedKeys.length ||
    expectedKeys.some((key) => !Object.hasOwn(value, key))
  ) {
    throw new ApiError(400, `${path} must contain exactly: ${expectedKeys.join(", ")}`);
  }
  return Object.fromEntries(
    expectedKeys.map((key) => [
      key,
      validateValue(value[key], template[key], `${path}.${key}`),
    ])
  );
};

const isSafeImage = (value) => {
  if (/^https:\/\/\S+$/i.test(value)) return true;
  if (value.startsWith("/uploads/")) return !value.includes("..");
  return HOMEPAGE_IMAGE_KEYS.has(value);
};

const isSafeLink = (value) =>
  isInternalPath(value) ||
  /^https:\/\/\S+$/i.test(value);

const isInternalPath = (value) =>
  value.startsWith("/") && !value.startsWith("//") && !value.includes("\\");

// GET /homepage — homepage configuration and current catalogue from MongoDB.
export const getHomepage = asyncHandler(async (_req, res) => {
  const [record, products] = await Promise.all([
    HomepageContent.findOne({ key: "default" }).lean(),
    Product.find().sort({ id: 1 }).lean(),
  ]);
  if (!record) throw new ApiError(503, "Homepage content has not been initialized");

  const now = new Date();
  const dealEndsAt = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999)
  );
  const featuredProduct =
    products.find((product) => product.id === record.content.promo.featuredProductId) || null;

  res.json({
    success: true,
    content: record.content,
    products,
    deals: products.filter(
      (product) =>
        product.originalPrice > product.price &&
        product.stock > 0
    ),
    featuredProduct,
    dealEndsAt: dealEndsAt.toISOString(),
  });
});

// PUT /homepage — admin: replace validated, backend-managed homepage content.
export const updateHomepage = asyncHandler(async (req, res) => {
  const content = validateValue(req.body?.content, defaultHomepageContent, "content");
  if (!(await Product.exists({ id: content.promo.featuredProductId }))) {
    throw new ApiError(400, "The featured promo product must exist in the catalogue");
  }

  const record = await HomepageContent.findOneAndUpdate(
    { key: "default" },
    { $set: { content } },
    { returnDocument: "after", runValidators: true, upsert: true }
  ).lean();

  res.json({ success: true, message: "Homepage content updated", content: record.content });
});
