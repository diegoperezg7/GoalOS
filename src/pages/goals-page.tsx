import { ArrowRight, Plus } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import { EmptyStateCard } from "@/components/common/empty-state-card";
import { GoalCard } from "@/components/goals/goal-card";
import { PageTransition } from "@/components/common/page-transition";
import { SectionHeading } from "@/components/common/section-heading";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/store/use-app-store";

const sections = [
  {
    id: "carrera",
    title: "Career",
    description: "Posicionamiento en IA, seniority y nuevas mejoras salariales.",
  },
  {
    id: "finanzas",
    title: "Finance",
    description: "Patrimonio, independencia financiera y sistema 11 Flips.",
  },
  {
    id: "projects",
    title: "Projects",
    description: "Ecosistema de apps útiles y construcción real de GoalOS.",
  },
  {
    id: "personal",
    title: "Personal",
    description: "Mejora diaria, salud mental, relaciones y salir de la zona de confort.",
  },
  {
    id: "salud",
    title: "Health",
    description: "Recuperar base física sostenible y energía para sostener el resto.",
  },
] as const;

const horizonCards = [
  {
    id: "near_term",
    label: "Próximo tramo",
    description: "Goals de 30 y 90 días para mover rápido el sistema.",
  },
  {
    id: "year",
    label: "Este año",
    description: "Metas anuales que ordenan 2026 con más coherencia.",
  },
  {
    id: "long_term",
    label: "Largo plazo",
    description: "Direcciones de compounding que no viven en otra pantalla.",
  },
] as const;

export function GoalsPage() {
  const goals = useAppStore((state) => state.goals);
  const milestones = useAppStore((state) => state.milestones);

  const groupedGoals = useMemo(
    () => {
      const sectionIds = new Set<string>(sections.map((section) => section.id));
      const primaryGroups = sections
        .map((section) => ({
          ...section,
          goals: goals.filter((goal) => goal.category === section.id && goal.status !== "archived"),
        }))
        .filter((section) => section.goals.length > 0);

      const extraGroups = Object.entries(
        goals.reduce<Record<string, typeof goals>>((acc, goal) => {
          if (goal.status === "archived" || sectionIds.has(goal.category)) return acc;
          acc[goal.category] ??= [];
          acc[goal.category].push(goal);
          return acc;
        }, {}),
      ).map(([category, categoryGoals]) => ({
        id: category,
        title: category.charAt(0).toUpperCase() + category.slice(1),
        description: "Goals creados fuera de las categorías principales.",
        goals: categoryGoals,
      }));

      return [...primaryGroups, ...extraGroups];
    },
    [goals],
  );

  const activeGoals = goals.filter((goal) => goal.status === "active").length;
  const yearlyGoals = goals.filter((goal) => goal.status !== "archived" && goal.timeHorizon === "1_year").length;
  const longTermGoals = goals.filter((goal) => goal.status !== "archived" && goal.timeHorizon === "long_term").length;
  const nearTermGoals = goals.filter(
    (goal) => goal.status !== "archived" && (goal.timeHorizon === "30_days" || goal.timeHorizon === "90_days"),
  ).length;

  const milestoneCountByGoalId = useMemo(
    () =>
      milestones.reduce<Record<string, number>>((acc, milestone) => {
        acc[milestone.goalId] = (acc[milestone.goalId] ?? 0) + 1;
        return acc;
      }, {}),
    [milestones],
  );

  return (
    <PageTransition>
      <SectionHeading
        eyebrow="Goal map"
        title="Goals compactos, anuales y de largo plazo en un solo sitio"
        description="La estructura se reduce a una sola vista clara: qué mover ya, qué sostener este año y qué construir a largo plazo."
      />

      <div className="grid gap-4 lg:grid-cols-[1.04fr_0.96fr]">
        <Card className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] border border-white/10 bg-slate-950/55 p-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Goals activos</p>
              <p className="mt-2 text-2xl font-semibold">{activeGoals}</p>
              <p className="mt-1 text-sm text-muted-foreground">metas con foco real en la app</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-slate-950/55 p-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Este año</p>
              <p className="mt-2 text-2xl font-semibold">{yearlyGoals}</p>
              <p className="mt-1 text-sm text-muted-foreground">objetivos anuales visibles aquí mismo</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-slate-950/55 p-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Largo plazo</p>
              <p className="mt-2 text-2xl font-semibold">{longTermGoals}</p>
              <p className="mt-1 text-sm text-muted-foreground">direcciones de compounding integradas</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <p className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Uso rápido</p>
          <h3 className="mt-2 text-2xl font-semibold">Menos taps, menos ramas, más claridad</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Crear un nuevo objetivo ya no abre una sección extra. Usa el botón flotante global y vuelve aquí para ver todo el mapa completo.
          </p>
          <div className="mt-5 grid gap-3">
            {horizonCards.map((item) => {
              const value =
                item.id === "near_term"
                  ? nearTermGoals
                  : item.id === "year"
                    ? yearlyGoals
                    : longTermGoals;

              return (
                <div key={item.id} className="flex items-start justify-between gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="shrink-0 rounded-full border border-white/10 bg-slate-950/55 px-3 py-1.5 text-sm font-semibold">
                    {value}
                  </div>
                </div>
              );
            })}
          </div>
          <Link to="/progress" className="mt-5 inline-flex items-center gap-2 text-sm text-primary">
            Ver el progreso agregado
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>

      {groupedGoals.length ? (
        <div className="grid gap-5">
          {groupedGoals.map((section) => (
            <Card key={section.id} className="p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-primary/80">{section.title}</p>
                  <h3 className="text-2xl font-semibold">{section.description}</h3>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
                    90 días:{" "}
                    {section.goals.filter((goal) => goal.timeHorizon === "30_days" || goal.timeHorizon === "90_days").length}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
                    1 año: {section.goals.filter((goal) => goal.timeHorizon === "1_year").length}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
                    Largo plazo: {section.goals.filter((goal) => goal.timeHorizon === "long_term").length}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {section.goals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    milestoneCount={milestoneCountByGoalId[goal.id] ?? 0}
                    taskCount={0}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyStateCard
          icon={Plus}
          eyebrow="Sin goals"
          title="Todavía no hay dirección definida"
          description="Usa el botón flotante global para añadir un objetivo sin abrir nuevas secciones ni romper el flujo."
        />
      )}
    </PageTransition>
  );
}
