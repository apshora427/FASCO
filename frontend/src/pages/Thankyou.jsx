import { useEffect, useRef } from "react"
import { Link, useLocation } from "react-router"
import { LuCheck } from "react-icons/lu"
import Navbar from "../components/Navbar"
import Newsletter from "../components/Newsletter"
import Footer from "../components/Footer"
import { UseStore } from "../context/StoreContext"

const Thankyou = () => {
  const { clearCart } = UseStore()
  const location = useLocation()
  const cartWasCleared = useRef(false)

  useEffect(() => {
    if (!cartWasCleared.current && new URLSearchParams(location.search).get("payment") === "success") {
      cartWasCleared.current = true
      clearCart()
    }
  }, [clearCart, location.search])

  return (
    <main className="bg-white">
      <Navbar variant="shop" />

      <div className="container flex flex-col items-center pt-[clamp(48px,6vw,96px)] pb-[clamp(56px,8vw,120px)] text-center">
        <span
          aria-hidden="true"
          className="grid h-[86px] w-[86px] place-items-center rounded-full bg-black text-white dark:bg-white dark:text-[#121212]">
          <LuCheck size={40} />
        </span>

        <h1 className="mt-[34px] font-Display text-[clamp(32px,2.9vw,52px)] leading-[1.15] text-black dark:text-white">
          Thank You
        </h1>

        <p className="mt-5 max-w-[560px] text-[clamp(15px,1.2vw,18px)] leading-[1.6] text-[#8a8a8a]">
          Your payment was completed successfully. We&apos;ll email your order
          confirmation and keep you updated as it ships.
        </p>

        <Link to="/shop" className="btn-dark mt-[42px] px-[62px] tracking-[0.02em]">
          Continue Shopping
        </Link>
      </div>

      <Newsletter />
      <Footer />
    </main>
  )
}
export default Thankyou
