import { Link } from "react-router"

const defaultLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Shopping cart", href: "/cart" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "My account", href: "/account" },
]

const Footer = ({ links = defaultLinks, brandName = "FASCO", copyright = "All Rights Reserved" }) => (
  <footer className="bg-white">
    <div className="h-[2px] w-full bg-[#dedfe1]" />
    <div className="container">
      <div className="flex flex-col items-center gap-5 py-5 md:flex-row md:justify-between md:pt-[30px] md:pb-[25px]">
        <Link
          to="/"
          className="font-Display text-[32px] leading-none text-[#484848]">
          {brandName}
        </Link>
        <nav className="flex flex-wrap justify-center gap-x-[38px] gap-y-2.5 md:pl-10">
          {links.map(({ label, href }) => (
            <Link
              key={label}
              to={href}
              className="text-[16px] text-[#484848] transition-colors hover:text-black">
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="py-[24px] text-center text-[12px] leading-[2.17] text-[#484848]">
        Copyright © {new Date().getFullYear()} {brandName}. {copyright}
      </p>
    </div>
  </footer>
)

export default Footer
