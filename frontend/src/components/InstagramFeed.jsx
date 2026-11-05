import { motion, useReducedMotion } from "framer-motion"
import { useHomepageContent } from "../hooks/useHomepageContent.js"
import { resolveImage } from "../data/products"

const InstagramFeed = () => {
  const { content } = useHomepageContent()
  const { posts, title, description } = content.instagram
  const prefersReducedMotion = useReducedMotion()
  const headingVariants = {
    hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: prefersReducedMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  }
  const galleryVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: prefersReducedMotion ? 0 : 0.12,
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  }
  const postVariants = {
    hidden: (index) => ({
      opacity: 0,
      y: prefersReducedMotion ? 0 : index % 2 === 0 ? 48 : -38,
      x: prefersReducedMotion ? 0 : index < 3 ? -18 : 18,
      scale: prefersReducedMotion ? 1 : 0.92,
      rotate: prefersReducedMotion ? 0 : index % 2 === 0 ? -2 : 2,
      filter: prefersReducedMotion ? "none" : "blur(8px)",
    }),
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 115, damping: 17, mass: 0.8 },
    },
  }
  const postHover = prefersReducedMotion ? undefined : {
    y: -12,
    scale: 1.045,
    rotate: 0,
    zIndex: 2,
    boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
    transition: { type: "spring", stiffness: 320, damping: 20 },
  }

  return (
    <motion.section
      initial={prefersReducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      className="overflow-hidden bg-white py-[clamp(50px,10.4vw,150px)]">
      <div className="container mb-[clamp(40px,6.95vw,100px)] text-center">
        <motion.h2 variants={headingVariants} className="section-title">
          {title}
        </motion.h2>
        <motion.p variants={headingVariants} className="section-copy mx-auto mt-5 max-w-[614px]">
          {description}
        </motion.p>
      </div>

      <motion.div
        variants={galleryVariants}
        className="mx-auto hidden max-w-[1950px] items-center justify-center lg:flex">
        {posts.map((post, i) => (
          <motion.a
            key={i}
            custom={i}
            variants={postVariants}
            whileHover={postHover}
            href={post.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`${content.site.brandName} on Instagram ${i + 1}`}
            className="group block shrink-0"
            style={{ height: `min(${post.height}px, ${(post.height / 19.2).toFixed(2)}vw)` }}>
            <img
              src={resolveImage(post.image)}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-auto object-cover transition-opacity duration-300 group-hover:opacity-90"
            />
          </motion.a>
        ))}
      </motion.div>

      <motion.div
        variants={galleryVariants}
        className="container grid grid-cols-2 gap-2 sm:grid-cols-3 lg:hidden">
        {posts.map((post, i) => (
          <motion.a
            key={i}
            custom={i}
            variants={postVariants}
            whileHover={prefersReducedMotion ? undefined : { y: -5, scale: 1.025, zIndex: 2 }}
            href={post.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`${content.site.brandName} on Instagram ${i + 1}`}
            className="group block overflow-hidden">
            <img
              src={resolveImage(post.image)}
              alt=""
              loading="lazy"
              decoding="async"
              className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </motion.a>
        ))}
      </motion.div>
    </motion.section>
  )
}

export default InstagramFeed
