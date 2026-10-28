import { useState } from "react"
import { toast } from "react-toastify"
import { subscribe as subscribeRequest } from "../api/backend"
import newsletterLeft from "../assets/figma/newsletter-left.png"
import newsletterRight from "../assets/figma/newsletter-right.png"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Newsletter = () => {
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // writes the inbox to the subscribers collection (admin dashboard reads it)
  const subscribe = async (e) => {
    e.preventDefault()
    if (!EMAIL_REGEX.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }
    setSubmitting(true)
    try {
      const res = await subscribeRequest(email.trim())
      if (!res?.success) {
        toast.error(res?.message || "We couldn't subscribe you right now. Please try again.")
        return
      }
      toast.success(res.message || "Subscribed to the FASCO newsletter!")
      setEmail("")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="relative mt-[clamp(40px,10.4vw,150px)] overflow-hidden bg-white">
      <div className="container">
        <div className="relative mx-auto flex w-full flex-col items-center pt-[clamp(60px,14.4vw,207px)] pb-[clamp(60px,17.9vw,257px)]">
          <img
            src={newsletterLeft}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-[-25%] h-full w-auto max-w-none object-cover opacity-30 sm:left-[-10%] lg:left-[-4.6875%] lg:opacity-100"
          />
          <img
            src={newsletterRight}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute top-0 right-[-25%] h-full w-auto max-w-none object-cover opacity-30 sm:right-[-10%] lg:right-[-4.6875%] lg:opacity-100"
          />

          <div className="relative z-10 mb-[30px] w-full text-center">
            <h2 className="section-title">Subscribe To Our Newsletter</h2>
            <p className="section-copy mx-auto mt-5 max-w-[614px]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque
              duis ultrices sollicitudin aliquam sem. Scelerisque duis ultrices
              sollicitudin.
            </p>
          </div>

          <form
            onSubmit={subscribe}
            className="relative z-10 flex w-full max-w-[631px] flex-col gap-[30px]">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="michael@ymail.com"
              aria-label="Email address"
              autoComplete="email"
              required
              disabled={submitting}
              className="w-full border border-white bg-white px-[27px] py-[29px] text-[22px] leading-[1.18] text-black shadow-[0_3px_3px_rgba(0,0,0,0.01),0_13px_7px_rgba(0,0,0,0.02),0_33px_13px_rgba(0,0,0,0.02),0_63px_25px_rgba(0,0,0,0.02),0_106px_47px_rgba(0,0,0,0.03),0_163px_80px_rgba(0,0,0,0.04)] outline-none placeholder:text-[#8a8a8a] focus:border-[#e6e6e6]"
            />
            <button
              type="submit"
              disabled={submitting}
              className="btn-dark self-center"
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "13.333px",
                lineHeight: "normal",
                minHeight: 0,
                padding: "19px 45px",
              }}>
              {submitting ? "Subscribing…" : "Subscribe Now"}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Newsletter
