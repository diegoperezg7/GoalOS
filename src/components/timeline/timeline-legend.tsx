import { CheckCircle2, Circle, Goal, LucideIcon } from "lucide-react";

import { timelineCategoryMeta } from "@/components/timeline/timeline-meta";
import { cn } from "@/lib/utils";
import type { TimelineCategory } from "@/types";

function LegendChip({
  icon: Icon,
  label,
  className,
}: {
  icon: LucideIcon;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold sm:gap-2 sm:px-3 sm:py-2 sm:text-xs", className)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}

export function TimelineLegend({ categories }: { categories: TimelineCategory[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      <LegendChip
        icon={CheckCircle2}
        label="Pasado consolidado"
        className="border-white/12 bg-white/[0.04] text-foreground"
      />
      <LegendChip
        icon={Circle}
        label="Meta futura"
        className="border-white/12 bg-slate-950/55 text-muted-foreground"
      />
      {categories.map((category) => (
        <LegendChip
          key={category}
          icon={Goal}
          label={timelineCategoryMeta[category].label}
          className={cn("bg-slate-950/65", timelineCategoryMeta[category].borderClass, timelineCategoryMeta[category].textClass)}
        />
      ))}
    </div>
  );
}
