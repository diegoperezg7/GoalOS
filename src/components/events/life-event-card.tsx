import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { LifeEvent } from "@/types";
import { formatLongDate } from "@/utils/date";

const impactVariant = {
  low: "default",
  medium: "info",
  high: "warning",
  life_changing: "danger",
} as const;

export function LifeEventCard({ event }: { event: LifeEvent }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div whileHover={shouldReduceMotion ? undefined : { x: 4 }} transition={{ duration: 0.2 }}>
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-[13px] text-muted-foreground sm:text-sm">
              <CalendarDays className="h-4 w-4 text-primary" />
              {formatLongDate(event.date)}
            </div>
            <h3 className="text-base font-semibold sm:text-lg">{event.title}</h3>
            <p className="text-[13px] leading-relaxed text-muted-foreground sm:text-sm">{event.description}</p>
            {event.reflection ? <p className="text-[13px] leading-relaxed text-foreground/90 sm:text-sm">{event.reflection}</p> : null}
            <div className="flex flex-wrap gap-2 pt-1">
              {event.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-muted-foreground sm:px-3 sm:text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <Badge variant={impactVariant[event.impactLevel]}>{event.impactLevel.replace("_", " ")}</Badge>
        </div>
      </Card>
    </motion.div>
  );
}
