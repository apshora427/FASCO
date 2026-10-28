import { motion, useReducedMotion } from "framer-motion";
import { useInView } from "react-intersection-observer";

// Small label + heading pair used above every homepage/shop section.
function SectionHead({ text, para }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.4 });
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-[30px]">
      <span className="relative before:absolute before:left-[-40px] before:bottom-[-8px] before:content-[''] before:w-5 before:h-10 before:bg-primary before:mr-[30px] before:rounded-[4px] text-primary text-[16px] leading-[20px] font-semibold font-Poppins ml-[40px]">
        {text}
      </span>

      <motion.div
        ref={ref}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: prefersReducedMotion ? 0 : 0.38, ease: "easeOut" }}>
        <h5 className="text-[36px] font-Display font-semibold leading-[48px] text-black dark:text-white mb-[60px]">
          {para}
        </h5>
      </motion.div>
    </div>
  );
}

export default SectionHead;
