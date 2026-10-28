import { Link } from "react-router"
import { LuCheck } from "react-icons/lu"
import Navbar from "../components/Navbar"
import Newsletter from "../components/Newsletter"
import Footer from "../components/Footer"

const Thankyou = () => (
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
        Your order has been placed successfully. A confirmation email is on its
        way — we&apos;ll let you know as soon as it ships.
      </p>

      <Link to="/shop" className="btn-dark mt-[42px] px-[62px] tracking-[0.02em]">
        Continue Shopping
      </Link>
    </div>

    <Newsletter />
    <Footer />
  </main>
)

export default Thankyou
