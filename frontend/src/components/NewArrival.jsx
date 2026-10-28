import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import ProductCard from "./ProductCard"
import { getProducts } from "../api/backend"
import { resolveImage } from "../data/products"

const NewArrival = () => {
  const [catalogue, setCatalogue] = useState([])
  const [active, setActive] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let activeRequest = true
    setLoading(true)
    setLoadError("")
    getProducts()
      .then((result) => {
        if (!activeRequest) return
        if (!Array.isArray(result)) {
          setLoadError("Products are temporarily unavailable.")
          return
        }
        const normalized = result.map((product) => ({
          ...product,
          image: resolveImage(product.image),
        }))
        setCatalogue(normalized)
        setActive((current) => current || normalized.find((product) => product.arrival)?.category || normalized[0]?.category || "")
      })
      .catch(() => {
        if (activeRequest) setLoadError("Products are temporarily unavailable.")
      })
      .finally(() => {
        if (activeRequest) setLoading(false)
      })
    return () => { activeRequest = false }
  }, [reloadKey])

  const categories = useMemo(
    () => [...new Set(catalogue.map((product) => product.category).filter(Boolean))],
    [catalogue]
  )
  const visible = catalogue.filter((product) => product.category === active)

  return (
    <section
      id="new-arrivals"
      className="scroll-mt-24 bg-white py-[clamp(30px,10.4vw,150px)]">
      <div className="container">
        <div className="mb-[clamp(30px,3.5vw,50px)] text-center">
          <h2 className="section-title">New Arrivals</h2>
          <p className="section-copy mx-auto mt-5 max-w-[614px]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque
            duis ultrices sollicitudin aliquam sem. Scelerisque duis ultrices
            sollicitudin.
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
                active === category
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

        {loading ? (
          <p className="mt-10 text-center text-[16px] text-subtext" role="status">Loading the latest collection…</p>
        ) : loadError ? (
          <div className="mt-10 flex flex-col items-center gap-3 text-center text-[16px] text-subtext" role="alert">
            <p>{loadError}</p>
            <button type="button" className="rounded-lg border border-[#dedfe1] px-4 py-2 text-sm text-[#484848]" onClick={() => setReloadKey((key) => key + 1)}>
              Try again
            </button>
          </div>
        ) : visible.length > 0 ? (
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
            Nothing here yet — check back soon.
          </p>
        )}

        <div className="mt-[clamp(30px,3.5vw,50px)] flex justify-center">
          <Link
            to="/shop"
            className="btn-dark px-[62px]">
            View More
          </Link>
        </div>
      </div>
    </section>
  )
}

export default NewArrival
