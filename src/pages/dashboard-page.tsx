import { ArrowRight, Compass, Goal, RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { AIInsightCard } from "@/components/ai/ai-insight-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoalCard } from "@/components/goals/goal-card";
import { LifeEventCard } from "@/components/events/life-event-card";
import { PageTransition } from "@/components/common/page-transition";
import { WinCard } from "@/components/wins/win-card";
import { getDashboardStats } from "@/services/dashboard-service";
import type { PrioritySuggestionResult } from "@/services/ai/ai-types";
import { useAppStore } from "@/store/use-app-store";
import { formatPercent } from "@/utils/format";

const priorityWeight = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
} as const;

export function DashboardPage() {
  const user = useAppStore((state) => state.user);
  const goals = useAppStore((state) => state.goals);
  const milestones = useAppStore((state) => state.milestones);
  const tasks = useAppStore((state) => state.tasks);
  const habits = useAppStore((state) => state.habits);
  const achievements = useAppStore((state) => state.achievements);
  const wins = useAppStore((state) => state.wins);
  const lifeEvents = useAppStore((state) => state.lifeEvents);
  const progressEntries = useAppStore((state) => state.progressEntries);
  const aiInsights = useAppStore((state) => state.aiInsights);

  const snapshot = useMemo(
    () => ({
      user,
      goals,
      milestones,
      tasks,
      habits,
      achievements,
      wins,
      lifeEvents,
      progressEntries,
      aiInsights,
    }),
    [achievements, aiInsights, goals, habits, lifeEvents, milestones, progressEntries, tasks, user, wins],
  );

  const stats = getDashboardStats(snapshot);
  const focusGoals = [...goals]
    .filter((goal) => goal.status === "active")
    .sort((left, right) => {
      const priorityDelta = priorityWeight[right.priority] - priorityWeight[left.priority];
      if (priorityDelta !== 0) return priorityDelta;
      return right.progress - left.progress;
    })
    .slice(0, 2);

  const recentSignals = useMemo(
    () =>
      [
        ...wins.map((win) => ({ type: "win" as const, date: win.date, data: win })),
        ...lifeEvents.map((event) => ({ type: "event" as const, date: event.date, data: event })),
      ]
        .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
        .slice(0, 3),
    [lifeEvents, wins],
  );

  const suggestGoalPriorities = useAppStore((state) => state.suggestGoalPriorities);
  const [dailyFocus, setDailyFocus] = useState<PrioritySuggestionResult | null>(null);
  const [loadingFocus, setLoadingFocus] = useState(false);

  const mainInsight = aiInsights.find(
    (insight) =>
      !insight.dismissed &&
      !insight.accepted &&
      (!insight.postponedUntil || insight.postponedUntil <= new Date().toISOString().slice(0, 10)),
  );

  return (
    <PageTransition>
      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="overflow-hidden p-5 sm:p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_26%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_36%)]" />
          <div className="relative space-y-5">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.28em] text-primary/80">Today</p>
              <h2 className="max-w-3xl text-2xl font-semibold text-balance sm:text-3xl md:text-4xl">
                {user.name}, la app se reduce a foco, trayectoria, goals y progreso. El resto vive integrado, no repartido.
              </h2>
              <p className="max-w-2xl text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                Tu historia 2024-2026, los goals activos y la ladder financiera ya están conectados. Desde aquí solo importa ver qué toca mover
                ahora.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Goals activos", value: `${stats.activeGoals}`, copy: "direcciones con foco real" },
                { label: "Progreso medio", value: formatPercent(stats.globalProgress), copy: "lectura rápida del sistema" },
                { label: "Signals", value: `${wins.length + lifeEvents.length}`, copy: "wins y eventos ya en timeline" },
              ].map((item) => (
                <div key={item.label} className="rounded-[22px] border border-white/10 bg-slate-950/55 p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.copy}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/goals">
                <Button className="gap-2">
                  <Goal className="h-4 w-4" />
                  Revisar goals
                </Button>
              </Link>
              <Link to="/timeline">
                <Button variant="outline" className="gap-2">
                  <Compass className="h-4 w-4" />
                  Abrir timeline
                </Button>
              </Link>
              <Link to="/progress">
                <Button variant="secondary" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Ver progress
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {mainInsight ? (
          <AIInsightCard insight={mainInsight} />
        ) : (
          <Card className="p-5 sm:p-6">
            <p className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Siguiente paso</p>
            <h3 className="mt-2 text-2xl font-semibold">La capa IA ya no vive aparte</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Cuando haya nuevas señales, los insights aparecerán aquí y en Progress. No hace falta entrar en una pantalla separada para verlos.
            </p>
            <Link to="/progress">
              <Button variant="ghost" className="mt-4 gap-2">
                Ir a Progress
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        )}
      </section>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Foco del día</p>
            <h3 className="text-xl font-semibold">¿Qué mover hoy?</h3>
            <p className="text-sm text-muted-foreground">La IA analiza tus goals y sugiere dónde poner la energía.</p>
          </div>
          {!dailyFocus && (
            <Button
              variant="secondary"
              size="sm"
              className="shrink-0 gap-2"
              disabled={loadingFocus}
              onClick={() => {
                setLoadingFocus(true);
                void suggestGoalPriorities()
                  .then((result) => setDailyFocus(result))
                  .finally(() => setLoadingFocus(false));
              }}
            >
              <Sparkles className="h-4 w-4" />
              {loadingFocus ? "Analizando..." : "Generar foco"}
            </Button>
          )}
        </div>
        {dailyFocus && (
          <div className="mt-4 rounded-[22px] border border-primary/20 bg-primary/8 p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Goal prioritario</p>
            <p className="mt-1 text-lg font-semibold">{dailyFocus.primaryGoalTitle ?? "Sin goal prioritario identificado"}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{dailyFocus.reason}</p>
            {dailyFocus.headline && (
              <p className="mt-3 text-xs italic text-muted-foreground/70">{dailyFocus.headline}</p>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 gap-2 text-muted-foreground"
              onClick={() => setDailyFocus(null)}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerar
            </Button>
          </div>
        )}
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Focus</p>
            <h3 className="text-2xl font-semibold">Goals prioritarios</h3>
            <p className="text-sm text-muted-foreground">Las dos metas que más condicionan el siguiente tramo.</p>
          </div>

          <div className="mt-5 grid gap-4">
            {focusGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                milestoneCount={milestones.filter((milestone) => milestone.goalId === goal.id).length}
                taskCount={tasks.filter((task) => task.goalId === goal.id && !task.completed).length}
              />
            ))}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Recent signals</p>
            <h3 className="text-2xl font-semibold">Lo último importante</h3>
            <p className="text-sm text-muted-foreground">Todo esto vive ya dentro de Timeline; aquí solo ves la versión compacta.</p>
          </div>

          <div className="mt-5 grid gap-4">
            {recentSignals.map((item) =>
              item.type === "win" ? (
                <WinCard key={item.data.id} win={item.data} />
              ) : (
                <LifeEventCard key={item.data.id} event={item.data} />
              ),
            )}
          </div>
        </Card>
      </section>
    </PageTransition>
  );
}
