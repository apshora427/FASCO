import arrival1 from "../assets/figma/arrival-1.jpg"
import arrival2 from "../assets/figma/arrival-2.jpg"
import arrival3 from "../assets/figma/arrival-3.jpg"
import arrival4 from "../assets/figma/arrival-4.jpg"
import arrival5 from "../assets/figma/arrival-5.jpg"
import arrival6 from "../assets/figma/arrival-6.jpg"
import deal1 from "../assets/figma/deal-1.jpg"
import deal2 from "../assets/figma/deal-2.jpg"
import deal3 from "../assets/figma/deal-3.jpg"
import follow2 from "../assets/figma/follow-2.jpg"
import follow3 from "../assets/figma/follow-3.jpg"
import follow4 from "../assets/figma/follow-4.jpg"
import follow5 from "../assets/figma/follow-5.jpg"
import follow6 from "../assets/figma/follow-6.jpg"
import follow7 from "../assets/figma/follow-7.jpg"
import customer1 from "../assets/figma/customer-1.jpg"
import customer2 from "../assets/figma/customer-2.jpg"
import customer3 from "../assets/figma/customer-3.jpg"
import heroLeft from "../assets/figma/hero-left.jpg"
import heroRight from "../assets/figma/hero-right.jpg"
import heroTop from "../assets/figma/hero-top.jpg"
import heroBottom from "../assets/figma/hero-bottom.jpg"
import newsletterLeft from "../assets/figma/newsletter-left.png"
import newsletterRight from "../assets/figma/newsletter-right.png"
import brand1 from "../assets/figma/brand-1.svg"
import brand2 from "../assets/figma/brand-2.svg"
import brand3 from "../assets/figma/brand-3.svg"
import brand4 from "../assets/figma/brand-4.svg"
import brand5 from "../assets/figma/brand-5.svg"
import feature1 from "../assets/figma/feature-1.svg"
import feature2 from "../assets/figma/feature-2.svg"
import feature3 from "../assets/figma/feature-3.svg"
import feature4 from "../assets/figma/feature-4.svg"
import follow1 from "../assets/figma/follow-1.jpg"
import promo from "../assets/figma/promo-base.png"
import capTag from "../assets/figma/promo-tag-cap.png"
import suspenderTag from "../assets/figma/promo-tag-suspender.png"
import hugoBossTag from "../assets/figma/promo-tag-hugo-boss.png"
import hugoBossLowerTag from "../assets/figma/promo-tag-hugo-boss-lower.png"
import santoniTag from "../assets/figma/promo-tag-santoni.png"

/* Image registry — the backend stores stable keys (e.g. "arrival-1") so the
 * catalogue lives in MongoDB while the art stays bundled with the app.
 * Unknown values (absolute URLs, /uploads/… paths) pass through unchanged. */
const imageMap = {
  "arrival-1": arrival1,
  "arrival-2": arrival2,
  "arrival-3": arrival3,
  "arrival-4": arrival4,
  "arrival-5": arrival5,
  "arrival-6": arrival6,
  "deal-1": deal1,
  "deal-2": deal2,
  "deal-3": deal3,
  "customer-1": customer1,
  "customer-2": customer2,
  "customer-3": customer3,
  "follow-2": follow2,
  "follow-3": follow3,
  "follow-4": follow4,
  "follow-5": follow5,
  "follow-6": follow6,
  "follow-7": follow7,
  "hero-left": heroLeft,
  "hero-right": heroRight,
  "hero-top": heroTop,
  "hero-bottom": heroBottom,
  "newsletter-left": newsletterLeft,
  "newsletter-right": newsletterRight,
  "brand-1": brand1,
  "brand-2": brand2,
  "brand-3": brand3,
  "brand-4": brand4,
  "brand-5": brand5,
  "feature-1": feature1,
  "feature-2": feature2,
  "feature-3": feature3,
  "feature-4": feature4,
  "follow-1": follow1,
  "promo-base": promo,
  "promo-tag-cap": capTag,
  "promo-tag-suspender": suspenderTag,
  "promo-tag-hugo-boss": hugoBossTag,
  "promo-tag-hugo-boss-lower": hugoBossLowerTag,
  "promo-tag-santoni": santoniTag,
}

export const resolveImage = (src) => (src ? imageMap[src] || src : "")

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
  ...extra,
})

// The six New Arrivals cards from the design first, then the other catalog
// categories so every filter pill has real products to show.
export const products = [
  mk(1, "Shiny Dress", arrival1, "Women's Fashion", { arrival: true }),
  mk(2, "Long Dress", arrival2, "Women's Fashion", { arrival: true }),
  mk(3, "Full Sweater", arrival3, "Women's Fashion", { arrival: true }),
  mk(4, "White Dress", arrival4, "Women's Fashion", { arrival: true }),
  mk(5, "Colorful Dress", arrival5, "Women's Fashion", { arrival: true }),
  mk(6, "White Shirt", arrival6, "Women's Fashion", { arrival: true }),
  mk(7, "Classic Blazer", follow2, "Men's Fashion"),
  mk(8, "Urban Jacket", follow6, "Men's Fashion"),
  mk(9, "Casual Shirt", follow4, "Men's Fashion"),
  mk(10, "Leather Handbag", deal2, "Women Accessories"),
  mk(11, "Elegant Hat", deal3, "Women Accessories"),
  mk(12, "Silk Scarf", follow3, "Women Accessories"),
  mk(13, "Classic Watch", follow6, "Men Accessories"),
  mk(14, "Leather Belt", follow4, "Men Accessories"),
  mk(15, "Summer Set", follow5, "Discount Deals", { originalPrice: 190, discount: "50% OFF" }),
  mk(16, "Evening Dress", deal1, "Discount Deals", { originalPrice: 160, discount: "40% OFF" }),
  mk(17, "Denim Outfit", deal2, "Discount Deals", { originalPrice: 140, discount: "30% OFF" }),
  mk(18, "Cozy Sweater", arrival3, "Discount Deals", { originalPrice: 130, discount: "25% OFF" }),
]

export const formatPrice = (value) => `$${Number(value).toFixed(2)}`

export const COUPON_CODE = "FASCO10"
export const COUPON_DISCOUNT = 0.1
