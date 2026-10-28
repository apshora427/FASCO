import feature1 from "../assets/figma/feature-1.svg"
import feature2 from "../assets/figma/feature-2.svg"
import feature3 from "../assets/figma/feature-3.svg"
import feature4 from "../assets/figma/feature-4.svg"

const features = [
  { icon: feature1, title: "High Quality", sub: "crafted from top materials" },
  { icon: feature2, title: "Warranty Protection", sub: "Over 2 years" },
  { icon: feature3, title: "Free Shipping", sub: "Order over 150 $" },
  { icon: feature4, title: "24 / 7 Support", sub: "Dedicated support" },
]

const Features = () => (
  <section className="bg-white py-[clamp(50px,5vw,72px)]">
    <div className="container flex flex-wrap justify-between gap-x-10 gap-y-8">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="flex basis-full items-center gap-[13px] sm:basis-[calc(50%-20px)] lg:basis-auto">
          <img
            src={feature.icon}
            alt=""
            aria-hidden="true"
            className="h-[50px] w-auto shrink-0 dark:invert"
          />
          <div>
            <p className="text-[20px] font-medium leading-[1.62] text-[#484848]">
              {feature.title}
            </p>
            <p className="text-[16px] leading-[1.62] text-[#484848]">
              {feature.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  </section>
)

export default Features
