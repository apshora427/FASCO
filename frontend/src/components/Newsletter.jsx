import { useState } from "react"
import { toast } from "react-toastify"
import newsletterLeft from "../assets/shop/shop_page_19.png"
import newsletterRight from "../assets/shop/shop_page_20.png"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Newsletter = () => {
  const [email, setEmail] = useState("")

  const subscribe = (e) => {
    e.preventDefault()
    if (!EMAIL_REGEX.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }
    toast.success("Subscribed to the FASCO newsletter!")
    setEmail("")
  }

  return (
    <section className="relative flex h-[465px] items-center overflow-hidden bg-white">
      <img
        src={newsletterLeft}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-[12%] h-[86%] w-auto object-contain"
      />
      <img
        src={newsletterRight}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-[13%] h-[86%] w-auto object-contain"
      />

      <div className="relative z-10 mx-auto max-w-[640px] px-[16px] text-center">
        <h2 className="font-Display text-[24px] font-bold text-black">
          Subscribe To Our Newsletter
        </h2>
        <p className="mt-[9px] text-[8px] leading-[12px] text-subtext">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque
          du du is ultrices sollicitudin aliquam sem. Scelerisque du du is
          ultrices sollicitudin.
        </p>

        <form onSubmit={subscribe} className="mx-auto mt-[22px] w-[308px] max-w-full bg-[#F5F5F5]">
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="michael@ymail.com"
            aria-label="Email address"
            className="w-full border-b border-[#E3E3E3] bg-transparent px-[14px] pb-[7px] pt-[12px] text-[9px] text-black outline-none transition-colors placeholder:text-[#9C9C9C] focus:border-[#B9B9B9]"
          />
          <button
            type="submit"
            className="mx-auto my-[10px] block rounded-[4px] bg-black px-[27px] py-[9px] text-[8px] text-white shadow-[0_7px_14px_rgba(0,0,0,0.18)] transition-colors hover:bg-[#222]">
            Subscribe Now
          </button>
        </form>
      </div>
    </section>
  )
}

export default Newsletter
