import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"
import { dealProducts } from "../data/products"

const pad = (n) => String(n).padStart(2, "0")

const START_MS = 2 * 24 * 3600 * 1000 + 6 * 3600 * 1000 + 5 * 60 * 1000 + 30 * 1000

const DealsOfTheMonth = () => {
  const deadline = useMemo(() => Date.now() + START_MS, [])
  const [remaining, setRemaining] = useState(START_MS)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(Math.max(0, deadline - Date.now()))
    }, 1000)
    return () => clearInterval(timer)
  }, [deadline])

  const totalSec = Math.floor(remaining / 1000)
  const units = [
    { label: "Days", value: Math.floor(totalSec / 86400) },
    { label: "Hr", value: Math.floor(totalSec / 3600) % 24 },
    { label: "Mins", value: Math.floor(totalSec / 60) % 60 },
    { label: "Sec", value: totalSec % 60 },
  ]

  const maxIndex = dealProducts.length - 1
  const goPrev = () => setIndex((i) => (i <= 0 ? maxIndex : i - 1))
  const goNext = () => setIndex((i) => (i >= maxIndex ? 0 : i + 1))

  useEffect(() => {
    const slider = setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1))
    }, 5000)
    return () => clearInterval(slider)
  }, [maxIndex])

  return (
    <section
      id="deals"
      className="relative scroll-mt-24 overflow-hidden bg-gradient-to-r from-white to-[#FAFAFA] py-[clamp(40px,10.8vw,155px)] lg:pb-[clamp(40px,10.1vw,145px)]">
      <div className="container flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-0">
        <div className="flex flex-col lg:mr-[clamp(40px,9.3vw,122px)] lg:flex-[0_0_35%] lg:self-center">
          <div className="mb-[clamp(36px,4.9vw,70px)]">
            <h2 className="section-title">Deals Of The Month</h2>
            <p className="section-copy mt-5 max-w-[436px]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque
              duis ultrices sollicitudin aliquam sem. Scelerisque duis ultrices
              sollicitudin.
            </p>
            <Link
              to="/shop"
              className="btn-dark mt-10 px-[70px] tracking-[0.02em]">
              Buy Now
            </Link>
          </div>

          <div className="flex flex-col items-start">
            <h3
              className="font-Poppins font-medium leading-none text-[#484848]"
              style={{ fontSize: "clamp(20px, 1.95vw, 28px)" }}>
              Hurry, Before It&apos;s Too Late!
            </h3>
            <div
              className="mt-[15px] flex items-start"
              style={{ gap: "clamp(15px, 2.1vw, 30px)" }}>
              {units.map((unit) => (
                <div key={unit.label} className="flex flex-col items-center">
                  <div
                    className="font-Digital leading-none text-[#484848] shadow-[0_4px_14px_1px_rgba(0,0,0,0.16)]"
                    style={{
                      fontSize: "clamp(20px, 2.22vw, 32px)",
                      background: "#fff",
                      padding: "clamp(14px, 1.53vw, 22px) clamp(8px, 0.83vw, 12px)",
                      borderRadius: "clamp(7px, 0.7vw, 10px)",
                    }}>
                    {pad(unit.value)}
                  </div>
                  <span
                    className="mt-[15px] text-center leading-[1.2] text-[#484848]"
                    style={{ fontSize: "clamp(14px, 1.67vw, 24px)" }}>
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-4 lg:hidden">
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
            </div>
          </div>
        </div>

        <div className="relative min-w-0 w-[min(372px,calc(100vw-30px))] max-w-[372px] shrink-0 flex-none">
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
            {dealProducts.map((deal, i) => {
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
                        <span className="leading-[1.5]">{deal.label}</span>
                        <span className="h-px bg-[#484848]" />
                        <span className="whitespace-nowrap leading-[1.5]">
                          {deal.sublabel}
                        </span>
                      </div>
                      <p className="mt-2 text-[28px] leading-[1.2] text-[#484848]">
                        {deal.badge}
                      </p>
                    </div>
                  )}
                </article>
              )
            })}
          </div>

          <div className="absolute inset-x-0 top-full mt-6 flex justify-center gap-5 min-[1310px]:inset-x-auto min-[1310px]:bottom-0 min-[1310px]:left-[428px] min-[1310px]:top-auto min-[1310px]:mt-0 min-[1310px]:w-[372px]">
            {dealProducts.map((deal, i) => (
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
        </div>
      </div>

      <div
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
      </div>
    </section>
  )
}

export default DealsOfTheMonth
