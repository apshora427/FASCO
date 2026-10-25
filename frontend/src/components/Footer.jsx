import { Link } from "react-router"

const links = [
  "Support Center",
  "Invoicing",
  "Contract",
  "Careers",
  "Blog",
  "FAQs",
]

const Footer = () => (
  <footer className="border-t border-line bg-white">
    <div className="container flex items-center justify-between pb-[13px] pt-[15px]">
      <Link
        to="/"
        className="font-Display text-[16px] font-semibold tracking-[0.04em] text-black">
        FASCO
      </Link>
      <nav className="flex flex-wrap gap-x-[20px] gap-y-[8px]">
        {links.map((label) => (
          <a
            key={label}
            href="#"
            className="text-[7px] text-[#3A3A3A] transition-colors hover:text-black">
            {label}
          </a>
        ))}
      </nav>
    </div>
    <p className="pb-[15px] text-center text-[6px] text-subtext">
      Copyright © 2022 FASCO. All Rights Reserved
    </p>
  </footer>
)

export default Footer
