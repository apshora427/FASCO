import { useState } from "react"
import { toast } from "react-toastify"
import { subscribe as subscribeRequest } from "../api/backend"
import { useHomepageContent } from "../hooks/useHomepageContent.js"
import { resolveImage } from "../data/products"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Newsletter = () => {
  const { content, loading, error, retry } = useHomepageContent()
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  if (loading) return null
  if (error || !content) {
    return (
      <div className="container flex items-center justify-center gap-3 py-8" role="alert">
        <p className="text-[#8a8a8a]">{error || "Newsletter content is unavailable."}</p>
        <button type="button" className="underline underline-offset-2" onClick={retry}>Try again</button>
      </div>
    )
  }

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
            src={resolveImage(content.newsletter.backgroundImages.left)}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-[-25%] h-full w-auto max-w-none object-cover opacity-30 sm:left-[-10%] lg:left-[-4.6875%] lg:opacity-100"
          />
          <img
            src={resolveImage(content.newsletter.backgroundImages.right)}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute top-0 right-[-25%] h-full w-auto max-w-none object-cover opacity-30 sm:right-[-10%] lg:right-[-4.6875%] lg:opacity-100"
          />

          <div className="relative z-10 mb-[30px] w-full text-center">
            <h2 className="section-title">{content.newsletter.title}</h2>
            <p className="section-copy mx-auto mt-5 max-w-[614px]">
              {content.newsletter.description}
            </p>
          </div>

          <form
            onSubmit={subscribe}
            className="relative z-10 flex w-full max-w-[631px] flex-col gap-[30px]">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={content.newsletter.emailPlaceholder}
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
              {submitting ? "Subscribing…" : content.newsletter.buttonLabel}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Newsletter
