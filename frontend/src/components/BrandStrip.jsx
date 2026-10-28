import brand1 from "../assets/figma/brand-1.svg"
import brand2 from "../assets/figma/brand-2.svg"
import brand3 from "../assets/figma/brand-3.svg"
import brand4 from "../assets/figma/brand-4.svg"
import brand5 from "../assets/figma/brand-5.svg"

const brands = [
  { name: "Chanel", src: brand1 },
  { name: "Louis Vuitton", src: brand2 },
  { name: "Prada", src: brand3 },
  { name: "Calvin Klein", src: brand4 },
  { name: "Denim", src: brand5 },
]

const BrandStrip = () => (
  <section className="bg-white">
    <div className="container pt-[clamp(25px,3.82vw,55px)] pb-[clamp(25px,5.69vw,82px)]">
      <div className="grid grid-cols-2 items-center justify-items-center gap-x-8 gap-y-8 sm:grid-cols-3 lg:flex lg:justify-between">
        {brands.map((brand) => (
          <img
            key={brand.name}
            src={brand.src}
            alt={brand.name}
            loading="lazy"
            decoding="async"
            className="h-auto select-none transition-opacity duration-300 hover:opacity-60 dark:invert dark:opacity-75 dark:hover:opacity-100"
            style={{ width: "clamp(96px, 13.6vw, 196px)" }}
          />
        ))}
      </div>
    </div>
  </section>
)

export default BrandStrip
