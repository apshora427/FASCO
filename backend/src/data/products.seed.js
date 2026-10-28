// Seed catalogue — mirrors frontend/src/data/products.js so the API serves the
// exact same products the design shows. Images are stored as registry keys
// (resolved to bundled assets on the frontend), not URLs.
const mk = (id, title, image, category, extra = {}) => ({
  id,
  title,
  price: 95.5,
  brand: "Al Karam",
  rating: 5,
  reviews: "(4.1k)",
  tag: "Almost Sold Out",
  category,
  image,
  stock: 20,
  ...extra,
});

export const seedProducts = [
  mk(1, "Shiny Dress", "arrival-1", "Women's Fashion", { arrival: true }),
  mk(2, "Long Dress", "arrival-2", "Women's Fashion", { arrival: true }),
  mk(3, "Full Sweater", "arrival-3", "Women's Fashion", { arrival: true }),
  mk(4, "White Dress", "arrival-4", "Women's Fashion", { arrival: true }),
  mk(5, "Colorful Dress", "arrival-5", "Women's Fashion", { arrival: true }),
  mk(6, "White Shirt", "arrival-6", "Women's Fashion", { arrival: true }),
  mk(7, "Classic Blazer", "follow-2", "Men's Fashion"),
  mk(8, "Urban Jacket", "follow-6", "Men's Fashion"),
  mk(9, "Casual Shirt", "follow-4", "Men's Fashion"),
  mk(10, "Leather Handbag", "deal-2", "Women Accessories"),
  mk(11, "Elegant Hat", "deal-3", "Women Accessories"),
  mk(12, "Silk Scarf", "follow-3", "Women Accessories"),
  mk(13, "Classic Watch", "follow-6", "Men Accessories"),
  mk(14, "Leather Belt", "follow-4", "Men Accessories"),
  mk(15, "Summer Set", "follow-5", "Discount Deals", { originalPrice: 190, discount: "50% OFF" }),
  mk(16, "Evening Dress", "deal-1", "Discount Deals", { originalPrice: 160, discount: "40% OFF" }),
  mk(17, "Denim Outfit", "deal-2", "Discount Deals", { originalPrice: 140, discount: "30% OFF" }),
  mk(18, "Cozy Sweater", "arrival-3", "Discount Deals", { originalPrice: 130, discount: "25% OFF" }),
];

// Insert the catalogue on first boot so the storefront works out of the box.
// Never overwrites an existing collection (edits made via the API are kept).
export const ensureSeedProducts = async (Product) => {
  const count = await Product.countDocuments();
  if (count > 0) {
    await Product.updateMany({ stock: { $exists: false } }, { $set: { stock: 20 } });
    return false;
  }
  await Product.insertMany(seedProducts);
  console.log(`Seeded ${seedProducts.length} products`);
  return true;
};