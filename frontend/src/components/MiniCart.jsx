import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router"
import { AnimatePresence, motion } from "framer-motion"
import { LuCheck, LuMinus, LuPlus, LuX } from "react-icons/lu"
import { UseStore } from "../context/StoreContext"
import { formatPrice } from "../data/products"

/* Every add-to-cart (product page, wishlist "move to cart", …) announces itself
 * through this event — StoreContext dispatches it, this drawer listens for it. */
const MINICART_EVENT = "fasco:minicart:open"

const FREE_SHIPPING_OVER = 75 // matches "Free Shipping & Returns … over $75" on the product page
const GIFT_WRAP_PRICE = 10
const pad = (n) => String(n).padStart(2, "0")

const MiniCart = () => {
  const { cart, cartSubtotal, updateQuantity } = UseStore()
  const [open, setOpen] = useState(false)
  const [wrapped, setWrapped] = useState(false)
  const location = useLocation()

  // listen for "add to cart" anywhere in the app
  useEffect(() => {
    const show = () => setOpen(true)
    window.addEventListener(MINICART_EVENT, show)
    return () => window.removeEventListener(MINICART_EVENT, show)
  }, [])

  // navigating (Checkout / View Cart / an item) closes the drawer
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  // Escape closes it and the page behind stops scrolling while it is open
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open])

  const subtotal = cartSubtotal + (wrapped ? GIFT_WRAP_PRICE : 0)
  const remaining = Math.max(0, FREE_SHIPPING_OVER - cartSubtotal)

  return (
    <AnimatePresence>
      {open && (
        <div key="minicart" className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Shopping Cart">
          {/* light scrim — the design dims the page to roughly 22% black */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-[rgba(0,0,0,0.22)]"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-0 right-0 flex h-full w-[min(728px,100vw)] flex-col bg-white shadow-[-24px_0_70px_rgba(0,0,0,0.12)] dark:bg-[#121212]">
            {/* ---------------- header ---------------- */}
            <div className="flex shrink-0 items-start justify-between gap-4 px-6 pt-10 pb-[50px] sm:px-11">
              <div className="min-w-0">
                <h2 className="font-Display text-[clamp(32px,2.4vw,46px)] leading-[1.15] text-black dark:text-white">
                  Shopping Cart
                </h2>
                {cart.length > 0 && (
                  <p className="mt-[10px] text-[clamp(14px,1.15vw,17px)] leading-[1.4] text-[#8a8a8a]">
                    {remaining > 0 ? (
                      <>
                        Buy <b className="font-semibold text-black dark:text-white">{formatPrice(remaining)}</b> More
                        And Get{" "}
                        <b className="font-semibold text-black dark:text-white">Free Shipping</b>
                      </>
                    ) : (
                      <>
                        Your Order Qualifies For{" "}
                        <b className="font-semibold text-black dark:text-white">Free Shipping</b>
                      </>
                    )}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                autoFocus
                aria-label="Close cart"
                className="mt-1 shrink-0 text-[#484848] transition-colors hover:text-black dark:text-[#e5e7eb] dark:hover:text-white">
                <LuX size={22} />
              </button>
            </div>

            {/* ---------------- items ---------------- */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 sm:px-11">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 pb-16 text-center">
                  <p className="font-Display text-[clamp(22px,1.8vw,28px)] text-black dark:text-white">
                    Your cart is empty
                  </p>
                  <p className="text-[clamp(14px,1.15vw,17px)] text-[#8a8a8a]">
                    Looks like you haven&apos;t added anything yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="btn-dark mt-2 px-[46px] tracking-[0.02em]">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-[26px] border-b border-[#EDEDED] pb-3 dark:border-[#2a2a2a]">
                    <Link
                      to={`/product/${item.id}`}
                      className="block aspect-[3/4] w-[130px] shrink-0 overflow-hidden bg-[#E3E3E3] sm:w-[174px] dark:bg-[#262626]"
                      aria-label={`View ${item.title}`}>
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/product/${item.id}`}
                        className="font-Display text-[clamp(18px,1.5vw,22px)] leading-tight font-bold text-black transition-colors hover:text-[#484848] dark:text-white dark:hover:text-[#a1a1aa]">
                        {item.title}
                      </Link>

                      {item.color && (
                        <p className="mt-[6px] text-[clamp(14px,1.2vw,18px)] leading-none text-[#8a8a8a]">
                          Color : {item.color}
                        </p>
                      )}

                      <p className="mt-[10px] text-[clamp(15px,1.25vw,19px)] leading-none text-black dark:text-white">
                        {formatPrice(item.price)}
                      </p>

                      <div className="mt-4 flex h-[56px] w-[161px] items-center justify-between rounded-[8px] bg-[#F1F1F1] px-[10px] dark:bg-[#1f1f1f]">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${item.title}`}
                          className="grid h-10 w-10 place-items-center text-[#484848] transition-colors hover:text-black dark:text-[#e5e7eb] dark:hover:text-white">
                          <LuMinus size={18} />
                        </button>
                        <span className="min-w-8 text-center text-[clamp(16px,1.4vw,22px)] leading-none tabular-nums text-[#9F9F9F]">
                          {pad(item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label={`Increase quantity of ${item.title}`}
                          className="grid h-10 w-10 place-items-center text-[#484848] transition-colors hover:text-black dark:text-[#e5e7eb] dark:hover:text-white">
                          <LuPlus size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ---------------- footer ---------------- */}
            {cart.length > 0 && (
              <div className="shrink-0 px-6 pb-6 sm:px-11">
                <label className="flex cursor-pointer items-center gap-3 border-b border-[#EDEDED] pt-[27px] pb-[22px] dark:border-[#2a2a2a]">
                  <input
                    type="checkbox"
                    checked={wrapped}
                    onChange={(event) => setWrapped(event.target.checked)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-[3px] border-[1.5px] border-[#4A4A4A] text-transparent transition-colors peer-checked:border-black peer-checked:bg-black peer-checked:text-white dark:peer-checked:border-white dark:peer-checked:bg-white dark:peer-checked:text-black">
                    <LuCheck size={20} />
                  </span>
                  <span className="text-[clamp(14px,1.2vw,18px)] leading-[1.4] text-[#8a8a8a]">
                    For <b className="font-semibold text-black dark:text-white">{formatPrice(GIFT_WRAP_PRICE)}</b>{" "}
                    Please Wrap The Product
                  </span>
                </label>

                <div className="flex items-center justify-between pt-[40px]">
                  <span className="font-Display text-[clamp(20px,1.6vw,24px)] font-bold text-black dark:text-white">
                    Subtotal
                  </span>
                  <span className="font-Display text-[clamp(20px,1.6vw,24px)] font-bold text-black dark:text-white">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <Link
                  to="/checkout"
                  className="mt-[26px] flex h-[60px] w-full items-center justify-center rounded-[10px] bg-black text-[17px] leading-none text-white shadow-[0_20px_35px_rgba(0,0,0,0.15)] transition-colors hover:bg-[#2d2a2a] dark:bg-white dark:text-[#121212] dark:hover:bg-[#d4d4d8]">
                  Checkout
                </Link>

                <div className="mt-5 text-center">
                  <Link
                    to="/cart"
                    className="text-[17px] leading-none font-semibold text-black underline underline-offset-2 dark:text-white">
                    View Cart
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}

export default MiniCart
