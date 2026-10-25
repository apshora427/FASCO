import { Link } from "react-router"
import heroLeft from "../assets/hero-left.png"
import heroStrip from "../assets/hero-strip.png"
import heroCoral from "../assets/hero-coral.png"
import heroRight from "../assets/hero-right.png"
import ScrollToTopButton from "./ScrollToTopButton"

// Hero measured off the Figma frame (931px crop → vw):
//   panels y103-471 (39.6vw), columns 191/209/191 with 18px (2.88%) gutters,
//   centre stack: strip 0, ULTIMATE 10.42, SALE 15.79, NEW COLLECTION 24.6,
//   SHOP NOW 26.85, coral 31.68 (all from the top of the grid).
const Hero = () => (
  <section className="relative" style={{ paddingInline: "16.3vw", paddingTop: "0.75vw" }}>
    <div
      className="relative grid"
      style={{
        gridTemplateColumns: "191fr 209fr 191fr",
        columnGap: "2.88%",
        height: "39.6vw",
      }}>
      <div className="h-full overflow-hidden bg-[#EBEBEB]">
        <img
          src={heroLeft}
          alt="Model in casual winter streetwear"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative h-full bg-white">
        <img
          src={heroStrip}
          alt="The new collection"
          className="absolute left-0 w-full object-cover"
          style={{ top: 0, height: "7.9vw", borderRadius: "0.3vw" }}
        />

        <h1
          className="absolute left-0 w-full text-center font-Poppins font-semibold leading-none text-[#2E2E2E]"
          style={{ top: "9.9vw", fontSize: "4.3vw", letterSpacing: "-0.01em" }}>
          ULTIMATE
        </h1>

        <span
          className="absolute left-0 w-full text-center font-Poppins font-bold leading-none text-transparent"
          style={{
            top: "14.5vw",
            fontSize: "8.6vw",
            WebkitTextStroke: "0.24vw #C9C9C9",
          }}>
          SALE
        </span>

        <p
          className="absolute left-0 w-full text-center font-Poppins font-medium text-[#444444]"
          style={{ top: "24.4vw", fontSize: "0.95vw", letterSpacing: "0.11em", lineHeight: 1 }}>
          NEW COLLECTION
        </p>

        <Link
          to="/shop"
          className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center bg-black text-white font-semibold whitespace-nowrap hover:bg-[#222] transition-colors"
          style={{ top: "26.85vw", width: "10.7vw", height: "2.78vw", borderRadius: "0.4vw", fontSize: "0.95vw", letterSpacing: "0.05em" }}>
          SHOP NOW
        </Link>

        <img
          src={heroCoral}
          alt="Shoppers with bags"
          className="absolute left-0 w-full object-cover"
          style={{ top: "31.68vw", height: "7.95vw", borderRadius: "0.3vw" }}
        />
      </div>

      <div className="h-full overflow-hidden bg-[#EBEBEB]">
        <img
          src={heroRight}
          alt="Model in an orange turtleneck"
          className="w-full h-full object-cover"
        />
      </div>
    </div>

    <ScrollToTopButton />
  </section>
)

export default Hero
