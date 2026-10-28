import { useEffect, useState } from "react"
import { Link } from "react-router"
import { AnimatePresence, motion } from "framer-motion"
import { LuMinus, LuPlus, LuShoppingBag, LuX } from "react-icons/lu"
import { UseStore } from "../context/StoreContext"
import { formatPrice } from "../data/products"

const MiniCart = () => {
  const [open, setOpen] = useState(false)
  const { cart, cartCount, cartSubtotal, removeFromCart, updateQuantity } = UseStore()

  useEffect(() => {
    const showCart = () => setOpen(true)
    window.addEventListener("fasco:minicart:open", showCart)
    return () => window.removeEventListener("fasco:minicart:open", showCart)
  }, [])

  useEffect(() => {
    if (!open) return

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[310]">
          <motion.button
            type="button"
            aria-label="Close mini cart"
            className="absolute inset-0 h-full w-full cursor-default bg-black/40"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="mini-cart-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-[480px] flex-col overflow-y-auto bg-white shadow-2xl dark:bg-[#171717]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}>
            <header className="flex shrink-0 items-center justify-between border-b border-[#e5e5e5] px-6 py-5 dark:border-[#333]">
              <div>
                <h2 id="mini-cart-title" className="font-Display text-[24px] font-semibold text-black dark:text-white">
                  Shopping Cart
                </h2>
                <p className="mt-1 text-[13px] text-[#777] dark:text-[#aaa]">
                  {cartCount} {cartCount === 1 ? "item" : "items"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close mini cart"
                className="grid h-10 w-10 place-items-center rounded-full text-[#484848] transition-colors hover:bg-[#f3f3f3] dark:text-white dark:hover:bg-[#292929]">
                <LuX size={22} />
              </button>
            </header>

            {cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <LuShoppingBag size={42} className="text-[#999]" />
                <p className="mt-5 font-Display text-[22px] font-semibold text-black dark:text-white">
                  Your cart is empty
                </p>
                <p className="mt-2 text-[14px] text-[#777] dark:text-[#aaa]">
                  Add something you love and it will show up here.
                </p>
                <Link
                  to="/shop"
                  onClick={() => setOpen(false)}
                  className="mt-7 flex h-12 w-full max-w-[280px] items-center justify-center rounded-[6px] bg-black text-[14px] font-medium text-white transition-colors hover:bg-[#333] dark:bg-white dark:text-black dark:hover:bg-[#ddd]">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <>
                <div className="min-h-[160px] flex-1 overflow-y-auto px-6">
                  {cart.map((item) => (
                    <article key={item.id} className="flex gap-4 border-b border-[#e5e5e5] py-5 dark:border-[#333]">
                      <Link
                        to={`/product/${item.id}`}
                        onClick={() => setOpen(false)}
                        className="h-[116px] w-[88px] shrink-0 overflow-hidden bg-[#f2f2f2] dark:bg-[#292929]">
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <Link
                            to={`/product/${item.id}`}
                            onClick={() => setOpen(false)}
                            className="line-clamp-2 font-Display text-[16px] font-semibold text-black hover:underline dark:text-white">
                            {item.title}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id, item.size, item.color)}
                            aria-label={`Remove ${item.title} from cart`}
                            className="shrink-0 text-[#888] transition-colors hover:text-black dark:hover:text-white">
                            <LuX size={18} />
                          </button>
                        </div>
                        {(item.size || item.color) && (
                          <p className="mt-1 text-[12px] text-[#777] dark:text-[#aaa]">
                            {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                        <p className="mt-2 text-[14px] font-medium text-black dark:text-white">
                          {formatPrice(item.price)}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div className="flex h-8 items-center rounded-[4px] border border-[#d9d9d9] dark:border-[#444]">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                              aria-label={`Decrease quantity of ${item.title}`}
                              className="grid h-8 w-8 place-items-center text-[#555] dark:text-[#ddd]">
                              <LuMinus size={13} />
                            </button>
                            <span className="min-w-7 text-center text-[13px] tabular-nums text-black dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                              aria-label={`Increase quantity of ${item.title}`}
                              className="grid h-8 w-8 place-items-center text-[#555] dark:text-[#ddd]">
                              <LuPlus size={13} />
                            </button>
                          </div>
                          <span className="text-[14px] font-semibold text-black dark:text-white">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <footer className="shrink-0 border-t border-[#e5e5e5] px-6 py-5 dark:border-[#333]">
                  <div className="flex items-center justify-between">
                    <span className="font-Display text-[18px] font-semibold text-black dark:text-white">Subtotal</span>
                    <span className="font-Display text-[18px] font-semibold text-black dark:text-white">
                      {formatPrice(cartSubtotal)}
                    </span>
                  </div>
                  <p className="mt-2 text-[12px] text-[#777] dark:text-[#aaa]">
                    Shipping and taxes calculated at checkout.
                  </p>
                  <Link
                    to="/checkout"
                    onClick={() => setOpen(false)}
                    className="mt-5 flex h-[50px] w-full items-center justify-center rounded-[6px] bg-black text-[14px] font-medium text-white transition-colors hover:bg-[#333] dark:bg-white dark:text-black dark:hover:bg-[#ddd]">
                    Check Out
                  </Link>
                  <Link
                    to="/cart"
                    onClick={() => setOpen(false)}
                    className="mt-3 flex h-[46px] w-full items-center justify-center rounded-[6px] border border-[#d9d9d9] text-[14px] font-medium text-black transition-colors hover:bg-[#f5f5f5] dark:border-[#444] dark:text-white dark:hover:bg-[#292929]">
                    View Cart
                  </Link>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}

export default MiniCart
