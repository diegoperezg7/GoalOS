import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { colorOptions, focusAreaOptions } from "@/data/options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { aiService } from "@/services/ai/ai-service";
import type { GoalPlan } from "@/types";
import { useAppStore } from "@/store/use-app-store";

const steps = ["Bienvenida", "Visión libre", "Estructura AI", "Entrar"];

export function OnboardingFlow() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const [step, setStep] = useState(0);
  const [name, setName] = useState(user.name || "");
  const [vision, setVision] = useState("");
  const [focusAreas, setFocusAreas] = useState<string[]>(["carrera", "finanzas"]);
  const [plan, setPlan] = useState<GoalPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const sharedClass = "grid gap-5 rounded-[24px] border border-white/10 bg-slate-950/45 p-4 shadow-card sm:gap-6 sm:rounded-[32px] sm:p-6";
  const progress = ((step + 1) / steps.length) * 100;

  async function generatePlan() {
    if (!vision.trim()) return;
    setPlanError(null);
    setLoadingPlan(true);
    try {
      const nextPlan = await aiService.generateGoalPlan({
        note: vision,
        focusAreas,
        timeframeHint: "90_days",
      });
      setPlan(nextPlan);
      setStep(2);
    } catch (error) {
      setPlanError(error instanceof Error ? error.message : "No se pudo generar la propuesta inicial.");
    } finally {
      setLoadingPlan(false);
    }
  }

  useEffect(() => {
    if (!name && user.name) {
      setName(user.name);
    }
  }, [name, user.name]);

  return (
    <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-3 px-2.5 py-2.5 sm:gap-4 sm:px-4 sm:py-4 md:grid-cols-[1.05fr_0.95fr] md:gap-6 md:px-6 md:py-6">
      <div className={`${sharedClass} subtle-grid overflow-hidden`}>
        <div className="space-y-5 sm:space-y-6">
          <div className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 sm:rounded-2xl sm:px-4">
            <img src="/goalos-mark.svg" alt="GoalOS" className="h-16 w-16 shrink-0 drop-shadow-[0_0_30px_rgba(34,211,238,0.32)]" />
            <div>
              <p className="font-display text-base font-semibold sm:text-lg">GoalOS</p>
              <p className="text-[13px] text-muted-foreground sm:text-sm">AI-first personal operating system</p>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-primary/80 sm:text-xs sm:tracking-[0.34em]">Onboarding</p>
            <h1 className="max-w-xl text-3xl font-semibold text-balance sm:text-4xl md:text-5xl">
              La app debería entender qué quieres construir antes de pedirte estructura.
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              Describe tu situación y la IA propondrá un primer goal sólido, milestones iniciales y un hábito semilla.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              "Goals con narrativa y why it matters",
              "Quick capture para ideas, wins y life events",
              "Insights accionables en dashboard y analytics",
            ].map((item) => (
              <div key={item} className="rounded-[20px] border border-white/10 bg-white/[0.03] p-3.5 text-[13px] leading-relaxed text-muted-foreground sm:rounded-[24px] sm:p-4 sm:text-sm">
                {item}
              </div>
            ))}
          </div>

          <div className="rounded-[22px] border border-white/10 bg-gradient-to-br from-white/8 via-transparent to-primary/10 p-4 sm:rounded-[28px] sm:p-5">
            <p className="text-[13px] text-muted-foreground sm:text-sm">Progreso de setup</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
              <div className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {steps.map((label, index) => (
                <div
                  key={label}
                  className={[
                    "rounded-full border px-2.5 py-1.5 text-[10px] uppercase tracking-[0.14em] sm:px-3 sm:text-xs sm:tracking-[0.18em]",
                    index <= step
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-white/10 bg-white/[0.03] text-muted-foreground",
                  ].join(" ")}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={sharedClass}>
        <div className="flex h-full flex-col">
          <div className="flex-1 space-y-5 sm:space-y-6">
            {step === 0 ? (
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-primary/80 sm:text-xs sm:tracking-[0.32em]">Bienvenida</p>
                <h2 className="text-2xl font-semibold sm:text-3xl">Primero intención, después estructura.</h2>
                <p className="text-[13px] leading-relaxed text-muted-foreground sm:text-base">
                  En vez de obligarte a rellenar un goal completo, la IA te ayudará a aterrizarlo.
                </p>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-primary/80 sm:text-xs sm:tracking-[0.32em]">Visión libre</p>
                <label className="space-y-2 text-sm">
                  <span className="text-muted-foreground">Cómo quieres que te llame la app</span>
                  <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Tu nombre" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-muted-foreground">Qué quieres construir o cambiar</span>
                  <Textarea
                    value={vision}
                    onChange={(event) => setVision(event.target.value)}
                    className="min-h-[140px]"
                    placeholder="Describe el cambio, el objetivo o la etapa que quieres ordenar."
                  />
                </label>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Áreas prioritarias</span>
                  <div className="grid grid-cols-2 gap-3">
                    {focusAreaOptions.map((area) => {
                      const selected = focusAreas.includes(area);
                      return (
                        <button
                          key={area}
                          type="button"
                          onClick={() =>
                            setFocusAreas((current) =>
                              selected ? current.filter((item) => item !== area) : [...current, area],
                            )
                          }
                          className={[
                            "rounded-[18px] border px-3 py-3 text-left text-[13px] transition-all sm:rounded-[24px] sm:px-4 sm:py-4 sm:text-sm",
                            selected
                              ? "border-primary/30 bg-primary/10 text-foreground"
                              : "border-white/10 bg-white/[0.03] text-muted-foreground",
                          ].join(" ")}
                        >
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}

            {step >= 2 ? (
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-primary/80 sm:text-xs sm:tracking-[0.32em]">Estructura generada</p>
                <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-3.5 sm:rounded-[24px] sm:p-4">
                  <p className="text-[13px] leading-relaxed text-muted-foreground sm:text-sm">{plan?.summary ?? "Genera primero una propuesta AI."}</p>
                </div>
                <label className="space-y-2 text-sm">
                  <span className="text-muted-foreground">Título del goal</span>
                  <Input
                    value={plan?.goal.title ?? ""}
                    onChange={(event) =>
                      setPlan((current) =>
                        current ? { ...current, goal: { ...current.goal, title: event.target.value } } : current,
                      )
                    }
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-muted-foreground">Descripción</span>
                  <Textarea
                    value={plan?.goal.description ?? ""}
                    onChange={(event) =>
                      setPlan((current) =>
                        current ? { ...current, goal: { ...current.goal, description: event.target.value } } : current,
                      )
                    }
                  />
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="text-muted-foreground">Categoría</span>
                    <Input
                      value={plan?.goal.category ?? ""}
                      onChange={(event) =>
                        setPlan((current) =>
                          current ? { ...current, goal: { ...current.goal, category: event.target.value } } : current,
                        )
                      }
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="text-muted-foreground">Fecha objetivo</span>
                    <Input
                      type="date"
                      value={plan?.goal.targetDate ?? ""}
                      onChange={(event) =>
                        setPlan((current) =>
                          current ? { ...current, goal: { ...current.goal, targetDate: event.target.value } } : current,
                        )
                      }
                    />
                  </label>
                </div>
                <label className="space-y-2 text-sm">
                  <span className="text-muted-foreground">Why it matters</span>
                  <Textarea
                    value={plan?.goal.whyItMatters ?? ""}
                    onChange={(event) =>
                      setPlan((current) =>
                        current ? { ...current, goal: { ...current.goal, whyItMatters: event.target.value } } : current,
                      )
                    }
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-muted-foreground">Color</span>
                  <Select
                    value={plan?.goal.color ?? "aqua"}
                    onChange={(event) =>
                      setPlan((current) =>
                        current ? { ...current, goal: { ...current.goal, color: event.target.value as GoalPlan["goal"]["color"] } } : current,
                      )
                    }
                  >
                    {colorOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </label>
                <div className="rounded-[20px] border border-white/10 bg-slate-950/35 p-3.5 sm:rounded-[24px] sm:p-4">
                  <p className="text-[13px] font-medium sm:text-sm">Milestones iniciales</p>
                  <div className="mt-3 grid gap-2">
                    {plan?.milestones.map((milestone) => (
                      <div key={`${milestone.title}-${milestone.dueDate}`} className="rounded-xl border border-white/10 px-3 py-2.5 text-[13px] text-muted-foreground sm:rounded-2xl sm:py-3 sm:text-sm">
                        {milestone.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {planError ? (
              <div className="rounded-[24px] border border-danger/20 bg-danger/10 p-4 text-sm text-rose-100">
                {planError}
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="ghost" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0 || loadingPlan}>
              Atrás
            </Button>

            {step === 0 ? (
              <Button type="button" onClick={() => setStep(1)}>
                Empezar
              </Button>
            ) : null}

            {step === 1 ? (
              <Button
                type="button"
                className="gap-2"
                disabled={name.trim().length < 2 || vision.trim().length < 8 || loadingPlan}
                onClick={() => void generatePlan()}
              >
                <Sparkles className="h-4 w-4" />
                {loadingPlan ? "Generando estructura..." : "Generar con IA"}
              </Button>
            ) : null}

            {step >= 2 ? (
              <Button
                type="button"
                className="gap-2"
                disabled={!plan}
                onClick={() => {
                  if (!plan) return;
                  completeOnboarding({
                    name,
                    focusAreas,
                    firstGoal: plan.goal,
                    firstHabit:
                      plan.habit ?? {
                        title: "Bloque de claridad diaria",
                        category: plan.goal.category,
                        frequency: "daily",
                        target: 1,
                        color: plan.goal.color,
                        icon: "Sparkles",
                      },
                    initialMilestones: plan.milestones,
                  });
                  navigate("/");
                }}
              >
                Entrar en GoalOS
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
