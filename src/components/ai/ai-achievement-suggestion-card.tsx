import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AIInsight } from "@/types";

export function AIAchievementSuggestionCard({
  insight,
  onAccept,
  onDismiss,
}: {
  insight: AIInsight;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-accent/80">Achievement candidate</p>
          <h3 className="mt-2 text-lg font-semibold">{insight.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{insight.description}</p>
        </div>
        <Badge variant="warning">{insight.severity}</Badge>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={onAccept}>
          Convertir en achievement
        </Button>
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          Descartar
        </Button>
      </div>
    </Card>
  );
}
