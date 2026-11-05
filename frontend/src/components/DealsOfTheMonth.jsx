import { useEffect, useState } from "react"
import { Link } from "react-router"
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"
import { resolveImage } from "../data/products"
import { useHomepageContent } from "../hooks/useHomepageContent.js"

const DealsOfTheMonth = () => {
  const { deals: sourceDeals, content, dealEndsAt } = useHomepageContent()
  const deals = sourceDeals.map((product) => ({
    ...product,
    image: resolveImage(product.image),
    discount: Math.round((1 - product.price / product.originalPrice) * 100),
  }))
  const [index, setIndex] = useState(() => deals.length > 1 ? deals.length : 0)
  const [trackTransition, setTrackTransition] = useState(true)
  const [viewportWidth, setViewportWidth] = useState(
    () => typeof window === "undefined" ? 0 : window.innerWidth
  )
  const [countdownSeconds, setCountdownSeconds] = useState(0)

  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth)
    window.addEventListener("resize", updateViewportWidth)
    return () => window.removeEventListener("resize", updateViewportWidth)
  }, [])

  useEffect(() => {
    const expiresAt = new Date(dealEndsAt).getTime()
    const updateCountdown = () => {
      setCountdownSeconds(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)))
    }
    updateCountdown()
    const countdown = setInterval(() => {
      updateCountdown()
    }, 1000)
    return () => clearInterval(countdown)
  }, [dealEndsAt])

  useEffect(() => {
    setIndex(deals.length > 1 ? deals.length : 0)
    setTrackTransition(false)
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setTrackTransition(true))
    })
  }, [deals.length])

  const goPrev = () => setIndex((i) => i - 1)
  const goNext = () => setIndex((i) => i + 1)

  useEffect(() => {
    if (deals.length < 2) return undefined
    const slider = setInterval(() => setIndex((i) => i + 1), 3500)
    return () => clearInterval(slider)
  }, [deals.length])

  const handleTrackTransitionEnd = (event) => {
    if (event.propertyName !== "transform" || deals.length < 2) return
    if (index >= deals.length * 2 || index < deals.length) {
      setTrackTransition(false)
      setIndex((current) => current >= deals.length * 2
        ? current - deals.length
        : current + deals.length)
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setTrackTransition(true))
      })
    }
  }

  const activeDotIndex = deals.length
    ? ((index % deals.length) + deals.length) % deals.length
    : 0
  const dealWidth = Math.min(372, Math.max(260, viewportWidth * 0.1955))
  const dealStep = dealWidth + Math.min(24, Math.max(20, viewportWidth * 0.013))
  const countdown = [
    { value: Math.floor(countdownSeconds / 86400), label: content.deals.countdownLabels[0] },
    { value: Math.floor((countdownSeconds % 86400) / 3600), label: content.deals.countdownLabels[1] },
    { value: Math.floor((countdownSeconds % 3600) / 60), label: content.deals.countdownLabels[2] },
    { value: countdownSeconds % 60, label: content.deals.countdownLabels[3] },
  ]

  return (
    <section
      id="deals"
      className="relative scroll-mt-24 overflow-hidden bg-gradient-to-r from-white to-[#FAFAFA] py-[clamp(40px,10.8vw,155px)] lg:pb-[clamp(40px,10.1vw,145px)]">
      <div className="container flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-0">
        <div className="flex flex-col lg:mr-[clamp(40px,6vw,82px)] lg:flex-[0_0_35%]">
          <div>
            <h2 className="font-Display text-[clamp(36px,3vw,46px)] font-medium leading-[1.2] text-[#484848]">
              {content.deals.title}
            </h2>
            <p className="mt-3 max-w-[436px] text-[16px] leading-[1.55] text-[#8a8a8a]">
              {content.deals.description}
            </p>
            <Link
              to={content.deals.buttonHref}
              className="btn-dark mt-5 px-16 py-3 text-[20px] tracking-[0.02em]">
              {content.deals.buttonLabel}
            </Link>
          </div>

          <div className="mt-12 flex flex-col items-start">
            <h3 className="text-[26px] font-medium leading-none text-[#484848]">
              {content.deals.urgency}
            </h3>
            {deals.length === 0 && (
              <p className="section-copy mt-4">{content.deals.emptyMessage}</p>
            )}

            <div className="mt-6 flex gap-6">
              {countdown.map(({ value, label }, index) => (
                <div key={index} className="flex min-w-[72px] flex-col items-center gap-2">
                  <span className="grid h-[72px] w-[72px] place-items-center rounded-md bg-white font-Digital text-[38px] text-[#484848] shadow-[0_2px_8px_rgba(0,0,0,0.14)]">
                    {String(value).padStart(2, "0")}
                  </span>
                  <span className="text-[22px] leading-none text-[#484848]">{label}</span>
                </div>
              ))}
            </div>
            {deals.length > 1 && (
              <div className="mt-4 flex items-center gap-3 lg:hidden">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous deal"
                  className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#484848] shadow-[0_2px_8px_rgba(0,0,0,0.16)] transition-colors hover:bg-black hover:text-white">
                  <LuChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next deal"
                  className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#484848] shadow-[0_2px_8px_rgba(0,0,0,0.16)] transition-colors hover:bg-black hover:text-white">
                  <LuChevronRight size={24} />
                </button>
              </div>
            )}
          </div>
        </div>

        {deals.length > 0 && (
        <div className="relative min-w-0 w-full flex-none lg:flex-[0_0_55vw]">
          <div className="overflow-hidden">
            <div
              className="flex items-start"
              style={{
                "--deal-w": "clamp(260px, 19.55vw, 372px)",
                "--deal-active-w": "clamp(280px, 21.1vw, 404px)",
                "--deal-h": "clamp(400px, 30.45vw, 582px)",
                "--deal-gap": "clamp(20px, 1.3vw, 24px)",
                gap: "var(--deal-gap)",
                transition: trackTransition ? "transform 850ms cubic-bezier(0.22, 1, 0.36, 1)" : "none",
                transform: `translateX(-${index * dealStep}px)`,
                willChange: "transform",
              }}
              onTransitionEnd={handleTrackTransitionEnd}>
              {Array.from({ length: deals.length > 1 ? 3 : 1 }, (_, copy) =>
                deals.map((deal, dealIndex) => {
                  const trackIndex = copy * deals.length + dealIndex
                  const active = trackIndex === index
                  return (
                    <article
                      key={`${copy}-${deal.id}`}
                      className="relative shrink-0 overflow-hidden transition-[width] duration-500 ease-out"
                      style={{
                        width: active ? "var(--deal-active-w)" : "var(--deal-w)",
                        height: "var(--deal-h)",
                      }}>
                      <img
                        src={deal.image}
                        alt={deal.title}
                        loading="lazy"
                        decoding="async"
                        className={`w-full object-cover transition-[height] duration-500 ease-out ${
                          active ? "h-full" : "h-[83.505155%]"
                        }`}
                      />
                      {active && (
                        <div
                          className="absolute bg-white/95 shadow-[0_16px_30px_rgba(0,0,0,0.08)] backdrop-blur-sm"
                          style={{
                            left: "6%",
                            bottom: "4%",
                            width: "54%",
                            boxSizing: "border-box",
                            padding: "clamp(16px, 2.4vw, 24px)",
                          }}>
                          <div className="flex min-w-0 items-center gap-2 text-[14px] leading-[1.4] text-[#484848]">
                            <span>{String(activeDotIndex + 1).padStart(2, "0")}</span>
                            <span className="h-px w-6 shrink-0 bg-[#484848]" />
                            <span className="truncate">{content.deals.saleLabel}</span>
                          </div>
                          <p className="mt-2 whitespace-nowrap text-[28px] leading-[1.2] text-[#484848]">
                            {deal.discount}% OFF
                          </p>
                        </div>
                      )}
                    </article>
                  )
                })
              )}
            </div>
          </div>

          <div className="absolute inset-x-0 top-[calc(100%-24px)] flex justify-center">
            {deals.map((deal, i) => (
              <button
                key={deal.id}
                type="button"
                onClick={() => setIndex((deals.length > 1 ? deals.length : 0) + i)}
                aria-label={`Show deal ${i + 1}`}
                className="flex h-9 w-9 items-center justify-center">
                <span
                  className={`h-[22px] w-[22px] rounded-full transition-colors ${
                    i === activeDotIndex ? "bg-black dark:bg-white" : "bg-[#b6b6b6]"
                  }`}
                />
              </button>
            ))}
          </div>
          {deals.length > 1 && (
            <div className="absolute -left-[132px] bottom-4 hidden items-center gap-6 lg:flex">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous deal"
                className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#484848] shadow-[0_2px_8px_rgba(0,0,0,0.16)] transition-colors hover:bg-black hover:text-white">
                <LuChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next deal"
                className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#484848] shadow-[0_2px_8px_rgba(0,0,0,0.16)] transition-colors hover:bg-black hover:text-white">
                <LuChevronRight size={24} />
              </button>
            </div>
          )}
        </div>
        )}
      </div>

    </section>
  )
}

export default DealsOfTheMonth
