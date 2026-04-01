import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";

export function SectionHeading({
  eyebrow,
  title,
  description,
  actionLabel,
  onAction,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col items-start gap-3 sm:gap-4 sm:flex-row sm:items-end sm:justify-between">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        className="w-full space-y-1.5 sm:space-y-2"
      >
        {eyebrow ? <p className="text-[10px] uppercase tracking-[0.28em] text-primary/80 sm:text-xs sm:tracking-[0.34em]">{eyebrow}</p> : null}
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-balance sm:text-2xl md:text-3xl">{title}</h2>
          {description ? <p className="max-w-2xl text-[13px] leading-relaxed text-muted-foreground sm:text-sm">{description}</p> : null}
        </div>
      </motion.div>
      {actionLabel && onAction ? (
        <Button variant="secondary" onClick={onAction} className="w-full shrink-0 sm:w-auto">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
