export function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("es-ES").format(value);
}
