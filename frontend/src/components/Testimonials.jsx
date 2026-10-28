import { useState } from "react"
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"
import { testimonials } from "../data/products"

const Stars = () => (
  <div className="text-[19px] leading-none tracking-[0.12em] text-[#FCA120]" aria-label="5 out of 5 stars">
    ★★★★★
  </div>
)

const Card = ({ person, active = false }) => (
  <article
    className="flex flex-col-reverse items-start gap-6 rounded-[10px] bg-white shadow-[0_20px_60px_rgba(46,33,61,0.08)] sm:flex-row sm:items-center"
    style={
      active
        ? { maxWidth: 864, padding: "clamp(25px, 4.8vw, 69px) clamp(20px, 3.5vw, 50px) clamp(25px, 4.8vw, 69px) clamp(20px, 3.4vw, 49px)", gap: "clamp(20px, 5.8vw, 83px)" }
        : { maxWidth: 864, padding: "51px 38px 51px 36px", gap: 83 }
    }>
    <div className="relative shrink-0 self-center sm:ml-5">
      <img
        src={person.image}
        alt={person.name}
        loading="lazy"
        decoding="async"
        className="h-[242px] w-[242px] max-w-full object-cover"
      />
    </div>

    <div className="min-w-0">
      <p className="mb-[27px] max-w-[419px] text-[16px] leading-[1.62] text-[#484848]">
        &ldquo;{person.quote}&rdquo;
      </p>
      <div className="mb-[30px]">
        <Stars />
      </div>
      <div className="mb-[15px] h-px w-[230px] max-w-full bg-[#484848]" />
      <h3 className="mb-[13px] font-Display text-[32px] leading-[1.2] text-[#484848]">
        {person.name}
      </h3>
      <p className="text-[16px] text-[#484848]">{person.role}</p>
    </div>
  </article>
)

const Testimonials = () => {
  const [index, setIndex] = useState(0)
  const count = testimonials.length

  const goPrev = () => setIndex((i) => (i - 1 + count) % count)
  const goNext = () => setIndex((i) => (i + 1) % count)

  const at = (offset) => testimonials[(index + offset + count) % count]

  return (
    <section id="testimonials" className="scroll-mt-24 overflow-hidden bg-[#FAFAFA] pt-[clamp(40px,6.95vw,100px)] pb-[clamp(40px,4vw,58px)]">
      <div className="container mb-[clamp(30px,4.9vw,70px)] text-center">
        <h2 className="section-title">This Is What Our Customers Say</h2>
        <p className="section-copy mx-auto mt-5 max-w-[614px]">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque
          duis
        </p>
      </div>

      <div className="relative flex justify-center">
        <div
          className="absolute left-1/2 top-1/2 hidden w-[864px] xl:block"
          style={{ transform: "translate(calc(-50% - 506px), -50%)" }}>
          <Card person={at(-1)} />
        </div>
        <div className="relative z-10 w-full max-w-[864px] px-[15px] sm:px-0">
          <Card person={at(0)} active />
        </div>
        <div
          className="absolute left-1/2 top-1/2 hidden w-[864px] xl:block"
          style={{ transform: "translate(calc(-50% + 506px), -50%)" }}>
          <Card person={at(1)} />
        </div>
      </div>

      <div className="mt-[clamp(25px,4.1vw,59px)] flex justify-center gap-4">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous testimonial"
          className="grid h-12 w-12 place-items-center rounded-full bg-white text-black shadow-[0_4px_14px_1px_rgba(0,0,0,0.16)] transition-colors hover:bg-black hover:text-white">
          <LuChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next testimonial"
          className="grid h-12 w-12 place-items-center rounded-full bg-white text-black shadow-[0_4px_14px_1px_rgba(0,0,0,0.16)] transition-colors hover:bg-black hover:text-white">
          <LuChevronRight size={20} />
        </button>
      </div>
    </section>
  )
}

export default Testimonials
