// CardWrapper.jsx
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const CardWrapper = ({ children }) => {
  const prefersReducedMotion = useReducedMotion();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14, scale: 0.985 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: prefersReducedMotion ? 0 : 0.52, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white dark:bg-[#121212] rounded-lg p-4 transition-colors duration-300"
      whileHover={prefersReducedMotion ? undefined : { y: -4, boxShadow: "0 16px 34px rgba(0, 0, 0, 0.12)" }}
    >
      {children}
    </motion.div>
  );
};

export default CardWrapper;
