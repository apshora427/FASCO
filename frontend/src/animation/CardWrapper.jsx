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
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: prefersReducedMotion ? 0 : 0.42, ease: "easeOut" }}
      className="bg-white dark:bg-[#121212] rounded-lg p-4 transition-colors duration-300"
      whileHover={prefersReducedMotion ? undefined : { y: -2, boxShadow: "0 12px 28px rgba(0, 0, 0, 0.08)" }}
    >
      {children}
    </motion.div>
  );
};

export default CardWrapper;
