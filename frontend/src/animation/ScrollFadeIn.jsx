import { motion, useReducedMotion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const ScrollFadeIn = ({ children, delay = 0 }) => {
  const prefersReducedMotion = useReducedMotion();
  const { ref, inView } = useInView({
    triggerOnce: true,
    // low threshold so tall sections still trigger on small viewports —
    // 40% was unreachable when a section is much taller than the window
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.48,
        ease: "easeOut",
        delay: prefersReducedMotion ? 0 : delay,
      }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollFadeIn;
