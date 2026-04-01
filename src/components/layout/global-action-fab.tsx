import { Award, Flag, Plus, Target, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

import { Sheet } from "@/components/ui/sheet";
import { LifeEventSheet } from "@/features/events/life-event-sheet";
import { GoalSheet } from "@/features/goals/goal-sheet";
import { ProgressSheet } from "@/features/goals/progress-sheet";
import { WinSheet } from "@/features/wins/win-sheet";
import { useAppStore } from "@/store/use-app-store";

type QuickAction = "win" | "goal" | "event" | "progress";

const quickActions: Array<{
  id: QuickAction;
  label: string;
  description: string;
  icon: typeof Award;
}> = [
  {
    id: "win",
    label: "Logro",
    description: "Registrar una victoria o hito reciente con peso real.",
    icon: Award,
  },
  {
    id: "goal",
    label: "Objetivo",
    description: "Añadir una meta anual o de largo plazo sin salir del flujo.",
    icon: Target,
  },
  {
    id: "event",
    label: "Evento",
    description: "Guardar un cambio de contexto dentro de la timeline.",
    icon: Flag,
  },
  {
    id: "progress",
    label: "Avance",
    description: "Sumar progreso a un goal activo desde cualquier pantalla.",
    icon: TrendingUp,
  },
];

export function GlobalActionFab() {
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [winOpen, setWinOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);

  const goals = useAppStore((state) => state.goals);
  const addGoal = useAppStore((state) => state.addGoal);
  const addWin = useAppStore((state) => state.addWin);
  const addLifeEvent = useAppStore((state) => state.addLifeEvent);
  const registerGoalProgress = useAppStore((state) => state.registerGoalProgress);

  const activeGoals = useMemo(
    () => goals.filter((goal) => goal.status === "active" || goal.status === "paused"),
    [goals],
  );

  const openActionSheet = (action: QuickAction) => {
    setActionMenuOpen(false);
    window.setTimeout(() => {
      if (action === "goal") setGoalOpen(true);
      if (action === "win") setWinOpen(true);
      if (action === "event") setEventOpen(true);
      if (action === "progress") setProgressOpen(true);
    }, 120);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setActionMenuOpen(true)}
        className="fixed bottom-[calc(5.6rem+env(safe-area-inset-bottom))] left-1/2 z-40 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] md:bottom-6 md:left-auto md:right-6 md:translate-x-0"
      >
        <Plus className="h-5 w-5" />
      </button>

      <Sheet
        open={actionMenuOpen}
        onClose={() => setActionMenuOpen(false)}
        title="Añadir"
        description="Acciones rápidas para mantener la app compacta y usable con pocos taps."
      >
        <div className="grid gap-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              type="button"
              disabled={action.id === "progress" && activeGoals.length === 0}
              onClick={() => openActionSheet(action.id)}
              className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition-all hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-primary">
                <action.icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold">{action.label}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {action.id === "progress" && activeGoals.length === 0
                    ? "Necesitas al menos un goal activo para registrar avance."
                    : action.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </Sheet>

      <GoalSheet open={goalOpen} onClose={() => setGoalOpen(false)} onSubmit={addGoal} />
      <WinSheet open={winOpen} onClose={() => setWinOpen(false)} onSubmit={addWin} />
      <LifeEventSheet open={eventOpen} onClose={() => setEventOpen(false)} onSubmit={addLifeEvent} />
      <ProgressSheet
        open={progressOpen}
        onClose={() => setProgressOpen(false)}
        goals={activeGoals}
        onSubmit={(values, goalId) => {
          if (!goalId) return;
          registerGoalProgress(goalId, values);
        }}
      />
    </>
  );
}
