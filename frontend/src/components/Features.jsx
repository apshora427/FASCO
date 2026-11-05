import { useHomepageContent } from "../hooks/useHomepageContent.js"
import { resolveImage } from "../data/products"

const Features = () => {
  const { content } = useHomepageContent()

  return (
    <section className="bg-white py-[clamp(50px,5vw,72px)]">
      <div className="container flex flex-wrap justify-between gap-x-10 gap-y-8">
        {content.features.map((feature) => (
          <div
            key={feature.title}
            className="flex basis-full items-center gap-[13px] sm:basis-[calc(50%-20px)] lg:basis-auto">
            <img
              src={resolveImage(feature.icon)}
              alt=""
              aria-hidden="true"
              className="h-[50px] w-auto shrink-0 dark:invert"
            />
            <div>
              <p className="text-[20px] font-medium leading-[1.62] text-[#484848]">
                {feature.title}
              </p>
              <p className="text-[16px] leading-[1.62] text-[#484848]">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Features
