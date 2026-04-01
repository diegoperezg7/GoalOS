import { CheckCircle2, Flag, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Goal, Milestone } from "@/types";
import { FINANCIAL_LADDER_GOAL_ID, financialLadderLevels, formatFinancialLadderLevel } from "@/data/financial-ladder";
import { SCENARIOS, runScenario } from "@/data/flip-simulation";
import { formatMonthYear } from "@/utils/date";
import { useAppStore } from "@/store/use-app-store";

function resolveLadderMilestone(level: number, milestones: Milestone[]) {
  return milestones.find((milestone) => milestone.id === `milestone_ladder_${level}`);
}

export function FinancialLadderPanel({
  goal,
  milestones,
  compact = false,
  className,
}: {
  goal?: Goal;
  milestones: Milestone[];
  compact?: boolean;
  className?: string;
}) {
  const ladder = useMemo(
    () =>
      financialLadderLevels.map((level) => {
        const milestone = resolveLadderMilestone(level, milestones);
        return {
          level,
          milestone,
          completed: milestone?.completed ?? false,
        };
      }),
    [milestones],
  );

  const toggleMilestone = useAppStore((state) => state.toggleMilestone);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingDate, setPendingDate] = useState(new Date().toISOString().slice(0, 10));
  const completedCount = ladder.filter((item) => item.completed).length;
  const unresolvedIndex = ladder.findIndex((item) => !item.completed);
  const currentIndex = unresolvedIndex === -1 ? Math.max(0, ladder.length - 1) : unresolvedIndex;
  const currentStep = ladder[currentIndex] ?? ladder[ladder.length - 1];
  const previousStep = currentIndex > 0 ? ladder[currentIndex - 1] : undefined;
  const progressPercent = goal?.progress ?? Math.round((completedCount / ladder.length) * 100);

  // Predict using the "realista" scenario from the simulation engine.
  // Takes into account salary growth, bonuses and investment returns — not a linear model.
  const horizonPrediction = useMemo(() => {
    const realistaConfig = SCENARIOS.find((s) => s.id === "realista")!;
    const lastCompletedLevel = ladder
      .filter((s) => s.completed)
      .reduce((max, s) => Math.max(max, s.level), 0);
    const currentCapital = lastCompletedLevel > 0 ? lastCompletedLevel : 500;
    const result = runScenario(realistaConfig, currentCapital, 21);

    const nextFlip = result.flips.find((f) => f.monthsFromNow > 0);
    const finalFlip = result.flips[result.flips.length - 1];
    if (!nextFlip || !finalFlip) return null;

    const toDate = (monthsFromNow: number) => {
      const d = new Date();
      d.setMonth(d.getMonth() + monthsFromNow);
      return d.toISOString();
    };

    return {
      finalDate: toDate(finalFlip.monthsFromNow),
      nextDate: toDate(nextFlip.monthsFromNow),
      projectedSteps: result.flips
        .filter((f) => f.monthsFromNow > 0)
        .map((f) => ({ level: f.level, date: new Date(toDate(f.monthsFromNow)) })),
    };
  }, [ladder]);

  return (
    <Card className={cn("overflow-hidden p-0", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_34%)]" />
      <div className={cn("relative space-y-5 p-4 sm:p-6", compact && "space-y-4 p-4")}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.28em] text-primary/80 sm:text-xs">Financial Ladder</p>
            <div>
              <h3 className={cn("text-2xl font-semibold sm:text-3xl", compact && "text-xl sm:text-2xl")}>11 Flips</h3>
              <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                Cada nivel es un milestone financiero. La lógica no es correr: es subir una escalera acumulativa con criterio.
              </p>
            </div>
          </div>

          {!compact ? null : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[22px] border border-white/10 bg-slate-950/55 p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Siguiente flip</p>
            <p className="mt-2 text-2xl font-semibold">{formatFinancialLadderLevel(currentStep.level)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {previousStep ? `Después de ${formatFinancialLadderLevel(previousStep.level)}` : "Primer escalón del sistema"}
            </p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-slate-950/55 p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Escalones completados</p>
            <p className="mt-2 text-2xl font-semibold">
              {completedCount}/{ladder.length}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Sin asumir capital actual más allá de lo que ya esté marcado.</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-slate-950/55 p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Horizonte estimado</p>
            <p className="mt-2 text-2xl font-semibold">
              {horizonPrediction ? formatMonthYear(horizonPrediction.finalDate) : "—"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {horizonPrediction
                ? `Próximo: ${formatMonthYear(horizonPrediction.nextDate)}`
                : "Sin datos"}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50">
              Escenario realista · ver detalle ↓
            </p>
          </div>
        </div>

        <div className="rounded-full bg-white/[0.05] p-1">
          <div className="h-2 rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 transition-all"
              style={{ width: `${Math.max(4, progressPercent)}%` }}
            />
          </div>
        </div>

        <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          <div className="hide-scrollbar flex min-w-max items-end gap-3 pb-2">
            {ladder.map((step, index) => {
              const state = step.completed ? "completed" : index === currentIndex ? "current" : "upcoming";

              const isPending = pendingId === step.milestone?.id;
              const projectedStep = horizonPrediction?.projectedSteps.find((p) => p.level === step.level);

              return (
                <div
                  key={step.level}
                  className={cn(
                    "w-[152px] shrink-0 rounded-[24px] border p-4 transition-all sm:w-[168px]",
                    step.milestone && !isPending ? "cursor-pointer active:scale-95 hover:brightness-110" : "",
                    state === "completed"
                      ? "border-emerald-300/25 bg-emerald-400/10"
                      : state === "current"
                        ? "border-amber-300/30 bg-amber-300/10"
                        : "border-white/10 bg-white/[0.03]",
                    isPending ? "ring-2 ring-primary/50" : "",
                  )}
                  style={{ transform: compact || isPending ? undefined : `translateY(${index % 2 === 0 ? 0 : 16}px)` }}
                  onClick={() => {
                    if (!step.milestone || isPending) return;
                    if (step.completed) {
                      toggleMilestone(step.milestone.id);
                    } else {
                      setPendingId(step.milestone.id);
                      setPendingDate(new Date().toISOString().slice(0, 10));
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Escalón {index + 1}</p>
                      <p className="mt-2 text-xl font-semibold">{formatFinancialLadderLevel(step.level)}</p>
                    </div>
                    <div
                      className={cn(
                        "rounded-full p-2",
                        state === "completed"
                          ? "bg-emerald-300/20 text-emerald-200"
                          : state === "current"
                            ? "bg-amber-300/20 text-amber-100"
                            : "bg-white/[0.05] text-muted-foreground",
                      )}
                    >
                      {state === "completed" ? <CheckCircle2 className="h-4 w-4" /> : state === "current" ? <Flag className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                    </div>
                  </div>

                  {isPending ? (
                    <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
                      <p className="text-xs text-muted-foreground">¿Cuándo lo alcanzaste?</p>
                      <input
                        type="date"
                        value={pendingDate}
                        max={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setPendingDate(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          className="h-7 flex-1 rounded-xl text-xs"
                          onClick={() => {
                            toggleMilestone(step.milestone!.id, pendingDate);
                            setPendingId(null);
                          }}
                        >
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 rounded-xl px-2 text-xs"
                          onClick={() => setPendingId(null)}
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mt-4 text-sm text-muted-foreground">
                        {state === "completed"
                          ? (step.milestone?.completedAt ? formatMonthYear(step.milestone.completedAt) : "Nivel alcanzado")
                          : state === "current" ? "Objetivo activo" : "Escalón futuro"}
                      </p>
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {state === "completed"
                          ? "✓ completado"
                          : projectedStep
                            ? formatMonthYear(projectedStep.date.toISOString())
                            : "Sin proyección"}
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {!compact && goal?.id === FINANCIAL_LADDER_GOAL_ID ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              "Cada escalón existe para medir patrimonio, no ego.",
              "El sistema está conectado con la mejora salarial y la inversión responsable.",
              "La escalera permite pensar en compounding con claridad visual.",
            ].map((item) => (
              <div key={item} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
