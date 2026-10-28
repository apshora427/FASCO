import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { toast } from "react-toastify"
import { LuChevronDown, LuLock } from "react-icons/lu"
import Navbar from "../components/Navbar"
import Newsletter from "../components/Newsletter"
import Footer from "../components/Footer"
import { UseStore } from "../context/StoreContext"
import { UseUser } from "../context/UserContext"
import { placeOrder, validateCoupon } from "../api/backend"
import { formatPrice, COUPON_CODE, COUPON_DISCOUNT } from "../data/products"

const SHIPPING_FLAT = 40
const FREE_SHIPPING_OVER = 75 // same threshold the product page and mini cart promise

const COUNTRIES = ["United States", "United Kingdom", "Canada", "Australia", "Pakistan", "Germany", "France"]

const inputBase =
  "w-full rounded-[6px] border border-[#D9D9D9] bg-white px-6 text-[16px] leading-none text-black outline-none transition-colors placeholder:text-[#999999] focus:border-[#9F9F9F] dark:border-[#3f3f3f] dark:bg-[#1b1b1b] dark:text-white dark:placeholder:text-[#6b6b6b]"

const SectionTitle = ({ children }) => (
  <h2 className="font-Display text-[clamp(30px,2.6vw,46px)] leading-[1.15] text-[#484848] dark:text-[#e5e7eb]">
    {children}
  </h2>
)

const SaveInfo = ({ label, checked, onChange }) => (
  <label className="flex cursor-pointer items-center gap-3">
    <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
    <span
      aria-hidden="true"
      className="grid h-7 w-7 shrink-0 place-items-center rounded-[2px] border-2 border-[#1a1a1a] text-transparent transition-colors peer-checked:bg-[#1a1a1a] peer-checked:text-white dark:border-[#e5e7eb] dark:peer-checked:bg-[#e5e7eb] dark:peer-checked:text-[#121212]">
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M4 10.5 8 14.5 16 5.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
    <span className="text-[clamp(13px,1.1vw,16px)] leading-none text-[#999999]">{label}</span>
  </label>
)

// Compact Mastercard mark from the design's payment method row.
const MastercardMark = () => (
  <svg viewBox="0 0 34 22" className="h-[22px] w-[34px] shrink-0" role="img" aria-label="Mastercard">
    <rect width="34" height="22" rx="2.5" fill="#16325C" />
    <circle cx="14" cy="11" r="5.6" fill="#EB001B" />
    <circle cx="20" cy="11" r="5.6" fill="#F79E1B" fillOpacity="0.9" />
  </svg>
)

const Checkout = () => {
  const { cart, cartSubtotal, clearCart } = UseStore()
  const { currentUser } = UseUser()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: currentUser?.email || "",
    first: currentUser?.name?.split(" ")[0] || "",
    last: currentUser?.name?.split(" ").slice(1).join(" ") || "",
    address: "",
    city: "",
    postal: "",
    country: "",
    card: "",
    exp: "",
    cvc: "",
    holder: "",
  })
  const [saveDelivery, setSaveDelivery] = useState(false)
  const [savePayment, setSavePayment] = useState(false)
  const [code, setCode] = useState("")
  const [appliedCode, setAppliedCode] = useState(null)

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))

  const applyDiscount = async (event) => {
    event.preventDefault()
    if (!code.trim()) {
      toast.info("Enter a discount code first")
      return
    }
    // the backend owns coupons now — validate against the database
    const res = await validateCoupon(code.trim(), cartSubtotal)
    if (res?.success) {
      setAppliedCode(res.coupon.code)
      toast.success(res.message)
    } else if (res === null) {
      // backend unreachable — keep the advertised demo code working
      if (code.trim().toUpperCase() === COUPON_CODE) {
        setAppliedCode(COUPON_CODE)
        toast.success(`Code ${COUPON_CODE} applied`)
      } else {
        setAppliedCode(null)
        toast.error("Invalid discount code")
      }
    } else {
      setAppliedCode(null)
      toast.error(res?.message || "Invalid discount code")
    }
  }

  const discountAmount = appliedCode ? cartSubtotal * COUPON_DISCOUNT : 0
  const shipping = cartSubtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FLAT
  const total = Math.max(0, cartSubtotal - discountAmount) + (cart.length ? shipping : 0)

  const payNow = async (event) => {
    event.preventDefault()
    if (cart.length === 0) {
      toast.info("Your cart is empty")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Please enter a valid email address")
      return
    }

    // the order is written to MongoDB (prices re-computed server-side)
    const res = await placeOrder({
      items: cart.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        size: item.size || "",
        color: item.color || "",
      })),
      customer: {
        email: form.email,
        firstName: form.first,
        lastName: form.last,
        address: form.address,
        city: form.city,
        postal: form.postal,
        country: form.country,
      },
      discountCode: appliedCode || "",
    })

    if (res === null) {
      toast.error("Could not connect to the server. Your order was not placed. Please try again.")
      return
    }
    if (!res.success || !res.order) {
      toast.error(res?.message || "Could not place the order")
      return
    }

    clearCart()
    toast.success(`Order ${res.order.orderNumber} placed successfully`)
    navigate("/thankyou", { state: { order: res.order } })
  }

  return (
    <main className="bg-white">
      <Navbar variant="shop" />

      <h1 className="container pt-[clamp(32px,3.4vw,48px)] pb-[clamp(20px,2vw,28px)] text-center font-Display text-[clamp(30px,2.4vw,46px)] leading-[1.15] text-black dark:text-white">
        FASCO Demo Checkout
      </h1>
      <div className="h-px w-full bg-[#D9D9D9] dark:bg-[#2a2a2a]" />

      <div className="relative overflow-hidden">
        <div className="container pt-[28px]">
          <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* ---------------- left: the form ---------------- */}
          <form onSubmit={payNow} className="pt-[36px] pb-[40px] lg:pr-[60px]">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <SectionTitle>Contact</SectionTitle>
              <p className="text-[clamp(13px,1.05vw,16px)] text-[#8a8a8a]">
                Have an account?{" "}
                <Link to="/login" className="text-[#3B5BFF] underline underline-offset-2">
                  Create Account
                </Link>
              </p>
            </div>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="Email Address"
              aria-label="Email Address"
              className={`${inputBase} mt-[30px] h-[68px]`}
            />

            <div className="mt-[56px]">
              <SectionTitle>Delivery</SectionTitle>
            </div>

            <div className="mt-[30px] flex flex-col gap-[26px]">
              <div className="relative">
                <select
                  value={form.country}
                  onChange={set("country")}
                  aria-label="Country / Region"
                  className={`${inputBase} h-[58px] appearance-none pr-12 ${form.country ? "" : "text-[#999999]"}`}>
                  <option value="">Country / Region</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                <LuChevronDown
                  size={18}
                  className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-[#484848] dark:text-[#e5e7eb]"
                />
              </div>

              <div className="grid grid-cols-1 gap-[26px] sm:grid-cols-2">
                <input value={form.first} onChange={set("first")} placeholder="First Name" aria-label="First Name" className={`${inputBase} h-[58px]`} />
                <input value={form.last} onChange={set("last")} placeholder="Last Name" aria-label="Last Name" className={`${inputBase} h-[58px]`} />
              </div>

              <input value={form.address} onChange={set("address")} placeholder="Address" aria-label="Address" className={`${inputBase} h-[58px]`} />

              <div className="grid grid-cols-1 gap-[26px] sm:grid-cols-2">
                <input value={form.city} onChange={set("city")} placeholder="City" aria-label="City" className={`${inputBase} h-[58px]`} />
                <input value={form.postal} onChange={set("postal")} placeholder="Postal Code" aria-label="Postal Code" className={`${inputBase} h-[58px]`} />
              </div>

              <SaveInfo
                label="Save This Info For Future"
                checked={saveDelivery}
                onChange={(event) => setSaveDelivery(event.target.checked)}
              />
            </div>

            <div className="mt-[56px]">
              <SectionTitle>Payment</SectionTitle>
            </div>

            <div className="relative mt-[30px]">
              <div className={`${inputBase} flex h-[58px] items-center justify-between border-[#9F9F9F] pr-5`}>
                <span>Credit Card</span>
                <span className="flex items-center gap-3">
                  <MastercardMark />
                  <LuChevronDown size={18} className="text-[#484848] dark:text-[#e5e7eb]" />
                </span>
              </div>
            </div>

            <div className="mt-[18px] flex flex-col gap-[18px] rounded-[6px] bg-[#F5F5F5] p-[22px] dark:bg-[#1a1a1a]">
              <div className="relative">
                <input value={form.card} onChange={set("card")} placeholder="Card Number" aria-label="Card Number" className={`${inputBase} h-[52px] pr-14`} />
                <LuLock size={17} className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-[#9a9a9a]" />
              </div>
              <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
                <input value={form.exp} onChange={set("exp")} placeholder="Expiration Date" aria-label="Expiration Date" className={`${inputBase} h-[52px]`} />
                <input value={form.cvc} onChange={set("cvc")} placeholder="Security Code" aria-label="Security Code" className={`${inputBase} h-[52px]`} />
              </div>
              <input value={form.holder} onChange={set("holder")} placeholder="Card Holder Name" aria-label="Card Holder Name" className={`${inputBase} h-[52px]`} />
              <SaveInfo
                label="Save This Info For Future"
                checked={savePayment}
                onChange={(event) => setSavePayment(event.target.checked)}
              />
            </div>

            <button
              type="submit"
              className="mt-[26px] flex h-[62px] w-full items-center justify-center rounded-[10px] bg-black text-[17px] leading-none text-white shadow-[0_20px_35px_rgba(0,0,0,0.15)] transition-colors hover:bg-[#2d2a2a] dark:bg-white dark:text-[#121212] dark:hover:bg-[#d4d4d8]">
              Pay Now
            </button>

            <p className="mt-[22px] text-center text-[13px] leading-[2.17] text-[#9a9a9a]">
              Copyright © 2022 FASCO. All Rights Reserved.
            </p>
          </form>

          {/* ---------------- right: order summary ---------------- */}
          <div className="relative pb-[64px] pt-[54px] lg:pr-[28px] lg:pl-[52px]">
            {/* the panel background bleeds to the right edge of the window, as in the frame */}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 right-[-100vw] bg-[#F5F5F5] dark:bg-[#1a1a1a] lg:-left-6"
            />

            <div className="relative">
              {cart.length === 0 ? (
                <p className="text-[clamp(14px,1.15vw,17px)] text-[#8a8a8a]">
                  Your cart is empty — <Link to="/shop" className="font-semibold text-black underline underline-offset-2 dark:text-white">go shopping</Link>
                </p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-[22px]">
                    <div className="relative shrink-0">
                      <Link
                        to={`/product/${item.id}`}
                        className="block aspect-[3/4] w-[110px] overflow-hidden bg-[#E3E3E3] sm:w-[136px] dark:bg-[#262626]"
                        aria-label={`View ${item.title}`}>
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                      </Link>
                      <span className="absolute -top-2 -right-2 grid h-[22px] w-[22px] place-items-center rounded-full bg-[#FF0606] text-[12px] leading-none font-bold text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/product/${item.id}`}
                        className="font-Display text-[clamp(17px,1.35vw,21px)] leading-tight font-bold text-black transition-colors hover:text-[#484848] dark:text-white dark:hover:text-[#a1a1aa]">
                        {item.title}
                      </Link>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="text-[clamp(13px,1.05vw,16px)] leading-none text-[#8a8a8a]">
                          {item.color || item.category}
                        </span>
                        <span className="text-[clamp(14px,1.1vw,17px)] leading-none text-black dark:text-white">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <form onSubmit={applyDiscount} className="mt-[36px] flex items-center gap-[13px]">
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="Discount code"
                  aria-label="Discount code"
                  className={`${inputBase} h-[68px] border-0 pr-6`}
                />
                <button
                  type="submit"
                  className="h-[64px] w-[120px] shrink-0 rounded-[10px] bg-black text-[17px] leading-none text-white shadow-[0_18px_30px_rgba(0,0,0,0.18)] transition-colors hover:bg-[#2d2a2a] sm:w-[158px] dark:bg-white dark:text-[#121212] dark:hover:bg-[#d4d4d8]">
                  Apply
                </button>
              </form>

              <div className="mt-[30px] flex flex-col gap-[14px] text-[clamp(14px,1.2vw,17px)] leading-[1.4]">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#8a8a8a]">Subtotal</span>
                  <span className="text-black dark:text-white">{formatPrice(cartSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#8a8a8a]">Discount ({appliedCode})</span>
                    <span className="text-black dark:text-white">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#8a8a8a]">Shipping</span>
                  {shipping > 0 ? (
                    <span className="text-black dark:text-white">{formatPrice(shipping)}</span>
                  ) : (
                    <span className="font-semibold text-black dark:text-white">Free</span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-4 font-semibold">
                  <span className="text-black dark:text-white">Total</span>
                  <span className="text-black dark:text-white">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      <Newsletter />
      <Footer />
    </main>
  )
}

export default Checkout
