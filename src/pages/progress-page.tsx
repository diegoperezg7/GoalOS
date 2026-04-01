import { ArrowUpRight, BrainCircuit, RefreshCcw, TrendingUp } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AIInsightCard } from "@/components/ai/ai-insight-card";
import { AIMonthlyReviewCard } from "@/components/ai/ai-monthly-review-card";
import { AIWeeklySummaryCard } from "@/components/ai/ai-weekly-summary-card";
import { EmptyStateCard } from "@/components/common/empty-state-card";
import { FinancialLadderPanel } from "@/components/finance/financial-ladder-panel";
import { FlipSimulationPanel } from "@/components/finance/flip-simulation-panel";
import { PageTransition } from "@/components/common/page-transition";
import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FINANCIAL_LADDER_GOAL_ID } from "@/data/financial-ladder";
import { getActivityHeatmap, getCategoryProgressData, getDashboardStats, getMonthlyProgressData } from "@/services/dashboard-service";
import { useAppStore } from "@/store/use-app-store";
import { formatPercent } from "@/utils/format";

function categoryLabel(value: string) {
  if (value === "carrera") return "Career";
  if (value === "finanzas") return "Finance";
  if (value === "projects") return "Projects";
  if (value === "salud") return "Health";
  return "Personal";
}

export function ProgressPage() {
  const navigate = useNavigate();
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
  const weeklySummary = useAppStore((state) => state.weeklySummary);
  const monthlyReview = useAppStore((state) => state.monthlyReview);
  const refreshAIInsights = useAppStore((state) => state.refreshAIInsights);
  const applyAIInsight = useAppStore((state) => state.applyAIInsight);
  const dismissAIInsight = useAppStore((state) => state.dismissAIInsight);
  const postponeAIInsight = useAppStore((state) => state.postponeAIInsight);

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

  const hasProgressContext =
    snapshot.goals.length > 0 ||
    snapshot.progressEntries.length > 0 ||
    snapshot.wins.length > 0 ||
    snapshot.lifeEvents.length > 0;

  useEffect(() => {
    if (hasProgressContext && (!weeklySummary || !monthlyReview)) {
      void refreshAIInsights();
    }
  }, [hasProgressContext, monthlyReview, refreshAIInsights, weeklySummary]);

  const stats = getDashboardStats(snapshot);
  const monthlyProgress = getMonthlyProgressData(snapshot);
  const categoryProgress = getCategoryProgressData(snapshot)
    .sort((left, right) => right.progress - left.progress)
    .slice(0, 4);
  const heatmap = getActivityHeatmap(snapshot);
  const financeGoal = goals.find((goal) => goal.id === FINANCIAL_LADDER_GOAL_ID);
  const financeMilestones = milestones.filter((milestone) => milestone.goalId === FINANCIAL_LADDER_GOAL_ID);
  const visibleInsights = aiInsights.filter(
    (insight) =>
      !insight.dismissed &&
      !insight.accepted &&
      (!insight.postponedUntil || insight.postponedUntil <= new Date().toISOString().slice(0, 10)),
  );
  const maxMonthlyProgress = Math.max(1, ...monthlyProgress.map((item) => item.progress));

  return (
    <PageTransition>
      <SectionHeading
        eyebrow="Progress"
        title="Financial Ladder, stats e insights en una sola vista"
        description="Todo lo que antes estaba fragmentado entre analytics, financial ladder e inbox IA ahora vive aquí."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Avance medio", value: formatPercent(stats.globalProgress), copy: "promedio de todos los goals activos y completados" },
          { label: "Progreso semanal", value: `${stats.weeklyProgress}`, copy: "puntos registrados en los últimos 7 días" },
          { label: "Milestones abiertos", value: `${stats.upcomingMilestones}`, copy: "siguientes checkpoints del sistema" },
          { label: "Timeline signals", value: `${stats.winsCount + snapshot.lifeEvents.length}`, copy: "wins y eventos ya integrados" },
        ].map((item) => (
          <Card key={item.label} className="p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold">{item.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.copy}</p>
          </Card>
        ))}
      </div>

      <FinancialLadderPanel goal={financeGoal} milestones={financeMilestones} />
      <FlipSimulationPanel />

      {!hasProgressContext ? (
        <EmptyStateCard
          icon={TrendingUp}
          eyebrow="Sin señales"
          title="Todavía no hay suficiente progreso para leer tendencia"
          description="En cuanto registres avances, wins o eventos, esta pestaña resumirá momentum, ladder e insights sin dispersarse en varias pantallas."
        />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <AIWeeklySummaryCard summary={weeklySummary} onRefresh={() => void refreshAIInsights()} />
            <AIMonthlyReviewCard review={monthlyReview} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Momentum</p>
                  <h3 className="mt-2 text-2xl font-semibold">Avance por mes</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Lectura rápida del movimiento reciente sin sacar otra pantalla de analytics.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {monthlyProgress.map((item) => (
                  <div key={item.month} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{item.month}</span>
                      <span className="text-muted-foreground">{item.progress}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-400 to-amber-300"
                        style={{ width: `${Math.max(4, (item.progress / maxMonthlyProgress) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 sm:p-6">
              <p className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Areas</p>
              <h3 className="mt-2 text-2xl font-semibold">Dónde estás avanzando más</h3>
              <p className="mt-1 text-sm text-muted-foreground">Goals anuales y de largo plazo resumidos por categoría.</p>

              <div className="mt-5 grid gap-3">
                {categoryProgress.map((item) => (
                  <div key={item.category} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{categoryLabel(item.category)}</span>
                      <span className="text-muted-foreground">{item.progress}%</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, item.progress)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="p-5 sm:p-6">
            <p className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Activity</p>
            <h3 className="mt-2 text-2xl font-semibold">Heatmap compacta</h3>
            <p className="mt-1 text-sm text-muted-foreground">Densidad reciente de actividad sin abrir una vista analítica separada.</p>

            <div className="mt-5 grid grid-cols-7 gap-1 sm:gap-1.5 sm:grid-cols-14 lg:grid-cols-21 xl:grid-cols-28">
              {heatmap.map((cell) => (
                <div
                  key={cell.date}
                  title={`${cell.date}: ${cell.value}`}
                  className={[
                    "aspect-square rounded-xl border border-white/8",
                    cell.value >= 3
                      ? "bg-teal-400/70"
                      : cell.value === 2
                        ? "bg-teal-400/45"
                        : cell.value === 1
                          ? "bg-teal-400/20"
                          : "bg-white/[0.03]",
                  ].join(" ")}
                />
              ))}
            </div>
          </Card>

          <div className="grid gap-4">
            {visibleInsights.length ? (
              visibleInsights.slice(0, 4).map((insight) => (
                <AIInsightCard
                  key={insight.id}
                  insight={insight}
                  onAccept={insight.actionsSuggested.some((action) => action.kind === "accept") ? () => applyAIInsight(insight.id) : undefined}
                  onDismiss={() => dismissAIInsight(insight.id)}
                  onPostpone={() => postponeAIInsight(insight.id)}
                  onOpen={
                    insight.relatedEntityType === "goal" && insight.relatedEntityId
                      ? () => navigate(`/goals/${insight.relatedEntityId}`)
                      : undefined
                  }
                />
              ))
            ) : (
              <Card className="p-5 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-primary">
                    <BrainCircuit className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Sin insights pendientes</p>
                    <p className="mt-1 leading-relaxed">
                      Esta pestaña concentrará aquí las recomendaciones importantes. Cuando haya nuevas señales puedes refrescar la lectura.
                    </p>
                  </div>
                </div>
                <Button variant="secondary" className="mt-4 gap-2" onClick={() => void refreshAIInsights()}>
                  <RefreshCcw className="h-4 w-4" />
                  Regenerar lectura
                </Button>
              </Card>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/timeline">
              <Button variant="outline" className="gap-2">
                <ArrowUpRight className="h-4 w-4" />
                Ver timeline completa
              </Button>
            </Link>
            <Link to="/goals">
              <Button variant="secondary" className="gap-2">
                <ArrowUpRight className="h-4 w-4" />
                Revisar goals
              </Button>
            </Link>
          </div>
        </>
      )}
    </PageTransition>
  );
}
