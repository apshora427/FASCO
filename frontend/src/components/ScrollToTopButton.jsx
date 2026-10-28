import { Link } from "react-router"
import { LuArrowUp, LuShoppingCart } from "react-icons/lu"

const ScrollToTopButton = () => (
  <div
    className="absolute z-20 flex items-end"
    style={{ right: "clamp(15px, 2.8vw, 40px)", bottom: 0, gap: "clamp(10px, 1.3vw, 18px)" }}>
    <Link
      to="/cart"
      aria-label="Open cart"
      className="flex h-[clamp(44px,4vw,57px)] w-[clamp(44px,4vw,57px)] items-center justify-center rounded-[10px] bg-black text-white shadow-[0_8px_20px_rgba(0,0,0,0.18)] transition-colors hover:bg-[#2d2a2a] dark:bg-white dark:text-[#121212] dark:hover:bg-[#d4d4d8]">
      <LuShoppingCart size={22} />
    </Link>
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className="flex h-[clamp(44px,4vw,57px)] w-[clamp(44px,4vw,57px)] items-center justify-center rounded-full border border-[#D9D9D9] bg-white text-black shadow-[0_6px_18px_rgba(0,0,0,0.10)] transition-colors hover:bg-black hover:text-white">
      <LuArrowUp size={22} />
    </button>
  </div>
)

export default ScrollToTopButton
