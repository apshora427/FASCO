import { Link } from "react-router"

const links = [
  { label: "Shop", to: "/shop" },
  { label: "Shopping cart", to: "/cart" },
  { label: "Wishlist", to: "/wishlist" },
  { label: "My account", to: "/account" },
]

const Footer = () => (
  <footer className="bg-white">
    <div className="h-[2px] w-full bg-[#dedfe1]" />
    <div className="container">
      <div className="flex flex-col items-center gap-5 py-5 md:flex-row md:justify-between md:pt-[30px] md:pb-[25px]">
        <Link
          to="/"
          className="font-Display text-[32px] leading-none text-[#484848]">
          FASCO
        </Link>
        <nav className="flex flex-wrap justify-center gap-x-[38px] gap-y-2.5 md:pl-10">
          {links.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="text-[16px] text-[#484848] transition-colors hover:text-black">
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="py-[24px] text-center text-[12px] leading-[2.17] text-[#484848]">
        Copyright © {new Date().getFullYear()} FASCO. All Rights Reserved
      </p>
    </div>
  </footer>
)

export default Footer
