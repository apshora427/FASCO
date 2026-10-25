import { Link } from "react-router"
import { LuChevronDown, LuHeart, LuSearch, LuShoppingBag, LuUser } from "react-icons/lu"

const homeLinks = [
  { label: "Home", to: "/" },
  { label: "Deals", href: "#deals" },
  { label: "New Arrivals", href: "#new-arrivals" },
  { label: "Packages", to: "/shop" },
]

const shopLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Products", to: "/shop" },
]

// Header measured off the Figma frames: 10.31% tall, content on the shared
// 16.3% page margin, nav text at 0.92vw, Sign Up pill 8.06×4.19vw.
const Navbar = ({ variant = "home" }) => {
  const isShop = variant === "shop"

  return (
    <header className="bg-white">
      <div
        className="flex items-center justify-between"
        style={{
          height: "10.31vw",
          paddingLeft: "16.3vw",
          paddingRight: isShop ? "14.4vw" : "16.3vw",
        }}>
        <Link
          to="/"
          className="font-Display font-semibold text-black leading-none"
          style={{ fontSize: "2.85vw", letterSpacing: "0.01em" }}>
          FASCO
        </Link>

        <div className="flex items-center" style={{ gap: isShop ? "3vw" : "2.6vw" }}>
          <nav className="flex items-center" style={{ gap: "2.9vw" }}>
            {isShop
              ? shopLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="text-black hover:text-subtext transition-colors whitespace-nowrap"
                    style={{ fontSize: "0.92vw" }}>
                    {link.label}
                  </Link>
                ))
              : homeLinks.map((link) =>
                  link.href ? (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-black hover:text-subtext transition-colors whitespace-nowrap"
                      style={{ fontSize: "0.92vw" }}>
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.label}
                      to={link.to}
                      className="text-black hover:text-subtext transition-colors whitespace-nowrap"
                      style={{ fontSize: "0.92vw" }}>
                      {link.label}
                    </Link>
                  )
                )}

            {isShop ? (
              <button
                type="button"
                className="flex items-center text-black hover:text-subtext transition-colors whitespace-nowrap"
                style={{ fontSize: "0.92vw", gap: "0.3vw" }}>
                Pages
                <LuChevronDown style={{ fontSize: "0.8vw" }} />
              </button>
            ) : (
              <Link
                to="/login"
                className="text-black hover:text-subtext transition-colors whitespace-nowrap"
                style={{ fontSize: "0.92vw" }}>
                Sign In
              </Link>
            )}
          </nav>

          {isShop ? (
            <div className="flex items-center text-black" style={{ gap: "0.8vw" }}>
              <button type="button" aria-label="Search" className="hover:text-subtext transition-colors">
                <LuSearch style={{ fontSize: "1.5vw" }} />
              </button>
              <button type="button" aria-label="Account" className="hover:text-subtext transition-colors">
                <LuUser style={{ fontSize: "1.5vw" }} />
              </button>
              <Link to="/shop" aria-label="Wishlist" className="hover:text-subtext transition-colors">
                <LuHeart style={{ fontSize: "1.5vw" }} />
              </Link>
              <Link to="/cart" aria-label="Cart" className="hover:text-subtext transition-colors">
                <LuShoppingBag style={{ fontSize: "1.5vw" }} />
              </Link>
            </div>
          ) : (
            <Link
              to="/sign_up"
              className="flex items-center justify-center bg-black text-white font-medium whitespace-nowrap hover:bg-[#222] transition-colors"
              style={{ width: "8.06vw", height: "4.19vw", borderRadius: "0.43vw", fontSize: "0.95vw" }}>
              Sign Up
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
