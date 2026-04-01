const ES_SHORT = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
});

const ES_LONG = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const ES_MONTH_YEAR = new Intl.DateTimeFormat("es-ES", {
  month: "long",
  year: "numeric",
});

export function getTodayKey(reference = new Date()) {
  return reference.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function daysAgoIso(days: number) {
  return getTodayKey(addDays(new Date(), -days));
}

export function daysFromNowIso(days: number) {
  return getTodayKey(addDays(new Date(), days));
}

export function formatShortDate(value: string) {
  return ES_SHORT.format(new Date(value));
}

export function formatLongDate(value: string) {
  return ES_LONG.format(new Date(value));
}

export function formatMonthYear(value: string) {
  return ES_MONTH_YEAR.format(new Date(value));
}

export function formatDayLabel(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
  }).format(new Date(value));
}

export function getLastNDays(total: number) {
  return Array.from({ length: total }, (_, index) => {
    const days = total - index - 1;
    return daysAgoIso(days);
  });
}

export function isSameDayKey(left: string, right: string) {
  return left.slice(0, 10) === right.slice(0, 10);
}

export function differenceInDays(left: string, right: string) {
  const ms = new Date(left).getTime() - new Date(right).getTime();
  return Math.round(ms / 86_400_000);
}

export function daysUntil(value: string) {
  return differenceInDays(value, getTodayKey());
}
