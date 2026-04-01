import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function PageTransition({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
      transition={
        shouldReduceMotion
          ? { duration: 0.12 }
          : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
      }
      className="space-y-6"
    >
      {children}
    </motion.section>
  );
}
