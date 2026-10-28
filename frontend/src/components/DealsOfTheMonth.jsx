import { useEffect, useState } from "react"
import { Link } from "react-router"
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"
import { getProducts } from "../api/backend"
import { resolveImage } from "../data/products"

const DealsOfTheMonth = () => {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setLoadError(false)
    getProducts()
      .then((products) => {
        if (!active) return
        if (!Array.isArray(products)) {
          setLoadError(true)
          return
        }
        setDeals(products
          .filter((product) => product.originalPrice > product.price && product.stock > 0)
          .map((product) => ({
            ...product,
            image: resolveImage(product.image),
            discount: Math.round((1 - product.price / product.originalPrice) * 100),
          })))
        setIndex(0)
      })
      .catch(() => {
        if (active) setLoadError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [reloadKey])

  const maxIndex = Math.max(0, deals.length - 1)
  const goPrev = () => setIndex((i) => (i <= 0 ? maxIndex : i - 1))
  const goNext = () => setIndex((i) => (i >= maxIndex ? 0 : i + 1))

  useEffect(() => {
    if (deals.length < 2) return undefined
    const slider = setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1))
    }, 5000)
    return () => clearInterval(slider)
  }, [deals.length, maxIndex])

  return (
    <section
      id="deals"
      className="relative scroll-mt-24 overflow-hidden bg-gradient-to-r from-white to-[#FAFAFA] py-[clamp(40px,10.8vw,155px)] lg:pb-[clamp(40px,10.1vw,145px)]">
      <div className="container flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-0">
        <div className="flex flex-col lg:mr-[clamp(40px,9.3vw,122px)] lg:flex-[0_0_35%] lg:self-center">
          <div className="mb-[clamp(36px,4.9vw,70px)]">
            <h2 className="section-title">Current Offers</h2>
            <p className="section-copy mt-5 max-w-[436px]">
              Explore products currently on sale in the FASCO catalogue.
            </p>
            <Link
              to="/shop?collection=On%20sale"
              className="btn-dark mt-10 px-[70px] tracking-[0.02em]">
              Shop offers
            </Link>
          </div>

          <div className="flex flex-col items-start">
            <h3 className="font-Poppins font-medium leading-none text-[#484848]" style={{ fontSize: "clamp(20px, 1.95vw, 28px)" }}>
              {loading ? "Loading offers…" : `${deals.length} live offer${deals.length === 1 ? "" : "s"}`}
            </h3>
            {loadError && (
              <div role="alert" className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#8a8a8a]">
                <span>Offers could not be loaded.</span>
                <button type="button" className="underline underline-offset-2" onClick={() => setReloadKey((key) => key + 1)}>Try again</button>
              </div>
            )}
            {!loading && !loadError && deals.length === 0 && (
              <p className="section-copy mt-4">There are no discounted products right now. Check back soon or browse the full collection.</p>
            )}

            {deals.length > 1 && <div className="mt-8 flex gap-4 lg:hidden">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous deal"
                className="grid h-12 w-12 place-items-center rounded-full bg-white text-black shadow-[0_4px_14px_1px_rgba(0,0,0,0.16)] transition-colors hover:bg-black hover:text-white">
                <LuChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next deal"
                className="grid h-12 w-12 place-items-center rounded-full bg-white text-black shadow-[0_4px_14px_1px_rgba(0,0,0,0.16)] transition-colors hover:bg-black hover:text-white">
                <LuChevronRight size={20} />
              </button>
            </div>}
          </div>
        </div>

        {!loading && !loadError && deals.length > 0 && <div className="relative min-w-0 w-[min(372px,calc(100vw-30px))] max-w-[372px] shrink-0 flex-none">
          <div
            className="flex items-start"
            style={{
              "--deal-w": "min(372px, calc(100vw - 30px))",
              "--deal-active-w": "min(404px, calc(100vw - 30px))",
              "--deal-h":
                "clamp(400px, calc(400px + 182 * (100vw - 320px) / 990), 582px)",
              gap: 24,
              transition: "transform 500ms ease-out",
              transform: `translateX(calc(-${index} * (var(--deal-w) + 24px)))`,
            }}>
            {deals.map((deal, i) => {
              const active = i === index
              return (
                <article
                  key={deal.id}
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
                      active ? "h-full" : "h-full min-[768px]:h-[83.505155%]"
                    }`}
                  />
                  {active && (
                    <div
                      className="absolute bg-white/95 shadow-[0_16px_30px_rgba(0,0,0,0.08)] backdrop-blur-sm"
                      style={{
                        left: 24,
                        bottom: 24,
                        maxWidth: 217,
                        padding: "32px 38px 32px 26px",
                      }}>
                      <div className="grid grid-cols-[auto_27px_auto] items-center gap-2 text-[#484848]">
                        <span className="leading-[1.5]">{deal.brand || deal.category}</span>
                        <span className="h-px bg-[#484848]" />
                        <span className="whitespace-nowrap leading-[1.5]">
                          {deal.category}
                        </span>
                      </div>
                      <p className="mt-2 text-lg font-medium leading-[1.2] text-[#484848]">
                        {deal.title}
                      </p>
                      <p className="mt-1 text-[28px] leading-[1.2] text-[#484848]">
                        {deal.discount}% off
                      </p>
                    </div>
                  )}
                </article>
              )
            })}
          </div>

          <div className="absolute inset-x-0 top-full mt-6 flex justify-center gap-5 min-[1310px]:inset-x-auto min-[1310px]:bottom-0 min-[1310px]:left-[428px] min-[1310px]:top-auto min-[1310px]:mt-0 min-[1310px]:w-[372px]">
            {deals.map((deal, i) => (
              <button
                key={deal.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show deal ${i + 1}`}
                className="flex h-[27px] w-[27px] items-center justify-center">
                <span
                  className={`h-[11px] w-[11px] rounded-full transition-colors ${
                    i === index ? "bg-black dark:bg-white" : "bg-[#b6b6b6]"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>}
      </div>

      {deals.length > 1 && <div
        className="pointer-events-none absolute inset-x-0 z-10 hidden justify-between lg:flex"
        style={{
          left: "12px",
          right: "auto",
          width: "calc(100vw - 52px)",
          top: "calc(clamp(40px, 10.8vw, 155px) + clamp(360px, 40.4vw, 582px) / 2)",
          transform: "translateY(-50%)",
        }}>
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous deal"
          className="pointer-events-auto grid h-12 w-12 place-items-center rounded-full bg-white text-black shadow-[0_4px_14px_1px_rgba(0,0,0,0.16)] transition-colors hover:bg-black hover:text-white">
          <LuChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next deal"
          className="pointer-events-auto grid h-12 w-12 place-items-center rounded-full bg-white text-black shadow-[0_4px_14px_1px_rgba(0,0,0,0.16)] transition-colors hover:bg-black hover:text-white">
          <LuChevronRight size={16} />
        </button>
      </div>}
    </section>
  )
}

export default DealsOfTheMonth
