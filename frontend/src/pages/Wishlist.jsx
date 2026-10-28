import { Link } from "react-router"
import { LuArrowRight, LuHeart, LuShoppingBag, LuTrash2 } from "react-icons/lu"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { UseStore } from "../context/StoreContext"
import { formatPrice } from "../data/products"

export default function Wishlist() {
  const { wishlist, removeFromWishlist, moveToCart } = UseStore()

  return (
    <main className="min-h-screen bg-white">
      <Navbar variant="shop" />
      <section className="container min-h-[55vh] pb-20 pt-10">
        <div className="mx-auto max-w-[1080px]">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a87534]">SAVED FOR LATER</p>
              <h1 className="mt-2 font-Display text-[clamp(34px,4vw,48px)] text-[#292723]">Your wishlist</h1>
              <p className="mt-2 text-sm text-[#88837c]">{wishlist.length} saved {wishlist.length === 1 ? "piece" : "pieces"}</p>
            </div>
            <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-[#514d46] hover:text-[#a87534]">
              Explore the collection <LuArrowRight size={16} />
            </Link>
          </div>

          {wishlist.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#eeeae4] bg-[#fbfaf8] px-5 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-[#f3ede3] text-[#a87534]"><LuHeart size={23} /></span>
              <h2 className="mt-5 font-Display text-2xl text-[#33302b]">Your wishlist is waiting</h2>
              <p className="mt-2 max-w-sm text-sm text-[#88837c]">Save the styles you love and they’ll be right here when you’re ready.</p>
              <Link to="/shop" className="btn-dark mt-6 gap-2 px-7">Discover FASCO <LuArrowRight size={15} /></Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {wishlist.map((product) => (
                <article key={product.id} className="overflow-hidden rounded-xl border border-[#eeeae4] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
                  <Link to={`/product/${product.id}`} className="block aspect-[4/3] overflow-hidden bg-[#f2f0ec]">
                    <img src={product.image} alt={product.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]" />
                  </Link>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link to={`/product/${product.id}`} className="font-medium text-[#34312c] hover:underline">{product.title}</Link>
                        <p className="mt-1 text-[11px] text-[#928d85]">{product.category}</p>
                      </div>
                      <strong className="shrink-0 text-sm text-[#34312c]">{formatPrice(product.price)}</strong>
                    </div>
                    <div className="mt-5 flex gap-2">
                      <button type="button" disabled={product.stock <= 0} onClick={() => moveToCart(product)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-md bg-black px-3 text-xs font-medium text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50">
                        <LuShoppingBag size={15} /> {product.stock <= 0 ? "Sold out" : "Add to cart"}
                      </button>
                      <button type="button" onClick={() => removeFromWishlist(product.id)} aria-label={`Remove ${product.title} from wishlist`} className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[#e7e3dd] text-[#77716a] hover:border-[#c77b72] hover:text-[#bb5e53]">
                        <LuTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}
