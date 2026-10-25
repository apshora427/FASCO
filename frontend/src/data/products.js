import arrival1 from "../assets/arrival-1.png"
import arrival2 from "../assets/arrival-2.png"
import arrival3 from "../assets/arrival-3.png"
import arrival4 from "../assets/arrival-4.png"
import arrival5 from "../assets/arrival-5.png"
import arrival6 from "../assets/arrival-6.png"
import deal1 from "../assets/deal-1.png"
import deal2 from "../assets/deal-2.png"
import deal3 from "../assets/deal-3.png"
import insta2 from "../assets/insta-2.png"
import insta3 from "../assets/insta-3.png"
import insta4 from "../assets/insta-4.png"
import insta5 from "../assets/insta-5.png"
import insta6 from "../assets/insta-6.png"
import testi1 from "../assets/testi-1.png"
import testi2 from "../assets/testi-2.png"

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
  mk(7, "Classic Blazer", insta2, "Men's Fashion"),
  mk(8, "Urban Jacket", insta6, "Men's Fashion"),
  mk(9, "Casual Shirt", insta4, "Men's Fashion"),
  mk(10, "Leather Handbag", deal2, "Women Accessories"),
  mk(11, "Elegant Hat", deal3, "Women Accessories"),
  mk(12, "Silk Scarf", insta3, "Women Accessories"),
  mk(13, "Classic Watch", insta6, "Men Accessories"),
  mk(14, "Leather Belt", insta4, "Men Accessories"),
  mk(15, "Summer Set", insta5, "Discount Deals", { originalPrice: 190, discount: "50% OFF" }),
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
  { id: "d1", title: "Shiny Black Dress", image: deal1, label: "01", sublabel: "Starting Date", badge: "30% OFF" },
  { id: "d2", title: "Denim Two Piece", image: deal2, badge: "25% OFF" },
  { id: "d3", title: "Summer Hat Look", image: deal3, badge: "20% OFF" },
  { id: "d4", title: "Long White Dress", image: arrival2, badge: "15% OFF" },
]

export const testimonials = [
  {
    id: 1,
    name: "James K.",
    role: "Traveler",
    image: testi1,
    quote:
      "You won't regret it. I would like to personally thank you for your outstanding product. Absolutely wonderful!",
  },
  {
    id: 2,
    name: "Amelia R.",
    role: "Stylist",
    image: testi2,
    quote:
      "The quality feels premium and delivery was faster than expected. The fit is exactly as shown on the site — I get compliments every time.",
  },
  {
    id: 3,
    name: "Jason W.",
    role: "Photographer",
    image: insta4,
    quote:
      "Keep doing! Thank you for making it truly amazing. FASCO is one of an online store I keep coming back to, the team made me great.",
  },
]

export const formatPrice = (value) => `$${Number(value).toFixed(2)}`

export const COUPON_CODE = "FASCO10"
export const COUPON_DISCOUNT = 0.1
