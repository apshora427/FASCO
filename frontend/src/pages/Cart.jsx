import { useState } from "react"
import { Link } from "react-router"
import { LuChevronRight, LuCheck, LuMinus, LuPlus } from "react-icons/lu"
import Navbar from "../components/Navbar"
import Newsletter from "../components/Newsletter"
import Footer from "../components/Footer"
import { UseStore } from "../context/StoreContext"
import { formatPrice } from "../data/products"

const GIFT_WRAP_PRICE = 10
const pad = (n) => String(n).padStart(2, "0")

// column rhythm sampled from the Figma "Cart Page" frame (of the 1280px rail):
// Product 0 · Price 382 · Quantity 701 · Total right-aligned
const COLS = "md:grid-cols-[29.8%_24.9%_26.5%_18.8%]"

const Cart = () => {
  const { cart, cartSubtotal, updateQuantity, removeFromCart } = UseStore()
  const [wrapped, setWrapped] = useState(false)

  const subtotal = cartSubtotal + (wrapped ? GIFT_WRAP_PRICE : 0)

  return (
    <main className="bg-white">
      <Navbar variant="shop" />

      <div className="container pt-[clamp(32px,3.4vw,48px)] pb-[clamp(48px,6vw,96px)]">
        <h1 className="text-center font-Display text-[clamp(32px,2.4vw,46px)] leading-[1.15] text-black dark:text-white">
          Shopping Cart
        </h1>

        <nav aria-label="Breadcrumb" className="mt-[26px] flex items-center justify-center gap-3 text-[clamp(14px,1.15vw,17px)]">
          <Link to="/" className="text-[#606060] transition-colors hover:text-black dark:text-[#a1a1aa]">
            Home
          </Link>
          <LuChevronRight size={14} className="text-[#c4c4c4]" />
          <span className="text-[#404040] dark:text-[#e5e7eb]">Your Shopping Cart</span>
        </nav>

        {cart.length === 0 ? (
          <div className="py-[80px] text-center">
            <p className="font-Display text-[clamp(22px,1.8vw,28px)] text-black dark:text-white">
              Your cart is empty
            </p>
            <p className="mt-3 text-[clamp(14px,1.15vw,17px)] text-[#8a8a8a]">
              Looks like you haven&apos;t added anything yet.
            </p>
            <Link to="/shop" className="btn-dark mt-8 px-[62px] tracking-[0.02em]">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* table head (desktop) */}
            <div
              className={`mt-[60px] hidden border-b border-[#D9D9D9] pb-6 font-Display text-[clamp(17px,1.4vw,24px)] font-bold text-black dark:text-white md:grid ${COLS}`}>
              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span className="text-right">Total</span>
            </div>

            {cart.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col gap-5 border-b border-[#D9D9D9] pt-8 pb-[56px] md:grid md:items-start md:gap-0 ${COLS}`}>
                {/* product */}
                <div className="flex gap-6 md:gap-10">
                  <Link
                    to={`/product/${item.id}`}
                    className="block aspect-[3/4] w-[120px] shrink-0 overflow-hidden bg-[#E3E3E3] md:w-[154px] dark:bg-[#262626]"
                    aria-label={`View ${item.title}`}>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </Link>
                  <div className="min-w-0">
                    <Link
                      to={`/product/${item.id}`}
                      className="font-Display text-[clamp(18px,1.5vw,22px)] leading-tight font-bold text-black transition-colors hover:text-[#484848] dark:text-white dark:hover:text-[#a1a1aa]">
                      {item.title}
                    </Link>
                    {item.color && (
                      <p className="mt-4 text-[clamp(14px,1.2vw,17px)] leading-none text-[#8a8a8a]">
                        Color : {item.color}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id, item.size, item.color)}
                      className="mt-6 block text-[clamp(14px,1.2vw,17px)] leading-none text-[#8a8a8a] underline underline-offset-[3px] transition-colors hover:text-black dark:hover:text-white">
                      Remove
                    </button>
                  </div>
                </div>

                {/* price */}
                <div className="font-Display text-[clamp(17px,1.4vw,22px)] leading-none font-bold text-black dark:text-white md:pt-1">
                  {formatPrice(item.price)}
                </div>

                {/* quantity */}
                <div className="md:pt-1 md:justify-self-start">
                  <div className="flex h-[44px] w-[115px] items-center justify-between rounded-[4px] border border-[#D9D9D9] px-1 dark:border-[#3f3f3f]">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                      aria-label={`Decrease quantity of ${item.title}`}
                      className="grid h-9 w-9 place-items-center text-[#484848] transition-colors hover:text-black dark:text-[#e5e7eb] dark:hover:text-white">
                      <LuMinus size={16} />
                    </button>
                    <span className="min-w-7 text-center text-[clamp(15px,1.25vw,19px)] leading-none tabular-nums text-[#9F9F9F]">
                      {pad(item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                      aria-label={`Increase quantity of ${item.title}`}
                      className="grid h-9 w-9 place-items-center text-[#484848] transition-colors hover:text-black dark:text-[#e5e7eb] dark:hover:text-white">
                      <LuPlus size={16} />
                    </button>
                  </div>
                </div>

                {/* line total */}
                <div className="font-Display text-[clamp(17px,1.4vw,22px)] leading-none font-bold text-black dark:text-white md:pt-1 md:text-right">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}

            {/* summary — right half, exactly like the frame */}
            <div className="ml-auto mt-[36px] w-full md:w-[33%]">
              <label className="flex cursor-pointer items-center gap-3 border-b border-[#D9D9D9] pb-[22px] dark:border-[#2a2a2a]">
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
                  For <b className="font-semibold text-black dark:text-white">{formatPrice(GIFT_WRAP_PRICE)}</b> Please
                  Wrap The Product
                </span>
              </label>

              <div className="flex items-center justify-between pt-[40px]">
                <span className="font-Display text-[clamp(20px,1.8vw,28px)] font-bold text-black dark:text-white">
                  Subtotal
                </span>
                <span className="font-Display text-[clamp(20px,1.8vw,28px)] font-bold text-black dark:text-white">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <Link
                to="/checkout"
                className="mt-[26px] flex h-[62px] w-full items-center justify-center rounded-[10px] bg-black text-[17px] leading-none text-white shadow-[0_20px_35px_rgba(0,0,0,0.15)] transition-colors hover:bg-[#2d2a2a] dark:bg-white dark:text-[#121212] dark:hover:bg-[#d4d4d8]">
                Checkout
              </Link>

              <div className="mt-6 text-center">
                <Link
                  to="/cart"
                  className="text-[17px] leading-none font-semibold text-black underline underline-offset-2 dark:text-white">
                  View Cart
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      <Newsletter />
      <Footer />
    </main>
  )
}

export default Cart
