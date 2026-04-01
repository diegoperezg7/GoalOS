import { useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  FLIP_MILESTONES,
  SCENARIOS,
  formatEur,
  formatMonths,
  runScenario,
  type ScenarioResult,
} from "@/data/flip-simulation";

const CURRENT_CAPITAL = 7_800;
const START_AGE = 21;

const COMPARISON_LEVELS = [32_000, 64_000, 128_000, 256_000, 512_000, 1_024_000] as const;

function ScenarioTable({ result }: { result: ScenarioResult }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <th className="pb-2 pr-4">Flip</th>
            <th className="pb-2 pr-4">Objetivo</th>
            <th className="pb-2 pr-4">Tiempo</th>
            <th className="pb-2 pr-4">Edad</th>
            <th className="pb-2 pr-4 hidden sm:table-cell">Ahorro acum.</th>
            <th className="pb-2 hidden sm:table-cell">Rentabilidad acum.</th>
          </tr>
        </thead>
        <tbody>
          {FLIP_MILESTONES.map((level, index) => {
            const flip = result.flips.find((f) => f.level === level);
            const isDone = flip && flip.monthsFromNow === 0;
            const isNext = !isDone && result.flips.filter((f) => f.monthsFromNow === 0).length === index;
            return (
              <tr
                key={level}
                className={cn(
                  "border-b border-white/[0.05] transition-colors",
                  isDone ? "opacity-50" : "",
                  isNext ? "bg-amber-400/5" : "",
                )}
              >
                <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">#{index + 1}</td>
                <td className="py-2.5 pr-4 font-semibold">{formatEur(level)}</td>
                <td className={cn("py-2.5 pr-4", isDone ? "text-emerald-400" : "")}>
                  {flip ? formatMonths(flip.monthsFromNow) : "—"}
                </td>
                <td className="py-2.5 pr-4 text-muted-foreground">
                  {flip ? `${flip.age.toFixed(1)} años` : "—"}
                </td>
                <td className="py-2.5 pr-4 text-muted-foreground hidden sm:table-cell">
                  {flip && flip.monthsFromNow > 0 ? formatEur(flip.savingsContribution) : "—"}
                </td>
                <td className="py-2.5 text-emerald-400/80 hidden sm:table-cell">
                  {flip && flip.returnsContribution > 100 ? `+${formatEur(flip.returnsContribution)}` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function FlipSimulationPanel({ className }: { className?: string }) {
  const [activeScenario, setActiveScenario] = useState<"conservador" | "realista" | "optimista">("realista");
  const [showComparison, setShowComparison] = useState(false);

  const results = useMemo(
    () => SCENARIOS.map((s) => runScenario(s, CURRENT_CAPITAL, START_AGE)),
    [],
  );

  const activeResult = results.find((r) => r.scenario.id === activeScenario)!;

  return (
    <Card className={cn("overflow-hidden p-0", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_30%)]" />
      <div className="relative space-y-5 p-4 sm:p-6">

        {/* Header */}
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.28em] text-primary/80">Simulación</p>
          <h3 className="text-2xl font-semibold">Proyección de Flips</h3>
          <p className="text-sm text-muted-foreground">
            Simulación mes a mes con salario creciente, gasto variable y rentabilidad compuesta.
            Capital inicial: {formatEur(CURRENT_CAPITAL)}.
          </p>
        </div>

        {/* Why linear is wrong */}
        <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground space-y-2">
          <p className="font-medium text-foreground/90">Por qué una proyección lineal es engañosa</p>
          <p>
            Una proyección de "ahorras X€/mes para siempre" asume salario fijo, gasto fijo y sin rentabilidad.
            En realidad, los primeros flips son los más lentos porque el capital base es pequeño y los
            incrementos de patrimonio mínimos. A partir del flip 5-6, tres efectos se combinan:
          </p>
          <ul className="space-y-1 list-none pl-0">
            <li className="flex gap-2"><span className="text-primary/70">→</span><span><strong className="text-foreground/80">Salario crece</strong> — más ahorro mensual disponible</span></li>
            <li className="flex gap-2"><span className="text-amber-400/70">→</span><span><strong className="text-foreground/80">Capital genera rentabilidad</strong> — los euros trabajan solos</span></li>
            <li className="flex gap-2"><span className="text-emerald-400/70">→</span><span><strong className="text-foreground/80">Compounding</strong> — la rentabilidad se aplica sobre una base cada vez mayor</span></li>
          </ul>
        </div>

        {/* Scenario selector */}
        <div className="flex gap-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveScenario(s.id)}
              className={cn(
                "rounded-2xl border px-4 py-2 text-sm transition-all",
                activeScenario === s.id
                  ? "border-white/20 bg-white/10 text-foreground"
                  : "border-white/10 bg-transparent text-muted-foreground hover:bg-white/[0.05]",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Active scenario description */}
        <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
          <p className={cn("text-xs font-semibold uppercase tracking-widest mb-3", activeResult.scenario.color)}>
            {activeResult.scenario.label}
          </p>
          <p className="text-sm text-muted-foreground mb-4">{activeResult.scenario.description}</p>

          {/* Salary path */}
          <div className="flex flex-wrap gap-2">
            {activeResult.scenario.salaryPath.map((stage, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs">
                <span className="text-muted-foreground">
                  {stage.fromMonth === 0 ? "Ahora" : `+${Math.round(stage.fromMonth / 12)}a`}
                </span>
                <span className="ml-2 font-medium text-foreground/90">{stage.monthlyNet.toLocaleString("es-ES")}€/mes</span>
              </div>
            ))}
            {activeResult.scenario.annualReturnRate > 0 && (
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300">
                {(activeResult.scenario.annualReturnRate * 100).toFixed(0)}% rentabilidad anual
              </div>
            )}
          </div>
        </div>

        {/* Scenario table */}
        <ScenarioTable result={activeResult} />

        {/* Key milestones callout */}
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              label: "Flip más importante",
              desc: "16k → 32k",
              note: "Aquí termina la etapa de supervivencia. Puedes invertir con criterio y el ahorro empieza a no ser la única fuente.",
            },
            {
              label: "Punto de aceleración",
              desc: "64k – 128k",
              note: "La rentabilidad del capital empieza a aportar un ahorro mensual relevante. Los flips se empiezan a acelerar de verdad.",
            },
            {
              label: "Máxima incertidumbre",
              desc: "128k+",
              note: "Aquí influyen salario, inversión, decisiones de vida grandes (vivienda, mudanza). Muy difícil de predecir, muy alto el upside.",
            },
          ].map((item) => (
            <div key={item.label} className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-lg font-semibold">{item.desc}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.note}</p>
            </div>
          ))}
        </div>

        {/* Comparison toggle */}
        <button
          onClick={() => setShowComparison((v) => !v)}
          className="text-xs text-primary/60 hover:text-primary/90 transition-colors uppercase tracking-[0.2em]"
        >
          {showComparison ? "▲ ocultar" : "▼ ver"} comparativa entre escenarios
        </button>

        {showComparison && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <th className="pb-2 pr-4">Flip</th>
                  {SCENARIOS.map((s) => (
                    <th key={s.id} className={cn("pb-2 pr-4", s.color)}>{s.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_LEVELS.map((level) => (
                  <tr key={level} className="border-b border-white/[0.05]">
                    <td className="py-2.5 pr-4 font-semibold">{formatEur(level)}</td>
                    {results.map((r) => {
                      const flip = r.flips.find((f) => f.level === level);
                      return (
                        <td key={r.scenario.id} className="py-2.5 pr-4 text-muted-foreground">
                          {flip ? (
                            <span>
                              {formatMonths(flip.monthsFromNow)}{" "}
                              <span className="text-xs opacity-60">({flip.age.toFixed(0)}a)</span>
                            </span>
                          ) : "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Priorities */}
        <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4 space-y-3">
          <p className="text-sm font-medium">Qué priorizar ahora mismo</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            {[
              ["🥇 Aumentar salario", "Es la variable de mayor impacto. Un salto de 2.1k → 3.5k/mes netos acorta los flips 3-5 más que cualquier otra acción."],
              ["🥈 Mantener ahorro alto", "El 80%+ de ahorro actual es excepcional. No lo normalices hacia abajo. Cada euro de gasto extra son 2 euros de patrimonio perdido."],
              ["🥉 Empezar a invertir (sin prisa)", "Con 16k+ tiene sentido. No antes. El coste de oportunidad de esperar es menor que el riesgo de invertir sin entender lo que haces."],
              ["⚠️ Evitar lifestyle inflation", "El mayor destructor silencioso. Pasar de 400 a 800€/mes de gasto significa ~5 años extra para los últimos flips."],
              ["❌ No obsesionarse con la fecha de 1M", "La fecha de llegada a 1M depende principalmente de lo que pase con tu salario en los próximos 5 años. Eso aún no se puede saber."],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-3">
                <span className="shrink-0">{title?.split(" ")[0]}</span>
                <div>
                  <span className="font-medium text-foreground/80">{title?.split(" ").slice(1).join(" ")}</span>
                  <span className="block text-xs mt-0.5">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Card>
  );
}
