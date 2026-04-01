/**
 * Flip Simulation Engine
 * Month-by-month simulation of patrimony growth across 3 scenarios.
 * Each scenario models salary growth, expenses, investment returns, and bonuses.
 */

export const FLIP_MILESTONES = [500, 1_000, 2_000, 4_000, 8_000, 16_000, 32_000, 64_000, 128_000, 256_000, 512_000, 1_024_000] as const;
export type FlipLevel = (typeof FLIP_MILESTONES)[number];

export interface SalaryStage {
  fromMonth: number; // months from simulation start
  monthlyNet: number;
}

export interface ExpenseStage {
  fromMonth: number;
  monthly: number;
}

export interface BonusEvent {
  atMonth: number; // one-time bonus injection
  amount: number;
}

export interface ScenarioConfig {
  id: "conservador" | "realista" | "optimista";
  label: string;
  color: string;
  salaryPath: SalaryStage[];
  expensePath: ExpenseStage[];
  annualReturnRate: number; // e.g. 0.05 = 5 % annual
  bonusEvents: BonusEvent[];
  description: string;
}

export interface FlipResult {
  level: FlipLevel;
  monthsFromNow: number;
  age: number;
  capitalAtFlip: number;
  savingsContribution: number;  // cumulative savings that got here
  returnsContribution: number;  // cumulative investment returns
}

export interface ScenarioResult {
  scenario: ScenarioConfig;
  flips: FlipResult[];
  /** monthly snapshots for the chart — sampled annually */
  annualSnapshots: Array<{
    year: number;
    age: number;
    capital: number;
    monthlySalary: number;
    monthlyExpenses: number;
  }>;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function getStageValue<T extends { fromMonth: number }>(
  stages: T[],
  month: number,
  getValue: (s: T) => number,
): number {
  const sorted = [...stages].sort((a, b) => a.fromMonth - b.fromMonth);
  let value = getValue(sorted[0]);
  for (const stage of sorted) {
    if (month >= stage.fromMonth) value = getValue(stage);
  }
  return value;
}

// ── Simulator ────────────────────────────────────────────────────────────────

export function runScenario(
  config: ScenarioConfig,
  initialCapital: number,
  startAge: number,
  maxYears = 40,
): ScenarioResult {
  let capital = initialCapital;
  let cumulativeSavings = 0;
  let cumulativeReturns = 0;

  const monthlyReturnRate = config.annualReturnRate / 12;
  const flips: FlipResult[] = [];
  const remainingMilestones = [...FLIP_MILESTONES].filter((m) => m > initialCapital);

  // Mark already-passed milestones instantly (month 0)
  for (const level of FLIP_MILESTONES) {
    if (level <= initialCapital) {
      flips.push({
        level,
        monthsFromNow: 0,
        age: startAge,
        capitalAtFlip: level,
        savingsContribution: 0,
        returnsContribution: 0,
      });
    }
  }

  const annualSnapshots: ScenarioResult["annualSnapshots"] = [];

  for (let month = 1; month <= maxYears * 12; month++) {
    const salary = getStageValue(config.salaryPath, month, (s) => s.monthlyNet);
    const expenses = getStageValue(config.expensePath, month, (s) => s.monthly);
    const monthlySavings = Math.max(0, salary - expenses);

    // Apply investment return on existing capital first
    const returnThisMonth = capital * monthlyReturnRate;
    cumulativeReturns += returnThisMonth;
    capital += returnThisMonth;

    // Then add savings
    capital += monthlySavings;
    cumulativeSavings += monthlySavings;

    // One-time bonuses
    for (const bonus of config.bonusEvents) {
      if (bonus.atMonth === month) {
        capital += bonus.amount;
        cumulativeSavings += bonus.amount;
      }
    }

    // Check milestones
    for (const level of [...remainingMilestones]) {
      if (capital >= level) {
        flips.push({
          level,
          monthsFromNow: month,
          age: startAge + month / 12,
          capitalAtFlip: capital,
          savingsContribution: cumulativeSavings,
          returnsContribution: cumulativeReturns,
        });
        remainingMilestones.splice(remainingMilestones.indexOf(level), 1);
      }
    }

    // Annual snapshot (every 12 months)
    if (month % 12 === 0) {
      annualSnapshots.push({
        year: month / 12,
        age: startAge + month / 12,
        capital: Math.round(capital),
        monthlySalary: salary,
        monthlyExpenses: expenses,
      });
    }

    if (remainingMilestones.length === 0) break;
  }

  return { scenario: config, flips, annualSnapshots };
}

// ── Scenario Definitions ─────────────────────────────────────────────────────

export const SCENARIOS: ScenarioConfig[] = [
  {
    id: "conservador",
    label: "Conservador",
    color: "text-sky-300",
    description: "Progresión salarial lenta, sin bonus, sin inversión. El suelo.",
    annualReturnRate: 0,
    salaryPath: [
      { fromMonth: 0, monthlyNet: 2_100 },
      { fromMonth: 24, monthlyNet: 2_400 },
      { fromMonth: 48, monthlyNet: 2_700 },
      { fromMonth: 84, monthlyNet: 3_000 },
      { fromMonth: 120, monthlyNet: 3_300 },
    ],
    expensePath: [
      { fromMonth: 0, monthly: 400 },
    ],
    bonusEvents: [],
  },
  {
    id: "realista",
    label: "Realista",
    color: "text-emerald-300",
    description: "Carrera AI sólida, ahorro alto, rentabilidad moderada del capital.",
    annualReturnRate: 0.05,
    salaryPath: [
      { fromMonth: 0, monthlyNet: 2_100 },
      { fromMonth: 18, monthlyNet: 2_900 },
      { fromMonth: 36, monthlyNet: 3_700 },
      { fromMonth: 60, monthlyNet: 4_700 },
      { fromMonth: 96, monthlyNet: 5_500 },
      { fromMonth: 144, monthlyNet: 6_500 },
    ],
    expensePath: [
      { fromMonth: 0, monthly: 400 },
      { fromMonth: 36, monthly: 500 },
      { fromMonth: 72, monthly: 600 },
    ],
    bonusEvents: [
      { atMonth: 18, amount: 1_500 },
      { atMonth: 30, amount: 1_500 },
      { atMonth: 42, amount: 2_000 },
      { atMonth: 54, amount: 2_000 },
      { atMonth: 66, amount: 2_500 },
      { atMonth: 78, amount: 2_500 },
      { atMonth: 90, amount: 3_000 },
    ],
  },
  {
    id: "optimista",
    label: "Optimista",
    color: "text-amber-300",
    description: "Salto a salarios altos en AI, equity/bonus relevantes, inversión activa.",
    annualReturnRate: 0.07,
    salaryPath: [
      { fromMonth: 0, monthlyNet: 2_100 },
      { fromMonth: 12, monthlyNet: 3_500 },
      { fromMonth: 24, monthlyNet: 5_000 },
      { fromMonth: 48, monthlyNet: 6_500 },
      { fromMonth: 72, monthlyNet: 8_000 },
    ],
    expensePath: [
      { fromMonth: 0, monthly: 400 },
      { fromMonth: 24, monthly: 550 },
      { fromMonth: 60, monthly: 700 },
    ],
    bonusEvents: [
      { atMonth: 12, amount: 3_000 },
      { atMonth: 24, amount: 5_000 },
      { atMonth: 36, amount: 5_000 },
      { atMonth: 48, amount: 6_000 },
      { atMonth: 60, amount: 6_000 },
      { atMonth: 72, amount: 8_000 },
    ],
  },
];

export function formatMonths(months: number): string {
  if (months === 0) return "ya alcanzado";
  if (months < 12) return `${months} meses`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} año${years !== 1 ? "s" : ""}`;
  return `${years}a ${rem}m`;
}

export function formatEur(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
