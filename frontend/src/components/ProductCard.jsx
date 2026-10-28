import { Link } from "react-router"
import { formatPrice } from "../data/products"

const ProductCard = ({ product }) => (
  <Link
    to={`/product/${product.id}`}
    className="group block rounded-[10px] bg-white transition-transform duration-300 hover:-translate-y-1"
    style={{
      padding: "15px 25px 36px",
      boxShadow: "0 40px 90px rgba(0,0,0,0.06)",
    }}>
    <div className="mb-3 overflow-hidden rounded-[10px]">
      <img
        src={product.image}
        alt={product.title}
        loading="lazy"
        decoding="async"
        className="aspect-[336/244] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
    </div>

    <div className="mb-[25px] flex items-start justify-between gap-3">
      <div>
        <h3 className="text-[20px] font-medium leading-[1.2] text-[#484848]">
          {product.title}
        </h3>
        <p className="mt-2 text-[12px] leading-none text-[#8a8a8a]">
          {product.brand}
        </p>
      </div>
      <span
        className="shrink-0 text-[#FCA120]"
        style={{ fontSize: "clamp(13px, 1.32vw, 19px)", letterSpacing: "0.03em", lineHeight: 1 }}
        aria-label={`${product.rating} out of 5 stars`}>
        ★★★★★
      </span>
    </div>

    <p className="mb-[25px] text-[12px] font-medium leading-4 text-[#484848]">
      {product.reviews} Customer Reviews
    </p>

    <div className="flex items-end justify-between gap-[30px]">
      <span className="text-[24px] font-medium leading-[0.83] tracking-[-0.01em] text-[#484848]">
        {formatPrice(product.price)}
      </span>
      {product.tag && (
        <span className="text-right text-[12px] leading-[1.67] tracking-[-0.01em] text-sale">
          {product.tag}
        </span>
      )}
    </div>
  </Link>
)

export default ProductCard
