import { useState } from "react"
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"
import { testimonials } from "../data/products"

const Testimonials = () => {
  const [index, setIndex] = useState(0)
  const count = testimonials.length

  const goPrev = () => setIndex((i) => (i - 1 + count) % count)
  const goNext = () => setIndex((i) => (i + 1) % count)

  const at = (offset) => testimonials[(index + offset + count) % count]
  const active = at(0)
  const before = at(-1)
  const after = at(1)

  return (
    <section className="overflow-hidden bg-[#FAFAFA] py-[49px]">
      <div className="container text-center">
        <h2 className="font-Display text-[24px] font-bold text-black">
          This Is What Our Customers Say
        </h2>
        <p className="mt-[8px] text-[8px] text-subtext">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque du
        </p>
      </div>

      <div className="mt-[34px] flex items-start justify-center">
        <div className="z-0 mt-[27px] -mr-[45px] flex w-[280px] scale-[.94] gap-[15px] bg-white p-[23px] text-left shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
          <img
            src={before.image}
            alt={before.name}
            className="h-[91px] w-[90px] shrink-0 object-cover"
          />
          <div className="min-w-0">
            <p className="text-[7px] leading-[11px] text-[#5D5D5D]">
              "{before.quote}"
            </p>
            <div className="mt-[7px] text-[8px] tracking-[1px] text-star">
              ★★★★★
            </div>
          </div>
        </div>

        <div className="relative z-10 flex w-[422px] gap-[25px] bg-white p-[34px] text-left shadow-[0_16px_50px_rgba(0,0,0,0.10)]">
          <img
            src={active.image}
            alt={active.name}
            className="h-[128px] w-[117px] shrink-0 object-cover"
          />
          <div>
            <p className="text-[8px] leading-[12px] text-[#3D3D3D]">
              "{active.quote}"
            </p>
            <div className="mt-[9px] text-[9px] tracking-[1px] text-star">
              ★★★★★
            </div>
            <div className="my-[10px] w-[112px] border-b border-[#C9C9C9]" />
            <h4 className="font-Display text-[16px] font-bold text-black">
              {active.name}
            </h4>
            <p className="mt-[1px] text-[8px] text-subtext">{active.role}</p>
          </div>
        </div>

        <div className="z-0 mt-[27px] -ml-[45px] flex w-[280px] scale-[.94] gap-[15px] bg-white p-[23px] text-left shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
          <img
            src={after.image}
            alt={after.name}
            className="h-[91px] w-[90px] shrink-0 object-cover"
          />
          <div className="min-w-0">
            <p className="text-[7px] leading-[11px] text-[#5D5D5D]">
              "{after.quote}"
            </p>
            <div className="mt-[7px] text-[8px] tracking-[1px] text-star">
              ★★★★★
            </div>
          </div>
        </div>
      </div>

      <div className="mt-[28px] flex justify-center gap-[8px]">
        <button
          onClick={goPrev}
          aria-label="Previous testimonial"
          className="grid h-[25px] w-[25px] place-items-center rounded-full bg-white text-black shadow-[0_3px_8px_rgba(0,0,0,0.12)] transition-colors hover:bg-white">
          <LuChevronLeft size={16} />
        </button>
        <button
          onClick={goNext}
          aria-label="Next testimonial"
          className="grid h-[25px] w-[25px] place-items-center rounded-full bg-white text-black shadow-[0_3px_8px_rgba(0,0,0,0.12)] transition-colors hover:bg-white">
          <LuChevronRight size={16} />
        </button>
      </div>
    </section>
  )
}

export default Testimonials
