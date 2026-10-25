import { useState } from "react"
import { Link } from "react-router"
import ProductCard from "./ProductCard"
import { categories, products } from "../data/products"

const NewArrival = () => {
  const [active, setActive] = useState("Women's Fashion")

  const visible = products.filter((p) => p.category === active)

  return (
    <section id="new-arrivals" className="bg-white py-[62px] scroll-mt-[70px]">
      <div className="container">
        <h2 className="font-Display text-[24px] font-bold text-center text-black">
          New Arrivals
        </h2>
        <p className="mt-[8px] mx-auto max-w-[400px] text-center text-[8px] leading-[12px] text-subtext">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque
          du du is ultrices sollicitudin aliquam sem. Scelerisque du du is
          ultrices sollicitudin.
        </p>

        <div className="mt-[25px] flex flex-wrap justify-center gap-[10px]">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActive(category)}
              className={`min-w-[101px] rounded-[4px] px-[13px] py-[8px] text-[8px] border transition-colors ${
                active === category
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-line hover:border-[#B9B9B9]"
              }`}>
              {category}
            </button>
          ))}
        </div>

        {visible.length > 0 ? (
          <div className="mt-[31px] mx-auto grid max-w-[626px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[30px]">
            {visible.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-[34px] text-center text-[14px] text-subtext">
            Nothing here yet — check back soon.
          </p>
        )}

        <div className="mt-[25px] flex justify-center">
          <Link
            to="/shop"
            className="rounded-[4px] bg-black px-[32px] py-[10px] text-[8px] text-white shadow-[0_8px_16px_rgba(0,0,0,0.18)] transition-colors hover:bg-[#222]">
            View More
          </Link>
        </div>
      </div>
    </section>
  )
}

export default NewArrival
