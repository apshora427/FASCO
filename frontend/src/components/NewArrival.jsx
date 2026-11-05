import { useMemo, useState } from "react"
import { Link } from "react-router"
import ProductCard from "./ProductCard"
import { resolveImage } from "../data/products"
import { useHomepageContent } from "../hooks/useHomepageContent.js"

const NewArrival = () => {
  const { products, content } = useHomepageContent()
  const [active, setActive] = useState("")

  const catalogue = useMemo(
    () => products.map((product) => ({
      ...product,
      image: resolveImage(product.image),
    })),
    [products]
  )
  const categories = useMemo(
    () => [...new Set(catalogue.map((product) => product.category).filter(Boolean))],
    [catalogue]
  )
  const activeCategory = categories.includes(active)
    ? active
    : catalogue.find((product) => product.arrival)?.category || categories[0] || ""
  const visible = catalogue.filter((product) => product.category === activeCategory)

  return (
    <section
      id="new-arrivals"
      className="scroll-mt-24 bg-white py-[clamp(30px,10.4vw,150px)]">
      <div className="container">
        <div className="mb-[clamp(30px,3.5vw,50px)] text-center">
          <h2 className="section-title">{content.arrivals.title}</h2>
          <p className="section-copy mx-auto mt-5 max-w-[614px]">
            {content.arrivals.description}
          </p>
        </div>

        <div
          className="mb-[clamp(20px,3.5vw,50px)] flex flex-wrap justify-center"
          style={{ gap: "clamp(10px, 2.1vw, 30px)" }}>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActive(category)}
              className={`flex items-center justify-center rounded-[10px] font-Poppins leading-none transition-colors ${
                activeCategory === category
                  ? "bg-black text-white shadow-[0_20px_35px_rgba(0,0,0,0.15)] dark:bg-white dark:text-[#121212]"
                  : "bg-[#fafafa] text-[#8a8a8a] hover:text-black"
              }`}
              style={{
                width: "clamp(165px, 14.4vw, 207px)",
                paddingTop: "clamp(16px, 1.4vw, 20px)",
                paddingBottom: "clamp(16px, 1.4vw, 20px)",
                lineHeight: 1,
                fontSize: "13.333px",
              }}>
              {category}
            </button>
          ))}
        </div>

        {visible.length > 0 ? (
          <div
            className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))]"
            style={{
              columnGap: "clamp(15px, 4.25vw, 61px)",
              rowGap: "clamp(15px, 4.2vw, 60px)",
            }}>
            {visible.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-[16px] text-subtext">
            {content.arrivals.emptyMessage}
          </p>
        )}

        <div className="mt-[clamp(30px,3.5vw,50px)] flex justify-center">
          <Link
            to={content.arrivals.buttonHref}
            className="btn-dark px-[62px]">
            {content.arrivals.buttonLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default NewArrival
