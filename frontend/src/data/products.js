import F_1 from "../assets/F-1.png"
import F_2 from "../assets/F-2.png"
import F_3 from "../assets/F-3.png"
import F_4 from "../assets/F-4.png"
import S_1 from "../assets/S-1.png"
import S_2 from "../assets/S-2.png"
import S_3 from "../assets/S-3.png"
import S_4 from "../assets/S-4.png"
import E_1 from "../assets/E-1.png"
import E_2 from "../assets/E-2.png"
import E_3 from "../assets/E-3.png"
import E_4 from "../assets/E-4.png"
import mainImg from "../assets/gamepad-main.png"
import thumb_1 from "../assets/gamepad-thumb-1.png"
import thumb_2 from "../assets/gamepad-thumb-2.png"
import thumb_3 from "../assets/gamepad-thumb-3.png"

export const products = [
  {
    id: 1,
    title: "Havic HV G-92 Gamepad",
    price: 192.0,
    originalPrice: null,
    discount: null,
    color: "Black",
    image: mainImg,
    gallery: [thumb_1, mainImg, thumb_2, thumb_3],
    rating: 4.5,
    reviews: 150,
    category: "Gaming",
    description:
      "PlayStation 5 Controller Skin High quality vinyl with air channel adhesive for easy bubble free install & mess free removal Pressure sensitive.",
  },
  {
    id: 2,
    title: "HAVIT HV-G92 Gamepad",
    price: 120,
    originalPrice: 160,
    discount: "-40%",
    color: "Black",
    image: F_1,
    rating: 5,
    reviews: 88,
    category: "Gaming",
    description:
      "Ergonomic wireless gamepad with dual vibration motors and long-lasting battery for immersive gaming sessions.",
  },
  {
    id: 3,
    title: "AK-900 Wired Keyboard",
    price: 960,
    originalPrice: 1160,
    discount: "-35%",
    color: "Black",
    image: F_2,
    rating: 5,
    reviews: 75,
    category: "Gaming",
    description:
      "RGB backlit wired keyboard with durable mechanical switches and anti-ghosting keys built for pro gamers.",
  },
  {
    id: 4,
    title: "IPS LCD Gaming Monitor",
    price: 370,
    originalPrice: 400,
    discount: "-30%",
    color: "Black",
    image: F_3,
    rating: 5,
    reviews: 99,
    category: "Gaming",
    description:
      "27-inch IPS LCD gaming monitor with a high refresh rate and vivid color reproduction for smooth gameplay.",
  },
  {
    id: 5,
    title: "RGB liquid CPU Cooler",
    price: 160,
    originalPrice: 170,
    discount: null,
    color: "Black",
    image: F_4,
    rating: 5,
    reviews: 65,
    category: "Gaming",
    description:
      "High-performance RGB liquid CPU cooler with dual illuminated fans for whisper-quiet cooling.",
  },
  {
    id: 6,
    title: "The north coat",
    price: 260,
    originalPrice: 360,
    discount: null,
    color: "Red",
    image: S_1,
    rating: 5,
    reviews: 65,
    category: "Fashion",
    description:
      "Premium insulated winter coat with a water-resistant shell and cozy fleece lining for cold days.",
  },
  {
    id: 7,
    title: "Gucci duffle bag",
    price: 960,
    originalPrice: 1160,
    discount: null,
    color: "Red",
    image: S_2,
    rating: 5,
    reviews: 65,
    category: "Fashion",
    description:
      "Signature GG canvas duffle bag with leather trim and a spacious main compartment for weekend trips.",
  },
  {
    id: 8,
    title: "RGB liquid CPU Cooler",
    price: 160,
    originalPrice: 170,
    discount: null,
    color: "Black",
    image: S_3,
    rating: 5,
    reviews: 65,
    category: "Computers",
    description:
      "Compact RGB liquid cooling system with an efficient pump and silent radiator fans for your build.",
  },
  {
    id: 9,
    title: "Small BookSelf",
    price: 360,
    originalPrice: 460,
    discount: null,
    color: "Green",
    image: S_4,
    rating: 5,
    reviews: 65,
    category: "Home",
    description:
      "Space-saving wooden bookshelf with five tiers, perfect for small rooms, offices, and cozy corners.",
  },
  {
    id: 10,
    title: "Breed Dry Dog Food",
    price: 120,
    originalPrice: null,
    discount: null,
    color: "Green",
    image: E_1,
    rating: 5,
    reviews: 88,
    category: "Pets",
    description:
      "Nutrient-rich dry dog food made with real chicken, wholesome grains, and balanced vitamins.",
  },
  {
    id: 11,
    title: "CANON EOS DSLR Camera",
    price: 960,
    originalPrice: null,
    discount: null,
    color: "Black",
    image: E_2,
    rating: 5,
    reviews: 75,
    category: "Electronics",
    description:
      "Professional DSLR camera with a 24MP sensor, 4K video, and fast dual-pixel autofocus.",
  },
  {
    id: 12,
    title: "ASUS FHD Gaming Laptop",
    price: 370,
    originalPrice: null,
    discount: null,
    color: "Black",
    image: E_3,
    rating: 5,
    reviews: 99,
    category: "Electronics",
    description:
      "FHD gaming laptop with a high-refresh display, powerful GPU, and RGB backlit keyboard.",
  },
  {
    id: 13,
    title: "Curology Product Set",
    price: 375,
    originalPrice: null,
    discount: null,
    color: "Red",
    image: E_4,
    rating: 5,
    reviews: 99,
    category: "Beauty",
    description:
      "Custom skincare set with a gentle cleanser, targeted treatment, and daily moisturizer.",
  },
]

const ids = (list) => list.map((id) => products.find((p) => p.id === id)).filter(Boolean)

export const flashSaleProducts = ids([2, 3, 4, 5])
export const bestSellingProducts = ids([6, 7, 8, 9])
export const exploreProducts = ids([10, 11, 12, 13])
export const gamingProducts = ids([1, 2, 3, 4, 5])
export const categories = [...new Set(products.map((p) => p.category))]

export const productColors = [
  { name: "Black", value: "#000000" },
  { name: "Red", value: "#DB4444" },
  { name: "Green", value: "#4CAF50" },
]

export const formatPrice = (value) => `$${Number(value).toFixed(value % 1 ? 2 : 0)}`

export const COUPON_CODE = "EXCLUSIVE10"
export const COUPON_DISCOUNT = 0.1
