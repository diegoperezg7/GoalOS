import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  caption,
  icon: Icon,
}: {
  label: string;
  value: string;
  caption: string;
  icon: LucideIcon;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.01 }} transition={{ duration: 0.2 }}>
      <Card className="h-full p-3.5 sm:p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:text-xs sm:tracking-[0.24em]">{label}</p>
            <div className="text-xl font-semibold sm:text-2xl">{value}</div>
            <p className="text-[13px] leading-relaxed text-muted-foreground sm:text-sm">{caption}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/6 p-2.5 sm:rounded-2xl sm:p-3">
            <Icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
          </div>
        </div>
        <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-primary/80 sm:mt-4 sm:text-xs">
          <ArrowUpRight className="h-3.5 w-3.5" />
          Señal positiva
        </div>
      </Card>
    </motion.div>
  );
}
