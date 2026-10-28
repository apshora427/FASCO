import { Link } from "react-router"
import heroLeft from "../assets/figma/hero-left.jpg"
import heroRight from "../assets/figma/hero-right.jpg"
import heroTop from "../assets/figma/hero-top.jpg"
import heroBottom from "../assets/figma/hero-bottom.jpg"
import ScrollToTopButton from "./ScrollToTopButton"

const Hero = () => (
  <section className="relative bg-white">
    <div className="container pt-[clamp(26px,5.14vw,74px)] pb-[clamp(40px,3.8vw,55px)]">
      <div className="grid gap-[clamp(16px,2.44vw,35px)] lg:grid-cols-[392fr_426fr_392fr]">
        <div className="hidden min-w-0 aspect-[392/756] overflow-hidden bg-[#EBEBEB] lg:block">
          <img
            src={heroLeft}
            alt="Model in casual winter streetwear"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="mx-auto flex w-full min-w-0 max-w-[426px] flex-col lg:max-w-none">
          <img
            src={heroTop}
            alt="The new collection"
            className="mx-auto aspect-[426/150] w-full max-w-[426px] object-cover"
          />

          <div className="flex flex-1 flex-col items-center justify-center py-[clamp(18px,2.4vw,34.5px)] text-center">
            <h1
              className="mb-[clamp(28px,3.47vw,50px)] font-Poppins font-medium text-[#484848]"
              style={{
                fontSize: "clamp(56px, 6.32vw, 91px)",
                lineHeight: "clamp(56px, 6.32vw, 91px)",
                letterSpacing: "-0.04em",
              }}>
              ULTIMATE
              <span
                className="hero-sale-outline mt-[clamp(22px,2.78vw,40px)] block text-transparent"
                style={{
                  fontSize: "clamp(108px, 13.9vw, 200px)",
                  letterSpacing: "-0.06em",
                  WebkitTextStroke: "1px #484848",
                }}>
                SALE
              </span>
            </h1>
            <p
              className="mb-[clamp(22px,2.7vw,39px)] font-Poppins uppercase text-[#484848]"
              style={{ fontSize: "clamp(13px,1.4vw,20px)", letterSpacing: "0.1em", lineHeight: 1 }}>
              New Collection
            </p>
            <Link
              to="/shop"
              className="btn-dark px-[61px] uppercase">
              Shop Now
            </Link>
          </div>

          <img
            src={heroBottom}
            alt="Shoppers with bags"
            className="mx-auto aspect-[426/150] w-full max-w-[426px] object-cover"
          />
        </div>

        <div className="hidden min-w-0 aspect-[392/756] overflow-hidden bg-[#EBEBEB] lg:block">
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
