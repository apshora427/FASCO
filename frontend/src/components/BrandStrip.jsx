import { useHomepageContent } from "../hooks/useHomepageContent.js"
import { resolveImage } from "../data/products"

const BrandStrip = () => {
  const { content } = useHomepageContent()

  return (
    <section className="bg-white">
      <div className="container pt-[clamp(25px,3.82vw,55px)] pb-[clamp(25px,5.69vw,82px)]">
        <div className="grid grid-cols-2 items-center justify-items-center gap-x-8 gap-y-8 sm:grid-cols-3 lg:flex lg:justify-between">
          {content.brands.map((brand) => (
            <img
              key={brand.name}
              src={resolveImage(brand.image)}
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
}

export default BrandStrip
