import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  indicatorClassName,
}: {
  value: number;
  className?: string;
  indicatorClassName?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={cn("h-2.5 overflow-hidden rounded-full bg-white/8", className)}>
      <motion.div
        className={cn("h-full rounded-full bg-primary", indicatorClassName)}
        initial={shouldReduceMotion ? false : { width: 0 }}
        animate={{ width: `${value}%` }}
        transition={shouldReduceMotion ? { duration: 0.12 } : { type: "spring", stiffness: 90, damping: 20 }}
      />
    </div>
  );
}
