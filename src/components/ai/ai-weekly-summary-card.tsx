import { BrainCircuit, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { WeeklySummary } from "@/types";

export function AIWeeklySummaryCard({
  summary,
  onRefresh,
}: {
  summary: WeeklySummary | null;
  onRefresh?: () => void;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="inline-flex rounded-2xl border border-white/10 bg-primary/10 p-3 text-primary">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-primary/80">Weekly AI summary</p>
            <h3 className="mt-2 text-xl font-semibold">{summary?.headline ?? "Resumen semanal pendiente"}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{summary?.mainInsight ?? "Genera una lectura AI de la semana."}</p>
          </div>
        </div>
        {onRefresh ? (
          <Button variant="secondary" size="sm" onClick={onRefresh}>
            <RefreshCcw className="h-4 w-4" />
            Actualizar
          </Button>
        ) : null}
      </div>
      <div className="mt-4 grid gap-2">
        {summary?.highlights.map((highlight) => (
          <div key={highlight} className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-muted-foreground">
            {highlight}
          </div>
        ))}
      </div>
      {summary?.focus ? <div className="mt-4 rounded-[24px] border border-white/10 bg-accent/10 p-4 text-sm">{summary.focus}</div> : null}
    </Card>
  );
}
