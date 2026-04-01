import { ArrowLeft, ArrowRight, LocateFixed } from "lucide-react";

import { Button } from "@/components/ui/button";

export function TimelineControls({
  current,
  total,
  onPrevious,
  onNext,
  onPresent,
  canPrevious,
  canNext,
}: {
  current: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  onPresent: () => void;
  canPrevious: boolean;
  canNext: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="rounded-full border border-white/10 bg-slate-950/60 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:px-3 sm:py-2 sm:text-xs sm:tracking-[0.28em]">
        Nodo {current} / {total}
      </div>
      <Button variant="secondary" size="sm" onClick={onPrevious} disabled={!canPrevious}>
        <ArrowLeft className="h-4 w-4" />
        Anterior
      </Button>
      <Button variant="secondary" size="sm" onClick={onNext} disabled={!canNext}>
        Siguiente
        <ArrowRight className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onPresent}>
        <LocateFixed className="h-4 w-4" />
        Volver al presente
      </Button>
    </div>
  );
}
