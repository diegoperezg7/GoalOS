import { motion, useReducedMotion } from "framer-motion";

import { timelineCategoryMeta, timelineTypeMeta } from "@/components/timeline/timeline-meta";
import { cn } from "@/lib/utils";
import type { TimelineItem } from "@/types";
import { formatMonthYear } from "@/utils/date";

const impactScale = {
  low: 0.9,
  medium: 1,
  high: 1.12,
  life_changing: 1.24,
} as const;

export function TimelineNode({
  item,
  x,
  y,
  isSelected,
  labelSide,
  onSelect,
  registerNode,
  delay,
}: {
  item: TimelineItem;
  x: number;
  y: number;
  isSelected: boolean;
  labelSide: "top" | "bottom";
  onSelect: (id: string) => void;
  registerNode: (id: string, node: HTMLButtonElement | null) => void;
  delay: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const categoryMeta = timelineCategoryMeta[item.category];
  const typeMeta = timelineTypeMeta[item.type];
  const size = 26 * impactScale[item.impactLevel];
  const labelClass =
    labelSide === "top"
      ? "bottom-[calc(100%+18px)] items-center"
      : "top-[calc(100%+18px)] items-center";

  return (
    <motion.button
      ref={(node) => registerNode(item.id, node)}
      type="button"
      onClick={() => onSelect(item.id)}
      aria-pressed={isSelected}
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.94 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      transition={shouldReduceMotion ? { duration: 0.1 } : { delay, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="group absolute -translate-x-1/2 -translate-y-1/2 touch-pan-x focus-visible:outline-none"
      style={{ left: x, top: y }}
    >
      <span
        className={cn(
          "pointer-events-none absolute left-1/2 flex min-w-[116px] max-w-[132px] -translate-x-1/2 flex-col rounded-[18px] border px-2.5 py-1.5 text-center backdrop-blur-xl transition-all sm:min-w-[132px] sm:max-w-[164px] sm:rounded-[22px] sm:px-3 sm:py-2",
          labelClass,
          isSelected
            ? `border-white/18 bg-slate-950/82 text-foreground ${categoryMeta.glowClass}`
            : "border-white/10 bg-slate-950/60 text-muted-foreground group-hover:border-white/18 group-hover:bg-slate-950/78 group-hover:text-foreground",
        )}
      >
        <span className="text-[9px] uppercase tracking-[0.18em] text-primary/70 sm:text-[10px] sm:tracking-[0.26em]">{typeMeta.label}</span>
        <span className="mt-1 text-[13px] font-semibold leading-snug sm:text-sm">{item.title}</span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:text-[11px] sm:tracking-[0.22em]">{formatMonthYear(item.date)}</span>
      </span>

      {isSelected ? (
        <motion.span
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: size * 3.2,
            height: size * 3.2,
            marginLeft: -(size * 1.6),
            marginTop: -(size * 1.6),
            background: `radial-gradient(circle, ${categoryMeta.accent}30 0%, transparent 70%)`,
          }}
          animate={shouldReduceMotion ? { opacity: 0.8 } : { opacity: [0.35, 0.9, 0.35], scale: [0.96, 1.1, 0.96] }}
          transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 2.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      ) : null}

      <span
        className={cn(
          "absolute left-1/2 top-1/2 rounded-full border transition-all",
          item.status === "past" ? "bg-slate-950/25" : "border-dashed bg-slate-950/75",
          isSelected ? "border-white/35" : "border-white/16 group-hover:border-white/26",
        )}
        style={{
          width: size * 2.15,
          height: size * 2.15,
          marginLeft: -(size * 1.075),
          marginTop: -(size * 1.075),
          boxShadow: isSelected ? `0 0 30px ${categoryMeta.accent}33` : undefined,
        }}
      />

      <span
        className={cn(
          "absolute left-1/2 top-1/2 rounded-full border transition-all",
          item.status === "past" ? categoryMeta.borderClass : "border-white/18 bg-slate-950/92",
          isSelected ? "scale-110 border-white/40" : "group-hover:scale-105",
        )}
        style={{
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          background:
            item.status === "past"
              ? `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), ${categoryMeta.accent})`
              : "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), rgba(15,23,42,0.9))",
        }}
      />

      <span
        className="absolute left-1/2 top-1/2 rounded-full bg-slate-950/95"
        style={{
          width: size * 0.34,
          height: size * 0.34,
          marginLeft: -(size * 0.17),
          marginTop: -(size * 0.17),
          border: `1px solid ${item.status === "past" ? "rgba(255,255,255,0.68)" : categoryMeta.accent}`,
        }}
      />
    </motion.button>
  );
}
