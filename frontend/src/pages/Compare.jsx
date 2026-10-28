import { useEffect, useState } from "react"
import { Link } from "react-router"
import { LuRefreshCw, LuX } from "react-icons/lu"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { getProducts } from "../api/backend"
import { resolveImage } from "../data/products"
import { readComparedIds, saveComparedIds } from "../utils/comparison"

const Compare = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)
  const [compareError, setCompareError] = useState("")

  useEffect(() => {
    let active = true
    setLoading(true)
    setError("")
    getProducts()
      .then((catalogue) => {
        if (!active) return
        if (!Array.isArray(catalogue)) {
          setError("The product catalogue is unavailable. Try again.")
          return
        }
        let ids
        try {
          ids = readComparedIds()
        } catch {
          setCompareError("The saved comparison list was invalid and has been cleared.")
          saveComparedIds([])
          ids = []
        }
        setProducts(catalogue
          .filter((product) => ids.includes(String(product.id)))
          .map((product) => ({ ...product, image: resolveImage(product.image) })))
      })
      .catch(() => {
        if (active) setError("The product catalogue is unavailable. Try again.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [reloadKey])

  const removeProduct = (id) => {
    const updated = products.filter((product) => String(product.id) !== String(id))
    try {
      saveComparedIds(updated.map((product) => String(product.id)))
      setProducts(updated)
      setCompareError("")
    } catch {
      setCompareError("Could not update your comparison list.")
    }
  }

  const clearComparison = () => {
    try {
      saveComparedIds([])
      setProducts([])
      setCompareError("")
    } catch {
      setCompareError("Could not clear your comparison list.")
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar variant="shop" />
      <section className="container py-12 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a87534]">Product selection</p>
            <h1 className="mt-3 font-Display text-4xl text-[#25231f] md:text-5xl">Compare products</h1>
          </div>
          {products.length > 0 && (
            <button type="button" onClick={clearComparison} className="rounded-md border border-[#e7e3dd] px-4 py-2 text-sm text-[#514d46] hover:border-[#c77b72] hover:text-[#bb5e53]">
              Clear comparison
            </button>
          )}
        </div>

        {compareError && <p role="alert" className="mt-6 text-sm text-[#bb5e53]">{compareError}</p>}
        {loading && <p role="status" className="mt-10 text-sm text-[#77716a]">Loading comparison…</p>}
        {!loading && error && (
          <div role="alert" className="mt-10 flex items-center gap-3 text-sm text-[#77716a]">
            <span>{error}</span>
            <button type="button" onClick={() => setReloadKey((key) => key + 1)} aria-label="Retry loading comparison" className="rounded border border-[#e7e3dd] p-2"><LuRefreshCw size={16} /></button>
          </div>
        )}
        {!loading && !error && products.length === 0 && (
          <div className="mt-10 rounded-xl border border-dashed border-[#ded9d1] p-10 text-center">
            <p className="text-[#77716a]">Your comparison list is empty.</p>
            <Link to="/shop" className="btn-dark mt-5 inline-flex px-6">Browse products</Link>
          </div>
        )}
        {!loading && !error && products.length > 0 && (
          <div className="mt-10 overflow-x-auto rounded-xl border border-[#e7e3dd]">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <tbody>
                <tr className="border-b border-[#e7e3dd]">
                  <th scope="row" className="w-40 p-4 text-[#77716a]">Product</th>
                  {products.map((product) => (
                    <td key={product.id} className="min-w-52 p-4 align-top">
                      <div className="relative">
                        <button type="button" onClick={() => removeProduct(product.id)} aria-label={`Remove ${product.title} from comparison`} className="absolute right-0 top-0 rounded-full border border-[#e7e3dd] p-1.5 text-[#77716a] hover:text-[#bb5e53]"><LuX size={15} /></button>
                        <Link to={`/product/${product.id}`} className="block">
                          <img src={product.image} alt={product.title} className="mb-4 aspect-[4/3] w-full rounded-lg bg-[#f2f0ec] object-cover" />
                          <span className="font-medium text-[#34312c] hover:underline">{product.title}</span>
                        </Link>
                      </div>
                    </td>
                  ))}
                </tr>
                {[
                  ["Price", (product) => `$${Number(product.price).toFixed(2)}`],
                  ["Category", (product) => product.category || "—"],
                  ["Brand", (product) => product.brand || "—"],
                  ["Rating", (product) => product.rating ? `${product.rating} / 5` : "—"],
                  ["Stock", (product) => Number(product.stock) > 0 ? `${product.stock} available` : "Out of stock"],
                ].map(([label, valueFor]) => (
                  <tr key={label} className="border-b border-[#e7e3dd] last:border-0">
                    <th scope="row" className="p-4 font-medium text-[#77716a]">{label}</th>
                    {products.map((product) => <td key={product.id} className="p-4 text-[#34312c]">{valueFor(product)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <Footer />
    </main>
  )
}

export default Compare
