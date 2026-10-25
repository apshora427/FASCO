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

  // live countdown — ticks every second toward the deal deadline
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
    <section id="deals" className="overflow-hidden bg-[#F8F8F8] py-[79px] scroll-mt-[70px]">
      <div className="container flex gap-[70px]">
        <div className="w-[205px] shrink-0 flex flex-col">
          <h2 className="font-Display text-[24px] font-bold leading-tight text-black">
            Deals Of The Month
          </h2>
          <p className="mt-[13px] max-w-[205px] text-[8px] leading-[12px] text-subtext">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque
            du du is ultrices sollicitudin aliquam sem. Scelerisque du du is
            ultrices sollicitudin.
          </p>
          <Link
            to="/shop"
            className="mt-[18px] w-fit rounded-[4px] bg-black px-[32px] py-[10px] text-[8px] text-white shadow-[0_8px_16px_rgba(0,0,0,0.18)] transition-colors hover:bg-[#222]">
            Buy Now
          </Link>

          <h3 className="mt-[28px] font-Poppins text-[13px] font-semibold text-black">
            Hurry, Before It's Too Late!
          </h3>
          <div className="mt-[10px] flex gap-[9px]">
            {units.map((unit) => (
              <div key={unit.label} className="flex flex-col items-center gap-[8px]">
                <div className="grid h-[39px] w-[39px] place-items-center rounded-[4px] border border-line bg-white font-Display text-[18px] font-bold text-black shadow-[0_4px_9px_rgba(0,0,0,0.08)]">
                  {pad(unit.value)}
                </div>
                <span className="text-[9px] text-subtext">{unit.label}</span>
              </div>
            ))}
          </div>

          <div className="ml-[207px] mt-[26px] flex gap-[8px]">
            <button
              onClick={goPrev}
              aria-label="Previous deal"
              className="grid h-[25px] w-[25px] place-items-center rounded-full bg-white text-black shadow-[0_3px_8px_rgba(0,0,0,0.12)] transition-colors hover:bg-white">
              <LuChevronLeft size={16} />
            </button>
            <button
              onClick={goNext}
              aria-label="Next deal"
              className="grid h-[25px] w-[25px] place-items-center rounded-full bg-white text-black shadow-[0_3px_8px_rgba(0,0,0,0.12)] transition-colors hover:bg-white">
              <LuChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="w-[650px] overflow-hidden">
          <div
            className="flex gap-[12px] transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * 210}px)` }}>
            {dealProducts.map((deal, i) => (
              <div key={deal.id} className="relative h-[284px] w-[198px] shrink-0">
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="h-full w-full object-cover"
                />
                {i === 0 && (
                  <div className="absolute left-[8%] bottom-[6%] bg-white px-[14px] py-[10px] shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
                    <p className="text-[10px] text-subtext">
                      {deal.label} —— {deal.sublabel}
                    </p>
                    <p className="font-Display font-bold text-[15px] text-black mt-[2px]">
                      {deal.badge}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-[20px] flex justify-center gap-[8px]">
            {dealProducts.map((deal, i) => (
              <button
                key={deal.id}
                onClick={() => setIndex(i)}
                aria-label={`Show deal ${i + 1}`}
                className={`w-[8px] h-[8px] rounded-full transition-colors ${
                  i === index ? "bg-black" : "bg-[#C9C9C9]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default DealsOfTheMonth
