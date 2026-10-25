import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const ScrollFadeIn = ({ children, delay = 0 }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    // low threshold so tall sections still trigger on small viewports —
    // 40% was unreachable when a section is much taller than the window
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.8,      // longer animation
        ease: "easeOut",
        delay,              // optional delay for staggered animations
      }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollFadeIn;
