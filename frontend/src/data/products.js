import arrival1 from "../assets/figma/arrival-1.jpg"
import arrival2 from "../assets/figma/arrival-2.jpg"
import arrival3 from "../assets/figma/arrival-3.jpg"
import arrival4 from "../assets/figma/arrival-4.jpg"
import arrival5 from "../assets/figma/arrival-5.jpg"
import arrival6 from "../assets/figma/arrival-6.jpg"
import deal1 from "../assets/figma/deal-1.jpg"
import deal2 from "../assets/figma/deal-2.jpg"
import deal3 from "../assets/figma/deal-3.jpg"
import deal4 from "../assets/figma/deal-4.jpg"
import follow2 from "../assets/figma/follow-2.jpg"
import follow3 from "../assets/figma/follow-3.jpg"
import follow4 from "../assets/figma/follow-4.jpg"
import follow5 from "../assets/figma/follow-5.jpg"
import follow6 from "../assets/figma/follow-6.jpg"
import customer1 from "../assets/figma/customer-1.jpg"
import customer2 from "../assets/figma/customer-2.jpg"
import customer3 from "../assets/figma/customer-3.jpg"

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
  "deal-4": deal4,
  "follow-2": follow2,
  "follow-3": follow3,
  "follow-4": follow4,
  "follow-5": follow5,
  "follow-6": follow6,
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

export const newArrivals = products.filter((p) => p.arrival)

export const categories = [
  "Men's Fashion",
  "Women's Fashion",
  "Women Accessories",
  "Men Accessories",
  "Discount Deals",
]

// Deals Of The Month carousel — the first card carries the "Starting Date"
// overlay exactly like the design.
export const dealProducts = [
  { id: "d1", title: "Shiny Black Dress", image: deal1, label: "01", sublabel: "Starting Date", badge: "30% OFF", width: 404, height: 582 },
  { id: "d2", title: "Denim Two Piece", image: deal2, label: "02", sublabel: "Spring Sale", badge: "25% OFF", width: 372, height: 486 },
  { id: "d3", title: "Summer Hat Look", image: deal3, label: "03", sublabel: "Spring Sale", badge: "20% OFF", width: 372, height: 486 },
  { id: "d4", title: "Long White Dress", image: deal4, label: "04", sublabel: "Spring Sale", badge: "15% OFF", width: 302, height: 403 },
]

export const testimonials = [
  {
    id: 1,
    name: "James K.",
    role: "Traveler",
    image: customer1,
    quote:
      "You won't regret it. I would like to personally thank you for your outstanding product. Absolutely wonderful!",
  },
  {
    id: 2,
    name: "Amelia R.",
    role: "Stylist",
    image: customer2,
    quote:
      "The quality feels premium and delivery was faster than expected. The fit is exactly as shown on the site — I get compliments every time.",
  },
  {
    id: 3,
    name: "Jason W.",
    role: "Photographer",
    image: customer3,
    quote:
      "Keep doing! Thank you for making it truly amazing. FASCO is one of an online store I keep coming back to, the team made me great.",
  },
]

export const formatPrice = (value) => `$${Number(value).toFixed(2)}`

export const COUPON_CODE = "FASCO10"
export const COUPON_DISCOUNT = 0.1
