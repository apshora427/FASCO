import { Link } from "react-router"
import peaky from "../assets/shop/shop_page_11.png"

const PromoBanner = () => (
  <section className="flex h-[283px] items-stretch overflow-hidden bg-[#F5F5F5]">
    <img
      src={peaky}
      alt="Peaky Blinders inspired collection with flat cap, suspender and Hugo Boss details"
      className="h-full w-[41%] object-cover object-left"
    />

    <div className="-ml-[8%] flex flex-1 flex-col justify-center bg-[#D9D9D9] pl-[27%] pr-[6%] [clip-path:polygon(24%_0,100%_0,100%_100%,0_100%)]">
      <p className="text-[8px] text-[#6E6E6E]">Women Collection</p>
      <h2 className="mt-[5px] font-Display text-[24px] font-bold leading-tight text-black">
        Peaky Blinders
      </h2>
      <p className="mt-[10px] w-fit text-[7px] tracking-[0.08em] text-black underline underline-offset-4">
        DESCRIPTION
      </p>
      <p className="mt-[8px] max-w-[280px] text-[8px] leading-[12px] text-[#5F5F5F]">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque du
        du is ultrices sollicitudin aliquam sem. Scelerisque du du is ultrices
        sollicitudin.
      </p>

      <div className="mt-[10px] flex items-center gap-[7px] text-[8px] text-black">
        Size:
        <span className="rounded-[4px] bg-black px-[8px] py-[2px] text-[7px] text-white">
          M
        </span>
      </div>

      <p className="mt-[9px] font-Poppins text-[14px] font-semibold text-black">
        $100.00
      </p>

      <Link
        to="/product/1"
        className="mt-[10px] w-fit rounded-[4px] bg-black px-[32px] py-[9px] text-[8px] text-white shadow-[0_7px_14px_rgba(0,0,0,0.18)] transition-colors hover:bg-[#222]">
        Buy Now
      </Link>
    </div>
  </section>
)

export default PromoBanner
