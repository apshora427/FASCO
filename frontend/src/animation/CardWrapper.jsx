// CardWrapper.jsx
import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const CardWrapper = ({ children }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="bg-white dark:bg-[#121212] rounded-lg p-4 transition-colors duration-300"
      whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(219, 68, 68, 0.2)" }}
    >
      {children}
    </motion.div>
  );
};

export default CardWrapper;
