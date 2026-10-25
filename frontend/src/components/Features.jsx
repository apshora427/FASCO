import { LuCrown, LuHeadphones, LuPackage, LuShieldCheck } from "react-icons/lu"

const features = [
  { icon: LuCrown, title: "High Quality", sub: "crafted from top materials" },
  { icon: LuShieldCheck, title: "Warranty Protection", sub: "Over 2 years" },
  { icon: LuPackage, title: "Free Shipping", sub: "Order over 150 $" },
  { icon: LuHeadphones, title: "24 / 7 Support", sub: "Dedicated support" },
]

const Features = () => (
  <section className="bg-white py-[25px]">
    <div className="container flex flex-wrap justify-center gap-x-[46px] gap-y-[18px]">
      {features.map(({ icon: Icon, title, sub }) => (
        <div key={title} className="flex items-center gap-[9px]">
          <Icon size={23} strokeWidth={1.25} className="shrink-0 text-black" />
          <div>
            <p className="font-Poppins text-[10px] font-semibold text-black">
              {title}
            </p>
            <p className="mt-[1px] text-[7px] text-subtext">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
)

export default Features
