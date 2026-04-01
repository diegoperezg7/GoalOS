import { ArrowUpRight, Clock3, Sparkles, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AIInsight } from "@/types";

const severityVariant = {
  low: "default",
  medium: "warning",
  high: "danger",
} as const;

export function AIInsightCard({
  insight,
  onAccept,
  onDismiss,
  onPostpone,
  onOpen,
}: {
  insight: AIInsight;
  onAccept?: () => void;
  onDismiss?: () => void;
  onPostpone?: () => void;
  onOpen?: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            AI insight
          </div>
          <div>
            <h3 className="text-lg font-semibold">{insight.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{insight.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={severityVariant[insight.severity]}>{insight.severity}</Badge>
          <Badge variant="info">{insight.type.replaceAll("_", " ")}</Badge>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {onAccept ? (
          <Button size="sm" onClick={onAccept}>
            Aceptar
          </Button>
        ) : null}
        {onOpen ? (
          <Button size="sm" variant="secondary" onClick={onOpen}>
            <ArrowUpRight className="h-4 w-4" />
            Abrir
          </Button>
        ) : null}
        {onPostpone ? (
          <Button size="sm" variant="outline" onClick={onPostpone}>
            <Clock3 className="h-4 w-4" />
            Posponer
          </Button>
        ) : null}
        {onDismiss ? (
          <Button size="sm" variant="ghost" onClick={onDismiss}>
            <X className="h-4 w-4" />
            Descartar
          </Button>
        ) : null}
      </div>
    </div>
  );
}
