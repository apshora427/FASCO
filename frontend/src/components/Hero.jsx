import { Link } from "react-router"
import heroLeft from "../assets/figma/hero-left.jpg"
import heroRight from "../assets/figma/hero-right.jpg"
import heroTop from "../assets/figma/hero-top.jpg"
import heroBottom from "../assets/figma/hero-bottom.jpg"
import ScrollToTopButton from "./ScrollToTopButton"

const Hero = () => (
  <section className="relative bg-white">
    <div className="container pt-[clamp(26px,5.1vw,74px)] pb-[clamp(40px,3.8vw,55px)]">
      <div className="grid gap-[clamp(16px,2.4vw,35px)] lg:grid-cols-[392fr_456fr_392fr]">
        <div className="hidden aspect-[392/756] overflow-hidden bg-[#EBEBEB] lg:block">
          <img
            src={heroLeft}
            alt="Model in casual winter streetwear"
            className="h-full w-full object-cover"
          />
        </div>


        <div className="mx-auto flex w-full max-w-[426px] flex-col lg:max-w-none">
          <img
            src={heroTop}
            alt="The new collection"
            className="aspect-[426/150] w-full object-cover"
          />

          <div className="flex flex-1 flex-col items-center justify-center py-[clamp(18px,2.4vw,34px)] text-center">
            <h1
              className="font-Poppins font-medium leading-[0.95] text-[#484848]"
              style={{ fontSize: "clamp(56px, 6.32vw, 91px)", letterSpacing: "-0.02em" }}>
              ULTIMATE
            </h1>
            <span
              className="font-Poppins font-bold leading-[0.82] text-transparent"
              style={{
                fontSize: "clamp(108px, 13.9vw, 200px)",
                letterSpacing: "-0.04em",
                WebkitTextStroke: "1px #484848",
              }}>
              SALE
            </span>
            <p
              className="mt-[clamp(16px,2.1vw,30px)] font-Poppins font-medium uppercase text-[#484848]"
              style={{ fontSize: "clamp(13px,1.4vw,20px)", letterSpacing: "0.1em", lineHeight: 1 }}>
              New Collection
            </p>
            <Link
              to="/shop"
              className="btn-dark mt-[clamp(18px,2.1vw,30px)] uppercase tracking-[0.05em]">
              Shop Now
            </Link>
          </div>

          <img
            src={heroBottom}
            alt="Shoppers with bags"
            className="aspect-[426/150] w-full object-cover"
          />
        </div>

        <div className="hidden aspect-[392/756] overflow-hidden bg-[#EBEBEB] lg:block">
          <img
            src={heroRight}
            alt="Model in an orange turtleneck"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>

    <ScrollToTopButton />
  </section>
)

export default Hero
