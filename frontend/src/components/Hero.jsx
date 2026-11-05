import { Link } from "react-router"
import { motion, useReducedMotion } from "framer-motion"
import ScrollToTopButton from "./ScrollToTopButton"
import { useHomepageContent } from "../hooks/useHomepageContent.js"
import { resolveImage } from "../data/products"

const entrance = (prefersReducedMotion, { x = 0, y = 12, delay = 0, scale = 1 } = {}) => ({
  initial: prefersReducedMotion ? false : { opacity: 0, x, y, scale },
  animate: { opacity: 1, x: 0, y: 0, scale: 1 },
  transition: {
    duration: prefersReducedMotion ? 0 : 0.72,
    delay: prefersReducedMotion ? 0 : delay,
    ease: [0.22, 1, 0.36, 1],
  },
})

const Hero = () => {
  const prefersReducedMotion = useReducedMotion()
  const { content } = useHomepageContent()
  const hero = content.hero

  return (
  <section className="relative bg-white">
    <div className="container pt-[clamp(26px,5.1vw,74px)] pb-[clamp(40px,3.8vw,55px)]">
      <div className="grid gap-[clamp(16px,2.4vw,35px)] lg:grid-cols-[392fr_456fr_392fr]">
        <motion.div
          {...entrance(prefersReducedMotion, { x: -22, delay: 0.08 })}
          className="hidden aspect-[392/756] overflow-hidden bg-[#EBEBEB] lg:block">
          <img
            src={resolveImage(hero.images.left)}
            alt={hero.imageAlts.left}
            className="h-full w-full object-cover"
          />
        </motion.div>


        <div className="mx-auto flex w-full max-w-[426px] flex-col lg:max-w-none">
          <motion.img
            {...entrance(prefersReducedMotion, { y: -14, delay: 0.1 })}
            src={resolveImage(hero.images.top)}
            alt={hero.imageAlts.top}
            className="aspect-[426/150] w-full object-cover"
          />

          <div className="flex flex-1 flex-col items-center justify-center py-[clamp(18px,2.4vw,34px)] text-center">
            <motion.h1
              {...entrance(prefersReducedMotion, { y: 14, delay: 0.16 })}
              className="font-Poppins font-medium leading-[0.95] text-[#484848]"
              style={{ fontSize: "clamp(56px, 6.32vw, 91px)", letterSpacing: "-0.02em" }}>
              {hero.title}
            </motion.h1>
            <motion.span
              {...entrance(prefersReducedMotion, { y: 18, scale: 0.97, delay: 0.24 })}
              className="font-Poppins font-bold leading-[0.82] text-transparent"
              style={{
                fontSize: "clamp(108px, 13.9vw, 200px)",
                letterSpacing: "-0.04em",
                WebkitTextStroke: "1px #484848",
              }}>
              {hero.headline}
            </motion.span>
            <motion.p
              {...entrance(prefersReducedMotion, { y: 10, delay: 0.34 })}
              className="mt-[clamp(16px,2.1vw,30px)] font-Poppins font-medium uppercase text-[#484848]"
              style={{ fontSize: "clamp(13px,1.4vw,20px)", letterSpacing: "0.1em", lineHeight: 1 }}>
              {hero.subtitle}
            </motion.p>
            <motion.div {...entrance(prefersReducedMotion, { y: 10, delay: 0.42 })}>
              <Link
                to={hero.buttonHref}
                className="btn-dark mt-[clamp(18px,2.1vw,30px)] uppercase tracking-[0.05em]">
                {hero.buttonLabel}
              </Link>
            </motion.div>
          </div>

          <motion.img
            {...entrance(prefersReducedMotion, { y: 14, delay: 0.18 })}
            src={resolveImage(hero.images.bottom)}
            alt={hero.imageAlts.bottom}
            className="aspect-[426/150] w-full object-cover"
          />
        </div>

        <motion.div
          {...entrance(prefersReducedMotion, { x: 22, delay: 0.16 })}
          className="hidden aspect-[392/756] overflow-hidden bg-[#EBEBEB] lg:block">
          <img
            src={resolveImage(hero.images.right)}
            alt={hero.imageAlts.right}
            className="h-full w-full object-cover"
          />
        </motion.div>
      </div>
    </div>

    <ScrollToTopButton />
  </section>
  )
}

export default Hero
