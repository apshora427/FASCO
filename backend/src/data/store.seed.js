import { Coupon } from "../models/coupon.model.js";
import { Category } from "../models/category.model.js";

const STORE_CATEGORIES = [
  "Men's Fashion",
  "Women's Fashion",
  "Women Accessories",
  "Men Accessories",
  "Discount Deals",
];

export const ensureSeedCategories = async () => {
  const existing = new Set((await Category.find().select("categoryName")).map((c) => c.categoryName));
  const missing = STORE_CATEGORIES.filter((name) => !existing.has(name));
  if (missing.length) {
    await Category.insertMany(missing.map((categoryName) => ({ categoryName })));
    console.log(`Seeded ${missing.length} categories`);
  }
};

export const ensureSeedCoupons = async () => {
  if (!(await Coupon.exists({ code: "FASCO10" }))) {
    await Coupon.create({
      code: "FASCO10",
      discount: 0.1,
      active: true,
      description: "10% off — advertised on checkout",
    });
    console.log("Seeded coupon FASCO10");
  }
};
