export const FINANCIAL_LADDER_GOAL_ID = "goal_financial_ladder";

export const financialLadderLevels = [500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 128000, 256000, 512000, 1024000] as const;

export function formatFinancialLadderLevel(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
