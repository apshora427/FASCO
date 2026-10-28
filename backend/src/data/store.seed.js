import { Coupon } from "../models/coupon.model.js";
import { Category } from "../models/category.model.js";

// The storefront's five filter pills (data/products.js) — created on first boot
// so /category is never empty and the dashboard can manage them from there.
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

// The code advertised on the checkout page (FASCO10 / 0.1) as a real,
// editable coupon — Apply now validates against the database.
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
