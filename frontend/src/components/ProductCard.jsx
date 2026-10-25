import { Link } from "react-router"
import { formatPrice } from "../data/products"

const ProductCard = ({ product }) => (
  <Link
    to={`/product/${product.id}`}
    className="group block rounded-[5px] bg-white p-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.10)]">
    <div className="overflow-hidden rounded-[4px]">
      <img
        src={product.image}
        alt={product.title}
        className="aspect-[137/88] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
    </div>

    <div className="mt-[9px] flex items-start justify-between">
      <div>
        <h3 className="font-Poppins text-[9px] font-semibold text-black">
          {product.title}
        </h3>
        <p className="mt-[1px] text-[6px] text-subtext">{product.brand}</p>
      </div>
      <span className="mt-[1px] text-[9px] tracking-[1px] text-star">★★★★★</span>
    </div>

    <p className="mt-[7px] text-[6px] text-subtext">
      {product.reviews} Customer Reviews
    </p>

    <div className="mt-[8px] flex items-center justify-between">
      <span className="font-Poppins text-[13px] font-semibold text-black">
        {formatPrice(product.price)}
      </span>
      {product.tag && (
        <span className="text-[6px] text-sale">{product.tag}</span>
      )}
    </div>
  </Link>
)

export default ProductCard
