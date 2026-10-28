import { Link } from "react-router"
import promo from "../assets/figma/promo.png"

const PromoBanner = () => (
  <section className="overflow-hidden bg-[#dadada]">
    <div className="container relative flex flex-col-reverse lg:flex-row">
      <div className="absolute inset-y-0 left-[-100vw] right-[42.5%] hidden bg-[#f8f8f8] lg:block" />
      <div className="absolute inset-y-0 left-[57.5%] right-[-100vw] hidden bg-[#dadada] lg:block" />
      <span
        aria-hidden="true"
        className="absolute top-[32px] left-[57.5%] z-[4] hidden h-[602px] w-[188px] origin-top-left rotate-[14deg] border-l border-black lg:block"
      />

      <div className="relative z-[3] flex flex-[0_1_57.5%] items-center justify-center bg-[#f8f8f8] py-10 lg:bg-transparent lg:py-0">
        <img
          src={promo}
          alt="Peaky Blinders inspired collection"
          className="h-[clamp(250px,32vw,570px)] w-auto max-w-full object-contain lg:h-full lg:w-full lg:max-h-none lg:object-cover"
        />
      </div>

      <div className="relative z-[5] flex-[0_1_42.5%] bg-[#dadada] lg:bg-transparent">
        <div className="px-5 py-[clamp(30px,4.6vw,60px)] sm:px-8 lg:ml-[29px] lg:py-[60px] lg:pr-0 lg:pl-0">
          <div className="text-[16px] leading-[1.41] text-[#767676]">
            Women Collection
          </div>
          <h2 className="mt-5 font-Display text-[clamp(34px,3.2vw,46px)] leading-[1.41] text-[#484848]">
            Peaky Blinders
          </h2>
          <a
            href="#description"
            className="mt-5 inline-block text-[16px] leading-[1.41] text-black underline decoration-1 underline-offset-2">
            DESCRIPTION
          </a>

          <p className="mt-5 max-w-[515px] text-[16px] leading-[1.41] text-[#767676]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque
            duis ultrices sollicitudin aliquam sem. Scelerisque duis ultrices
            sollicitudin. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Scelerisque duis.
          </p>

          <div className="mt-5 flex items-center">
            <span className="mr-[15px] text-[16px] text-[#767676]">Size:</span>
            <span className="rounded-[10px] bg-black px-5 py-[6px] leading-[1.4] text-white">
              M
            </span>
          </div>

          <p className="mt-5 text-[28px] font-medium leading-[1.41] text-[#484848]">
            $100.<span className="text-[24px]">00</span>
          </p>

          <Link
            to="/product/1"
            className="btn-dark mt-5 px-[70px] tracking-[0.02em]">
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  </section>
)

export default PromoBanner
