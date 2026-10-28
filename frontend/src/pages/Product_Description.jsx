import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import dayjs from "dayjs"
import {
  LuCircleHelp,
  LuMinus,
  LuPackage,
  LuPlus,
  LuShare2,
  LuSlidersVertical,
  LuStar,
  LuTruck,
} from "react-icons/lu"
import Navbar from "../components/Navbar"
import PromoBanner from "../components/PromoBanner"
import Features from "../components/Features"
import DealsOfTheMonth from "../components/DealsOfTheMonth"
import Newsletter from "../components/Newsletter"
import Footer from "../components/Footer"
import ProductReviews from "../components/ProductReviews"
import { products, formatPrice, resolveImage } from "../data/products"
import { getProduct } from "../api/backend"
import { UseStore } from "../context/StoreContext"
import { readComparedIds, saveComparedIds } from "../utils/comparison"

/* ------------------------------------------------------------------ *
 * Design tokens sampled from the Figma "Product Page" frame
 * ------------------------------------------------------------------ */
const PALETTE = {
  Blue: "#8DB4D2",
  Black: "#000000",
  Pink: "#FFD1DC",
  White: "#FFFFFF",
  Red: "#DA3F3F",
  Navy: "#2B3A55",
  Beige: "#E7DAC9",
  Green: "#A9C4A0",
  Purple: "#C6B2D6",
  Grey: "#B9B9B9",
}
const FREE_SHIPPING_OVER = 75
/* ------------------------------------------------------------------ *
 * Product details prefer fields supplied by the live catalogue. Optional
 * galleries and variants stay empty when the product has none.
 * ------------------------------------------------------------------ */
const useGallery = (product) =>
  useMemo(() => {
    // a backend-provided gallery wins when present (keys already resolved)
    if (Array.isArray(product.images) && product.images.length) return product.images
    return product.image ? [product.image] : []
  }, [product])

const colorsFor = (product) => {
  return Array.isArray(product.colors) ? product.colors : []
}

const stockFor = (product) => Number.isFinite(Number(product.stock)) ? Math.max(0, Number(product.stock)) : 0

/* ------------------------------------------------------------------ *
 * Small building blocks
 * ------------------------------------------------------------------ */
const Stars = ({ rating }) => (
  <span
    className="flex items-center gap-[4px] leading-none text-black dark:text-white"
    aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((step) => (
      <LuStar key={step} size={19} className={step <= rating ? "fill-current" : ""} />
    ))}
  </span>
)

const PaymentCard = ({ children, bg = "#ffffff" }) => (
  <svg viewBox="0 0 36 24" className="h-[24px] w-[36px] shrink-0" role="img" aria-hidden="true">
    <rect x="0.5" y="0.5" width="35" height="23" rx="3" fill={bg} stroke="#E3E3E3" />
    {children}
  </svg>
)

// Compact card-network marks from the design's checkout strip.
const PaymentMarks = () => (
  <div className="flex flex-wrap items-center justify-center gap-[10px]">
    <PaymentCard>
      <text x="18" y="15" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="700" fontStyle="italic" fill="#1A1F71">
        VISA
      </text>
    </PaymentCard>
    <PaymentCard bg="#16325C">
      <circle cx="15" cy="12" r="5.8" fill="#EB001B" />
      <circle cx="21" cy="12" r="5.8" fill="#F79E1B" fillOpacity="0.9" />
    </PaymentCard>
    <PaymentCard bg="#2E77BC">
      <text x="18" y="14.6" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="6.5" fontWeight="700" fill="#FFFFFF">
        AMEX
      </text>
    </PaymentCard>
    <PaymentCard>
      <rect x="5" y="4" width="7.5" height="16" rx="2" fill="#0B4EA2" />
      <rect x="14.25" y="4" width="7.5" height="16" rx="2" fill="#D7142A" />
      <rect x="23.5" y="4" width="7.5" height="16" rx="2" fill="#00A651" />
    </PaymentCard>
    <PaymentCard>
      <text x="16" y="14.4" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="5.5" fontWeight="700" fill="#4A4A4A">
        DISC
      </text>
      <circle cx="29" cy="12" r="5.4" fill="#F58220" />
    </PaymentCard>
    <PaymentCard>
      <circle cx="18" cy="12" r="6.4" fill="#0079BE" />
      <rect x="16.7" y="5.6" width="2.6" height="12.8" fill="#FFFFFF" />
    </PaymentCard>
    <PaymentCard>
      <circle cx="15" cy="12" r="5.8" fill="#0099DF" />
      <circle cx="21" cy="12" r="5.8" fill="#ED0006" fillOpacity="0.9" />
    </PaymentCard>
  </div>
)

const ActionButton = ({ icon: Icon, children, ...rest }) => (
  <button
    type="button"
    className="flex items-center gap-2 whitespace-nowrap font-Display text-[clamp(13px,1.11vw,16px)] text-[#484848] transition-colors hover:text-black dark:text-[#e5e7eb] dark:hover:text-white"
    {...rest}>
    <Icon size={19} className="shrink-0" />
    {children}
  </button>
)

/* ------------------------------------------------------------------ *
 * The product detail view — kept behind `key={product.id}` so every
 * selection (image, size, colour, quantity) resets with the route.
 * ------------------------------------------------------------------ */
const ProductView = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = UseStore()

  const gallery = useGallery(product)
  const colors = useMemo(() => colorsFor(product), [product])
  const sizes = Array.isArray(product.sizes) ? product.sizes : []
  const stock = stockFor(product)
  const wished = isInWishlist(product.id)

  const [activeImage, setActiveImage] = useState(0)
  const [size, setSize] = useState(sizes[0] || "")
  const [color, setColor] = useState(colors[0] || "")
  const [quantity, setQuantity] = useState(1)
  const [compareIds, setCompareIds] = useState(() => {
    try {
      return readComparedIds()
    } catch {
      toast.error("Your saved comparison list could not be read.")
      return []
    }
  })
  const compared = compareIds.includes(String(product.id))

  const deliveryWindow = useMemo(() => {
    const from = dayjs().add(4, "day")
    const to = dayjs().add(8, "day")
    return `${from.format("MMM DD")} - ${to.format("MMM DD")}`
  }, [])

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0


  const handleAddToCart = () => {
    // pass the chosen size/colour through so the mini cart shows them
    addToCart(product, quantity, { size, color })
    setQuantity(1)
  }

  const handleCompare = () => {
    const updated = compared
      ? compareIds.filter((id) => id !== String(product.id))
      : [...compareIds, String(product.id)]
    try {
      saveComparedIds(updated)
      setCompareIds(updated)
      toast.success(compared ? "Removed from comparison" : `${product.title} added to comparison`)
    } catch {
      toast.error("Could not update your comparison list.")
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: product.title, url: window.location.href })
        return
      }
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Product link copied")
    } catch {
      // share sheet dismissed — nothing to report
    }
  }

  return (
    <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-[5.3%]">
      {/* ---------------- gallery ---------------- */}
      <div className="flex flex-col-reverse gap-3 lg:w-[46%] lg:flex-none lg:flex-row lg:gap-[17px]">
        <div className="flex gap-3 overflow-x-auto pb-1 lg:w-[72px] lg:flex-col lg:gap-[17px] lg:overflow-visible lg:pb-0">
          {gallery.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => setActiveImage(index)}
              aria-label={`View image ${index + 1} of ${gallery.length}`}
              aria-current={index === activeImage}
              className={`h-[72px] w-[72px] shrink-0 overflow-hidden border transition-colors ${
                index === activeImage
                  ? "border-[#9F9F9F] dark:border-[#e5e7eb]"
                  : "border-transparent hover:border-[#D9D9D9]"
              }`}>
              <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>

        <div className="relative w-full flex-1 overflow-hidden bg-[#E3E3E3]">
          <motion.img
            key={gallery[activeImage]}
            src={gallery[activeImage]}
            alt={product.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="aspect-[3/4] w-full object-cover"
          />
        </div>
      </div>

      {/* ---------------- info column ---------------- */}
      <div className="min-w-0 flex-1">
        <p className="text-[clamp(12px,0.98vw,14px)] font-semibold uppercase leading-none tracking-[0.18em] text-[#8a8a8a]">
          {product.brand}
        </p>

        <div className="mt-[10px] flex items-start justify-between gap-4">
          <h1 className="font-Display text-[clamp(26px,2.36vw,34px)] font-bold leading-[1.15] text-black dark:text-white">
            {product.title}
          </h1>
          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wished}
            className="grid h-[54px] w-[54px] shrink-0 place-items-center rounded-full border border-[#BFBFBF] text-[#404040] transition-colors hover:border-[#404040] dark:border-[#3f3f3f] dark:text-[#e5e7eb] dark:hover:border-[#e5e7eb]">
            <LuStar size={24} className={wished ? "fill-[#FF706B] text-[#FF706B]" : ""} />
          </button>
        </div>

        <div className="mt-[8px] flex items-center gap-2">
          <Stars rating={product.rating} />
          <span className="text-[clamp(13px,1.11vw,16px)] leading-none text-[#8a8a8a]">{product.reviews}</span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="text-[clamp(21px,1.87vw,27px)] font-semibold leading-none text-black dark:text-white">
            {formatPrice(product.price)}
          </span>
          {discount > 0 && (
            <>
              <span className="text-[clamp(16px,1.46vw,21px)] leading-none text-[#9F9F9F] line-through">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="rounded-full bg-[#DA3F3F] px-3 py-[5px] text-[clamp(10px,0.9vw,13px)] font-bold uppercase leading-none tracking-[0.06em] text-white">
                Save {discount}%
              </span>
            </>
          )}
        </div>

        <div className="mt-8">
          <p className="text-[clamp(13px,1.11vw,16px)] leading-none text-[#8a8a8a]">
            {stock > 0 ? (
              <>In stock: <b className="font-semibold text-black dark:text-white">{stock}</b></>
            ) : (
              <span className="font-semibold text-[#DA3F3F]">Out of stock</span>
            )}
          </p>
        </div>

        {/* size */}
        {sizes.length > 0 && <div className="mt-[26px]">
          <p className="font-Display text-[clamp(15px,1.25vw,18px)] font-bold leading-none text-black dark:text-white">
            Size: {size}
          </p>
          <div className="mt-7 flex flex-wrap gap-4">
            {sizes.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSize(option)}
                aria-pressed={size === option}
                className={`grid h-[47px] min-w-[47px] place-items-center rounded-[8px] border px-4 text-[clamp(13px,1.04vw,15px)] leading-none transition-colors ${
                  size === option
                    ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                    : "border-[#E5E5E5] bg-white text-[#484848] hover:border-[#9F9F9F] dark:border-[#333333] dark:bg-[#1b1b1b] dark:text-[#e5e7eb]"
                }`}>
                {option}
              </button>
            ))}
          </div>
        </div>}

        {/* color */}
        {colors.length > 0 && <div className="mt-6">
          <p className="font-Display text-[clamp(15px,1.25vw,18px)] font-bold leading-none text-black dark:text-white">
            Color: {color}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            {colors.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setColor(name)}
                aria-label={name}
                aria-pressed={color === name}
                style={{
                  backgroundColor: PALETTE[name] ?? name,
                  borderColor: PALETTE[name] === "#FFFFFF" ? "#D9D9D9" : "transparent",
                }}
                className={`h-8 w-8 rounded-full border transition-shadow ${
                  color === name
                    ? "ring-2 ring-[#3f3f3f] ring-offset-4 ring-offset-white dark:ring-[#e5e7eb] dark:ring-offset-[#121212]"
                    : ""
                }`}
              />
            ))}
          </div>
        </div>}

        {/* quantity + add to cart */}
        <div className="mt-8">
          <p className="font-Display text-[clamp(15px,1.25vw,18px)] font-bold leading-none text-black dark:text-white">
            Quantity
          </p>
          <div className="mt-[30px] flex items-stretch gap-[14px]">
            <div className="flex h-[56px] w-[134px] shrink-0 items-center justify-between rounded-[8px] border border-[#9F9F9F] px-1 dark:border-[#3f3f3f]">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                aria-label="Decrease quantity"
                className="grid h-11 w-11 place-items-center rounded-[6px] text-[#484848] transition-colors hover:bg-[#f5f5f5] dark:text-[#e5e7eb] dark:hover:bg-[#262626]">
                <LuMinus size={17} />
              </button>
              <span className="min-w-7 text-center text-[clamp(13px,1.11vw,16px)] leading-none tabular-nums text-black dark:text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(stock, value + 1))}
                aria-label="Increase quantity"
                className="grid h-11 w-11 place-items-center rounded-[6px] text-[#484848] transition-colors hover:bg-[#f5f5f5] dark:text-[#e5e7eb] dark:hover:bg-[#262626]">
                <LuPlus size={17} />
              </button>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={stock <= 0}
              className="h-[56px] flex-1 rounded-[8px] border border-[#9F9F9F] font-Display text-[clamp(15px,1.25vw,18px)] leading-none text-black transition-colors hover:border-black hover:bg-black hover:text-white dark:border-[#3f3f3f] dark:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-black">
              {stock > 0 ? "Add to cart" : "Out of stock"}
            </button>
          </div>
        </div>

        {/* compare / ask / share */}
        <div className="mt-8 border-t border-[#EDEDED] pt-8 dark:border-[#2a2a2a]">
          <div className="flex flex-wrap items-center gap-x-[52px] gap-y-3">
            <ActionButton icon={LuSlidersVertical} onClick={handleCompare} aria-pressed={compared}>
              {compared ? "Remove comparison" : "Compare"}
            </ActionButton>
            {compareIds.length > 0 && (
              <Link to="/compare" className="whitespace-nowrap font-Display text-[clamp(13px,1.11vw,16px)] text-[#484848] underline underline-offset-4 hover:text-black dark:text-[#e5e7eb] dark:hover:text-white">
                View comparison ({compareIds.length})
              </Link>
            )}
            <a
              href={`mailto:support@fasco.example?subject=${encodeURIComponent(`Question about ${product.title}`)}`}
              className="flex items-center gap-2 whitespace-nowrap font-Display text-[clamp(13px,1.11vw,16px)] text-[#484848] transition-colors hover:text-black dark:text-[#e5e7eb] dark:hover:text-white">
              <LuCircleHelp size={19} className="shrink-0" />
              Ask a question
            </a>
            <ActionButton icon={LuShare2} onClick={handleShare}>
              Share
            </ActionButton>
          </div>
        </div>

        {/* delivery info */}
        <div className="mt-6 border-t border-[#EDEDED] pt-6 dark:border-[#2a2a2a]">
          <div className="flex flex-col gap-[10px] text-[clamp(13px,1.11vw,16px)] leading-[1.4]">
            <p className="flex items-start gap-2">
              <LuTruck size={19} className="mt-[1px] shrink-0 text-[#484848] dark:text-[#e5e7eb]" />
              <span className="font-Display font-bold text-black dark:text-white">
                Estimated Delivery:{" "}
                <span className="font-normal text-[#8a8a8a]">{deliveryWindow}</span>
              </span>
            </p>
            <p className="flex items-start gap-2">
              <LuPackage size={19} className="mt-[1px] shrink-0 text-[#484848] dark:text-[#e5e7eb]" />
              <span className="font-Display font-bold text-black dark:text-white">
                Free Shipping &amp; Returns:{" "}
                <span className="font-normal text-[#8a8a8a]">On all orders over ${FREE_SHIPPING_OVER}</span>
              </span>
            </p>
          </div>
        </div>

        {/* secure checkout */}
        <div className="mt-[18px] rounded-[8px] bg-[#f8f8f8] px-6 py-7 dark:bg-[#1c1c1c]">
          <PaymentMarks />
          <p className="mt-4 text-center font-Display text-[clamp(13px,1.11vw,16px)] font-bold leading-none text-[#484848] dark:text-[#e5e7eb]">
            Guarantee safe &amp; secure checkout
          </p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Page — resolves /product/:id against the shared catalogue, then
 * stacks the remaining Figma "Product Page" sections underneath it.
 * ------------------------------------------------------------------ */
const Product_Description = () => {
  const { id } = useParams()
  const localProduct = useMemo(() => products.find((item) => String(item.id) === String(id)), [id])

  // The API is the source of truth; the bundled catalogue keeps the page
  // rendering while the request is in flight and when the backend is offline.
  // status: pending → request open · ok → server product ·
  // missing → server says 404 · offline → backend unreachable
  const [remote, setRemote] = useState({ status: "pending", product: null })

  useEffect(() => {
    let live = true
    setRemote({ status: "pending", product: null })
    getProduct(id).then((res) => {
      if (!live) return
      if (res === null) setRemote({ status: "offline", product: null })
      else if (res.success && res.product) setRemote({ status: "ok", product: res.product })
      else setRemote({ status: "missing", product: null })
    })
    return () => {
      live = false
    }
  }, [id])

  const product = useMemo(() => {
    if (remote.status === "ok") {
      const p = remote.product
      return {
        ...p,
        image: resolveImage(p.image),
        images: Array.isArray(p.images) ? p.images.map(resolveImage) : p.images,
      }
    }
    // the server answered "no such product" — trust it over the local copy
    if (remote.status === "missing") return null
    return localProduct ?? null
  }, [remote, localProduct])

  useEffect(() => {
    const previous = document.title
    document.title = product ? `${product.title} | FASCO` : "Product not found | FASCO"
    return () => {
      document.title = previous
    }
  }, [product])

  return (
    <main className="bg-white">
      <Navbar variant="shop" />

      <div className="container pb-[clamp(48px,5vw,72px)] pt-[clamp(36px,4.7vw,68px)]">
        {product ? (
          <>
            <ProductView key={product.id} product={product} />
            <ProductReviews
              productId={product.id}
              onReviewSubmitted={(updatedProduct) => {
                setRemote((current) => current.status === "ok"
                  ? { ...current, product: { ...current.product, ...updatedProduct } }
                  : current)
              }}
            />
          </>
        ) : remote.status === "pending" ? (
          <div className="py-[60px] text-center">
            <p className="text-[clamp(14px,1.1vw,16px)] text-[#8a8a8a]">Loading product…</p>
          </div>
        ) : (
          <div className="py-[60px] text-center">
            <h1 className="font-Display text-[clamp(26px,2.4vw,36px)] font-bold text-black dark:text-white">
              Product not found
            </h1>
            <p className="mt-3 text-[clamp(14px,1.1vw,16px)] text-[#8a8a8a]">
              The product you are looking for doesn&apos;t exist or has been removed.
            </p>
            <Link
              to="/shop"
              className="btn-dark mt-8 tracking-[0.02em]"
              style={{ minHeight: "52px", paddingInline: "48px" }}>
              Back to Shop
            </Link>
          </div>
        )}
      </div>

      <PromoBanner />
      <Features />
      <DealsOfTheMonth />
      <Newsletter />
      <Footer />
    </main>
  )
}

export default Product_Description
