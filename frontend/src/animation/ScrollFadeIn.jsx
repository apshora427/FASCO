import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const ScrollFadeIn = ({ children, delay = 0 }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.4, // was 0.1 before – now it waits for 40% to show
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
