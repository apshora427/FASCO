import { Link } from "react-router"
import { motion, useReducedMotion } from "framer-motion"
import { useHomepageContent } from "../hooks/useHomepageContent.js"
import { formatPrice, resolveImage } from "../data/products"
const calloutEntrances = [
  { x: 30, y: -16, rotate: 3 },
  { x: -34, y: 8, rotate: -3 },
  { x: 28, y: 18, rotate: 2 },
  { x: -28, y: -12, rotate: -2 },
  { x: 24, y: 16, rotate: 3 },
]

const PromoBanner = () => {
  const prefersReducedMotion = useReducedMotion()
  const { content, featuredProduct, loading, error, retry } = useHomepageContent()
  if (loading) return null
  if (error || !content || !featuredProduct) {
    return (
      <div className="container flex items-center justify-center gap-3 py-8" role="alert">
        <p className="text-[#8a8a8a]">{error || "Featured campaign product is unavailable."}</p>
        <button type="button" className="underline underline-offset-2" onClick={retry}>Try again</button>
      </div>
    )
  }
  const promo = content.promo

  const reveal = {
    hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: prefersReducedMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
  <motion.section
    initial={prefersReducedMotion ? false : "hidden"}
    whileInView="visible"
    viewport={{ once: true, amount: 0.25 }}
    className="overflow-hidden bg-[#dadada]">
    <div className="container relative flex flex-col-reverse lg:flex-row">
        <div className="absolute inset-y-0 left-[-100vw] right-[42.5%] hidden bg-[#f8f8f8] lg:block" />
        <div className="absolute inset-y-0 left-[57.5%] right-[-100vw] hidden bg-[#dadada] lg:block" />
        <motion.span
        aria-hidden="true"
        variants={{
          hidden: { scaleY: 0, opacity: 0 },
          visible: { scaleY: 1, opacity: 1, transition: { duration: prefersReducedMotion ? 0 : 1, delay: prefersReducedMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] } },
        }}
        style={{ transformOrigin: "top" }}
          className="absolute top-[32px] left-[57.5%] z-[4] hidden h-[602px] w-[188px] origin-top-left rotate-[14deg] border-l border-black lg:block"
        />

        <motion.div
          variants={{
            hidden: { opacity: 0, x: -55, scale: 0.96, clipPath: "inset(0 18% 0 0)" },
            visible: { opacity: 1, x: 0, scale: 1, clipPath: "inset(0 0% 0 0)", transition: { duration: prefersReducedMotion ? 0 : 1.15, ease: [0.22, 1, 0.36, 1] } },
          }}
          className="relative z-[3] flex flex-[0_1_57.5%] items-center justify-center bg-[#f8f8f8] py-10 lg:bg-transparent lg:py-0">
          <motion.div
            whileHover={prefersReducedMotion ? undefined : { scale: 1.025 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-[clamp(250px,32vw,570px)] w-fit max-w-full lg:h-full lg:w-full">
            <img
              src={resolveImage(promo.image)}
              alt={featuredProduct.title}
              className="h-full w-auto max-w-full object-contain lg:w-full lg:max-h-none lg:object-cover"
            />
            <motion.svg
              aria-hidden="true"
              viewBox="0 0 739 570"
              preserveAspectRatio="xMidYMid slice"
              className="pointer-events-none absolute inset-0 z-[2] h-full w-full">
              {promo.callouts.map((callout, index) => {
                const entrance = calloutEntrances[index]
                return (
                  <motion.image
                    key={callout.image}
                    href={resolveImage(callout.image)}
                    x={callout.x}
                    y={callout.y}
                    width={callout.width}
                    height={callout.height}
                    initial={prefersReducedMotion ? false : { opacity: 0, ...entrance, scale: 0.86 }}
                    whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.4 }}
                    style={{ transformBox: "fill-box", transformOrigin: "center" }}
                    transition={{
                      type: "spring",
                      stiffness: 190,
                      damping: 17,
                      delay: prefersReducedMotion ? 0 : 0.12 + index * 0.17,
                    }}
                  />
                )
              })}
            </motion.svg>
            {!prefersReducedMotion && (
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-[-45%] z-[3] w-[28%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/35 to-transparent mix-blend-screen"
                initial={{ x: "0%", opacity: 0 }}
                whileInView={{ x: "520%", opacity: [0, 0.75, 0] }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 1.5, delay: 0.65, ease: "easeInOut" }}
              />
            )}
          </motion.div>
        </motion.div>

        <motion.div
          variants={{ hidden: {}, visible: { transition: { delayChildren: prefersReducedMotion ? 0 : 0.38, staggerChildren: prefersReducedMotion ? 0 : 0.095 } } }}
          className="relative z-[5] flex-[0_1_42.5%] bg-[#dadada] lg:bg-transparent">
          <div className="px-5 py-[clamp(30px,4.6vw,60px)] sm:px-8 lg:ml-[29px] lg:py-[60px] lg:pr-0 lg:pl-0">
            <motion.div variants={reveal} className="text-[16px] leading-[1.41] text-[#767676]">
              {promo.collectionLabel}
            </motion.div>
            <motion.h2 variants={reveal} className="mt-5 font-Display text-[clamp(34px,3.2vw,46px)] leading-[1.41] text-[#484848]">
              {featuredProduct?.title}
            </motion.h2>
            <motion.a
              variants={reveal}
              href="#description"
              className="mt-5 inline-block text-[16px] leading-[1.41] text-black underline decoration-1 underline-offset-2">
              {promo.descriptionLabel}
            </motion.a>

            <motion.p variants={reveal} className="mt-5 max-w-[515px] text-[16px] leading-[1.41] text-[#767676]">
              {promo.description}
            </motion.p>

            <motion.div variants={reveal} className="mt-5 flex items-center">
              <span className="mr-[15px] text-[16px] text-[#767676]">{promo.sizeLabel}</span>
              <span className="rounded-[10px] bg-black px-5 py-[6px] leading-[1.4] text-white">
                {featuredProduct?.sizes?.[0] || promo.defaultSize}
              </span>
            </motion.div>

            <motion.p variants={reveal} className="mt-5 text-[28px] font-medium leading-[1.41] text-[#484848]">
              {formatPrice(featuredProduct?.price || 0)}
            </motion.p>

            <motion.div
              variants={reveal}
              whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.035 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className="mt-5 inline-block">
            <Link
              to={`/product/${featuredProduct?.id}`}
              className="btn-dark px-[70px] tracking-[0.02em]">
              {promo.buttonLabel}
            </Link>
            </motion.div>
          </div>
        </motion.div>
    </div>
  </motion.section>
  )
}

export default PromoBanner
