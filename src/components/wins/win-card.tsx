import { Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Win } from "@/types";
import { formatLongDate } from "@/utils/date";

const impactVariant = {
  low: "default",
  medium: "info",
  high: "warning",
  life_changing: "danger",
} as const;

export function WinCard({ win }: { win: Win }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-[13px] text-accent sm:text-sm">
            <Trophy className="h-4 w-4" />
            {formatLongDate(win.date)}
          </div>
          <div>
            <h3 className="text-base font-semibold sm:text-lg">{win.title}</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">{win.description}</p>
          </div>
          {win.reflection ? <p className="text-[13px] leading-relaxed text-foreground/90 sm:text-sm">{win.reflection}</p> : null}
        </div>
        <Badge variant={impactVariant[win.impactLevel]}>{win.impactLevel.replace("_", " ")}</Badge>
      </div>
    </Card>
  );
}
