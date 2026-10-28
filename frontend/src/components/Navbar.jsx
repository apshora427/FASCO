import { useState } from "react"
import { Link } from "react-router"
import { LuChevronDown, LuHeart, LuMenu, LuSearch, LuShoppingBag, LuUser, LuX } from "react-icons/lu"
import { UseStore } from "../context/StoreContext"

const homeLinks = [
  { label: "Home", to: "/" },
  { label: "Deals", href: "#deals" },
  { label: "New Arrivals", href: "#new-arrivals" },
  { label: "Reviews", href: "#testimonials" },
]

const shopLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Products", to: "/shop" },
]

const NavLink = ({ link, onClick }) =>
  link.href ? (
    <a
      href={link.href}
      onClick={onClick}
      className="group relative whitespace-nowrap leading-none text-[#484848] transition-colors hover:text-black"
      style={{ fontSize: "clamp(14px, 1.12vw, 16px)" }}>
      {link.label}
      <span className="absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-[#484848] transition-transform duration-300 group-hover:scale-x-100" />
    </a>
  ) : (
    <Link
      to={link.to}
      onClick={onClick}
      className="group relative whitespace-nowrap leading-none text-[#484848] transition-colors hover:text-black"
      style={{ fontSize: "clamp(14px, 1.12vw, 16px)" }}>
      {link.label}
      <span className="absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-[#484848] transition-transform duration-300 group-hover:scale-x-100" />
    </Link>
  )

const Navbar = ({ variant = "home" }) => {
  const [open, setOpen] = useState(false)
  const { cartCount, wishlistCount } = UseStore()
  const isShop = variant === "shop"
  const links = isShop ? shopLinks : homeLinks

  return (
    <header className="relative z-40 bg-white">
      <div
        className="container flex items-end"
        style={{ minHeight: "clamp(72px, 10.15vw, 146px)" }}>
        <div
          className="flex w-full items-center justify-between"
          style={{
            paddingTop: "clamp(15px, 1.4vw, 20px)",
            paddingBottom: "clamp(15px, 1.4vw, 20px)",
          }}>
          <Link
            to="/"
            className="font-Display leading-none text-[#484848]"
            style={{ fontSize: "clamp(36px, 3.63vw, 52px)" }}>
            FASCO
          </Link>

          <nav
            className="hidden flex-1 items-center justify-end md:flex"
            style={{
              gap: "clamp(26px, 4.03vw, 58px)",
              paddingRight: "clamp(20px, 4.03vw, 58px)",
            }}>
            {links.map((link) => (
              <NavLink key={link.label} link={link} />
            ))}
            {isShop && (
              <button
                type="button"
                className="flex items-center gap-1 whitespace-nowrap text-[#484848] transition-colors hover:text-black"
                style={{ fontSize: "clamp(14px, 1.12vw, 16px)" }}>
                Pages
                <LuChevronDown size={14} />
              </button>
            )}
          </nav>

          <div className="hidden items-center md:flex" style={{ gap: "clamp(20px, 4.03vw, 58px)" }}>
            {isShop ? (
              <div className="flex items-center gap-5 text-[#484848]">
                <button type="button" aria-label="Search" className="transition-colors hover:text-black">
                  <LuSearch size={22} />
                </button>
                <button type="button" aria-label="Account" className="transition-colors hover:text-black">
                  <LuUser size={22} />
                </button>
                <Link to="/shop" aria-label="Wishlist" className="relative transition-colors hover:text-black">
                  <LuHeart size={22} />
                  {wishlistCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff706b] px-1 text-[10px] text-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link to="/cart" aria-label="Cart" className="relative transition-colors hover:text-black">
                  <LuShoppingBag size={22} />
                  {cartCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff706b] px-1 text-[10px] text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="whitespace-nowrap leading-none text-[#484848] transition-colors hover:text-black"
                  style={{ fontSize: "clamp(14px, 1.12vw, 16px)" }}>
                  Sign in
                </Link>
                <Link
                  to="/sign_up"
                  className="flex items-center justify-center whitespace-nowrap bg-black leading-none text-white transition-colors hover:bg-[#2d2a2a] dark:bg-white dark:text-[#121212] dark:hover:bg-[#d4d4d8]"
                  style={{
                    height: "clamp(46px, 3.9vw, 56px)",
                    paddingInline: "clamp(28px, 3.26vw, 47px)",
                    borderRadius: 10,
                    fontSize: "clamp(14px, 1.12vw, 16px)",
                  }}>
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid h-11 w-11 place-items-center text-[#484848] md:hidden">
            {open ? <LuX size={26} /> : <LuMenu size={26} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute inset-x-0 top-full border-t border-line bg-white px-6 py-6 shadow-[0_20px_40px_rgba(0,0,0,0.08)] md:hidden">
          <nav className="flex flex-col gap-5">
            {links.map((link) => (
              <NavLink key={link.label} link={link} onClick={() => setOpen(false)} />
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="text-[#484848]"
              style={{ fontSize: "16px" }}>
              Sign In
            </Link>
          </nav>
          <Link
            to="/sign_up"
            onClick={() => setOpen(false)}
            className="mt-6 flex h-12 w-full items-center justify-center bg-black text-[15px] font-medium text-white dark:bg-white dark:text-[#121212]">
            Sign Up
          </Link>
          <div className="mt-6 flex items-center justify-center gap-7 text-[#484848]">
            <button type="button" aria-label="Search"><LuSearch size={22} /></button>
            <button type="button" aria-label="Account"><LuUser size={22} /></button>
            <Link to="/shop" aria-label="Wishlist"><LuHeart size={22} /></Link>
            <Link to="/cart" aria-label="Cart" className="relative">
              <LuShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff706b] px-1 text-[10px] text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
