import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, ListTodo, Plus, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useParams } from "react-router-dom";
import { z } from "zod";

import { AIActionBar } from "@/components/ai/ai-action-bar";
import { AIGenerateMilestonesModal } from "@/components/ai/ai-generate-milestones-modal";
import { AIInsightCard } from "@/components/ai/ai-insight-card";
import { AIRefineButton } from "@/components/ai/ai-refine-button";
import { AchievementCard } from "@/components/achievements/achievement-card";
import { PageTransition } from "@/components/common/page-transition";
import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { WinCard } from "@/components/wins/win-card";
import { ProgressSheet } from "@/features/goals/progress-sheet";
import type { MilestoneSuggestionResult } from "@/services/ai/ai-types";
import { useAppStore } from "@/store/use-app-store";
import { formatLongDate } from "@/utils/date";
import { getIcon } from "@/utils/icon-map";

const milestoneSchema = z.object({
  title: z.string().min(3),
  dueDate: z.string().min(4),
  description: z.string().optional(),
});

const taskSchema = z.object({
  title: z.string().min(3),
  dueDate: z.string().optional(),
});

type MilestoneValues = z.infer<typeof milestoneSchema>;
type TaskValues = z.infer<typeof taskSchema>;

export function GoalDetailPage() {
  const { goalId } = useParams();
  const [progressOpen, setProgressOpen] = useState(false);
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [milestoneSuggestion, setMilestoneSuggestion] = useState<MilestoneSuggestionResult | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const goals = useAppStore((state) => state.goals);
  const allMilestones = useAppStore((state) => state.milestones);
  const allTasks = useAppStore((state) => state.tasks);
  const allProgressEntries = useAppStore((state) => state.progressEntries);
  const allWins = useAppStore((state) => state.wins);
  const allAchievements = useAppStore((state) => state.achievements);
  const allAIInsights = useAppStore((state) => state.aiInsights);
  const addMilestone = useAppStore((state) => state.addMilestone);
  const addTask = useAppStore((state) => state.addTask);
  const toggleMilestone = useAppStore((state) => state.toggleMilestone);
  const toggleTask = useAppStore((state) => state.toggleTask);
  const completeGoal = useAppStore((state) => state.completeGoal);
  const registerGoalProgress = useAppStore((state) => state.registerGoalProgress);
  const generateGoalRefinement = useAppStore((state) => state.generateGoalRefinement);
  const generateGoalMilestones = useAppStore((state) => state.generateGoalMilestones);
  const detectGoalStagnation = useAppStore((state) => state.detectGoalStagnation);
  const applyAIInsight = useAppStore((state) => state.applyAIInsight);
  const dismissAIInsight = useAppStore((state) => state.dismissAIInsight);
  const postponeAIInsight = useAppStore((state) => state.postponeAIInsight);

  const goal = useMemo(() => goals.find((item) => item.id === goalId), [goalId, goals]);
  const milestones = useMemo(() => allMilestones.filter((item) => item.goalId === goalId), [allMilestones, goalId]);
  const tasks = useMemo(() => allTasks.filter((item) => item.goalId === goalId), [allTasks, goalId]);
  const progressEntries = useMemo(
    () => allProgressEntries.filter((item) => item.goalId === goalId),
    [allProgressEntries, goalId],
  );
  const wins = useMemo(() => allWins.filter((item) => item.relatedGoalId === goalId), [allWins, goalId]);
  const achievements = useMemo(
    () => allAchievements.filter((item) => item.relatedGoalId === goalId),
    [allAchievements, goalId],
  );
  const aiInsights = useMemo(
    () =>
      allAIInsights.filter(
        (item) =>
          item.relatedEntityId === goalId &&
          !item.dismissed &&
          (!item.postponedUntil || item.postponedUntil <= new Date().toISOString().slice(0, 10)),
      ),
    [allAIInsights, goalId],
  );

  const milestoneForm = useForm<MilestoneValues>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: "",
      dueDate: "",
      description: "",
    },
  });

  const taskForm = useForm<TaskValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      dueDate: "",
    },
  });

  const stagnationInsight = useMemo(
    () => aiInsights.find((item) => item.type === "stagnation"),
    [aiInsights],
  );

  if (!goal) {
    return <Navigate to="/goals" replace />;
  }

  const Icon = getIcon(goal.icon);

  return (
    <PageTransition>
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden p-5 sm:p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-white/6 via-transparent to-primary/10" />
          <div className="relative space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="inline-flex rounded-2xl border border-white/10 bg-white/6 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-3xl font-semibold">{goal.title}</h2>
                    <Badge variant={goal.status === "completed" ? "success" : "default"}>{goal.status}</Badge>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{goal.description}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="secondary" onClick={() => setProgressOpen(true)}>
                  Registrar progreso
                </Button>
                <Button variant="accent" onClick={() => completeGoal(goal.id)}>
                  Completar
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Motivación</p>
                <p className="mt-2 text-sm text-foreground/90">{goal.motivation}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Why it matters</p>
                <p className="mt-2 text-sm text-foreground/90">{goal.whyItMatters}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Inicio</p>
                <p className="mt-2 text-sm text-foreground/90">{formatLongDate(goal.startDate)}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Meta</p>
                <p className="mt-2 text-sm text-foreground/90">{formatLongDate(goal.targetDate)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Progreso</p>
                <p className="text-lg font-semibold">{goal.progress}%</p>
              </div>
              <Progress value={goal.progress} className="h-3" />
            </div>
          </div>
        </Card>

        <AIActionBar
          title="Acciones IA para este goal"
          description="Refina redacción, sugiere milestones, detecta estancamiento y propone el siguiente paso."
          actions={
            <>
              <AIRefineButton
                onClick={() => {
                  void generateGoalRefinement(goal.id);
                }}
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  void generateGoalMilestones(goal.id).then((result) => {
                    if (result) {
                      setMilestoneSuggestion(result);
                      setMilestoneModalOpen(true);
                    }
                  });
                }}
              >
                <Sparkles className="h-4 w-4" />
                Sugerir milestones
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  void detectGoalStagnation(goal.id);
                }}
              >
                Detectar estancamiento
              </Button>
            </>
          }
        />
      </section>

      {stagnationInsight ? (
        <AIInsightCard
          insight={stagnationInsight}
          onDismiss={() => dismissAIInsight(stagnationInsight.id)}
          onPostpone={() => postponeAIInsight(stagnationInsight.id)}
        />
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card className="p-5">
          <SectionHeading
            eyebrow="Milestones"
            title="Hitos"
            description="Puntos de control visibles entre la intención y el resultado."
          />
          <form
            className="mt-4 grid gap-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4"
            onSubmit={milestoneForm.handleSubmit((values) => {
              addMilestone(goal.id, values);
              milestoneForm.reset();
            })}
          >
            <Input placeholder="Nuevo hito" {...milestoneForm.register("title")} />
            <Input type="date" {...milestoneForm.register("dueDate")} />
            <Textarea className="min-h-[80px]" placeholder="Descripción opcional" {...milestoneForm.register("description")} />
            <Button type="submit" className="justify-self-start">
              <Plus className="h-4 w-4" />
              Añadir hito
            </Button>
          </form>
          <div className="mt-4 grid gap-3">
            {milestones.map((milestone) => (
              <motion.button
                key={milestone.id}
                onClick={() => toggleMilestone(milestone.id)}
                className={[
                  "rounded-[24px] border p-4 text-left transition-all",
                  milestone.completed ? "border-emerald-400/20 bg-emerald-400/10" : "border-white/10 bg-white/[0.03]",
                ].join(" ")}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className={milestone.completed ? "h-5 w-5 text-emerald-300" : "h-5 w-5 text-muted-foreground"} />
                  <div>
                    <p className="font-medium">{milestone.title}</p>
                    {milestone.description ? <p className="mt-1 text-sm text-muted-foreground">{milestone.description}</p> : null}
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">{formatLongDate(milestone.dueDate)}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeading
            eyebrow="Tasks"
            title="Tareas"
            description="Micro-ejecución conectada a tu objetivo."
          />
          <form
            className="mt-4 grid gap-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4"
            onSubmit={taskForm.handleSubmit((values) => {
              addTask(goal.id, {
                title: values.title,
                dueDate: values.dueDate || undefined,
                priority: "medium",
              });
              taskForm.reset();
            })}
          >
            <Input placeholder="Nueva tarea" {...taskForm.register("title")} />
            <Input type="date" {...taskForm.register("dueDate")} />
            <Button type="submit" className="justify-self-start">
              <Plus className="h-4 w-4" />
              Añadir tarea
            </Button>
          </form>
          <div className="mt-4 grid gap-3">
            {tasks.map((task) => (
              <motion.button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={[
                  "rounded-[24px] border p-4 text-left transition-all",
                  task.completed ? "border-primary/20 bg-primary/10" : "border-white/10 bg-white/[0.03]",
                ].join(" ")}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
              >
                <div className="inline-flex items-center gap-3">
                  <ListTodo className={task.completed ? "h-5 w-5 text-primary" : "h-5 w-5 text-muted-foreground"} />
                  <div>
                    <p className="font-medium">{task.title}</p>
                    {task.dueDate ? <p className="mt-1 text-sm text-muted-foreground">{formatLongDate(task.dueDate)}</p> : null}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card className="p-5">
          <SectionHeading
            eyebrow="Related wins"
            title="Wins vinculados"
            description="Señales recientes que refuerzan el objetivo."
          />
          <div className="mt-4 grid gap-4">
            {wins.length ? wins.map((win) => <WinCard key={win.id} win={win} />) : <Card className="p-4 text-sm text-muted-foreground">Todavía no hay wins vinculados a este goal.</Card>}
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeading
            eyebrow="Related achievements"
            title="Achievements"
            description="Reconocimiento vinculado al avance de este objetivo."
          />
          <div className="mt-4 grid gap-4">
            {achievements.length ? (
              achievements.map((achievement, index) => (
                <AchievementCard key={achievement.id} achievement={achievement} highlight={index === 0} />
              ))
            ) : (
              <Card className="p-4 text-sm text-muted-foreground">Todavía no hay achievements vinculados a este goal.</Card>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-5">
          <SectionHeading
            eyebrow="Timeline"
            title="Actividad reciente"
            description="Lo que has movido y cuándo se convirtió en progreso."
          />
          <div className="mt-4 grid gap-3">
            {progressEntries.map((entry) => (
              <div key={entry.id} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">+{entry.value}%</p>
                    <p className="mt-1 text-sm text-muted-foreground">{entry.note}</p>
                  </div>
                  <Badge variant="info">{formatLongDate(entry.date)}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeading
            eyebrow="AI inbox"
            title="Sugerencias para este goal"
            description="Acepta, pospone o descarta lo que la IA detecta aquí."
          />
          <div className="mt-4 grid gap-4">
            {aiInsights.length ? (
              aiInsights.map((insight) => (
                <AIInsightCard
                  key={insight.id}
                  insight={insight}
                  onAccept={insight.actionsSuggested.some((action) => action.kind === "accept") ? () => applyAIInsight(insight.id) : undefined}
                  onDismiss={() => dismissAIInsight(insight.id)}
                  onPostpone={() => postponeAIInsight(insight.id)}
                />
              ))
            ) : (
              <Card className="p-4 text-sm text-muted-foreground">
                Genera una acción IA para crear aquí un inbox específico de este goal.
              </Card>
            )}
          </div>
        </Card>
      </section>

      <AIGenerateMilestonesModal
        open={milestoneModalOpen}
        onClose={() => setMilestoneModalOpen(false)}
        suggestion={milestoneSuggestion}
        onAddMilestone={(index) => {
          const item = milestoneSuggestion?.milestones[index];
          if (!item) return;
          addMilestone(goal.id, {
            title: item.title,
            description: item.description,
            dueDate: item.dueDate,
          });
        }}
      />

      <ProgressSheet
        open={progressOpen}
        onClose={() => setProgressOpen(false)}
        selectedGoalId={goal.id}
        onSubmit={(values) => registerGoalProgress(goal.id, values)}
      />
    </PageTransition>
  );
}
