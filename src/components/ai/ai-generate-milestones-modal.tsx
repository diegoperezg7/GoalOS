import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import type { MilestoneSuggestionResult } from "@/services/ai/ai-types";

export function AIGenerateMilestonesModal({
  open,
  onClose,
  suggestion,
  onAddMilestone,
}: {
  open: boolean;
  onClose: () => void;
  suggestion: MilestoneSuggestionResult | null;
  onAddMilestone: (index: number) => void;
}) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Milestones sugeridos"
      description="La IA propone fases, riesgos y siguiente paso para este goal."
    >
      <div className="space-y-4">
        {suggestion?.milestones.map((milestone, index) => (
          <div key={`${milestone.title}-${milestone.dueDate}`} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <p className="font-medium">{milestone.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{milestone.description}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-primary/80">{milestone.rationale}</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">{milestone.dueDate}</span>
              <Button size="sm" onClick={() => onAddMilestone(index)}>
                <Plus className="h-4 w-4" />
                Añadir
              </Button>
            </div>
          </div>
        ))}
        {suggestion?.risks.length ? (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <p className="font-medium">Riesgos detectados</p>
            <div className="mt-3 grid gap-2">
              {suggestion.risks.map((risk) => (
                <div key={risk} className="text-sm text-muted-foreground">
                  {risk}
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-foreground/90">{suggestion.nextStep}</p>
          </div>
        ) : null}
      </div>
    </Sheet>
  );
}
