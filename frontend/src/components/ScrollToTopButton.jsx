import { Link } from "react-router"
import { LuArrowUp, LuShoppingCart } from "react-icons/lu"

// Figma: two 3.1vw buttons flush with the bottom of the hero, 1.83vw from the
// right edge, 1.83vw apart.
const ScrollToTopButton = () => (
  <div
    className="absolute flex items-end"
    style={{ right: "1.83vw", bottom: 0, gap: "1.83vw", zIndex: 20 }}>
    <Link
      to="/cart"
      aria-label="Open cart"
      className="flex items-center justify-center bg-black text-white hover:bg-[#222] transition-colors"
      style={{ width: "3.1vw", height: "3.1vw", borderRadius: "0.45vw", boxShadow: "0 0.4vw 1vw rgba(0,0,0,0.18)" }}>
      <LuShoppingCart style={{ fontSize: "1.55vw" }} />
    </Link>
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className="flex items-center justify-center bg-white text-black transition-shadow"
      style={{ width: "3.1vw", height: "3.1vw", borderRadius: "9999px", border: "0.11vw solid #D9D9D9", boxShadow: "0 0.3vw 0.9vw rgba(0,0,0,0.10)" }}>
      <LuArrowUp style={{ fontSize: "1.5vw" }} />
    </button>
  </div>
)

export default ScrollToTopButton
