import type {
  AIInsight,
  AppSnapshot,
  EventImpact,
  Goal,
  TimelineCategory,
  TimelineInsightSummary,
  TimelineItem,
} from "@/types";
import { getTodayKey } from "@/utils/date";

type TimelineSnapshot = Pick<AppSnapshot, "achievements" | "aiInsights" | "goals" | "lifeEvents" | "wins">;

const impactByPriority: Record<Goal["priority"], EventImpact> = {
  critical: "life_changing",
  high: "high",
  medium: "medium",
  low: "low",
};

const severityWeight: Record<AIInsight["severity"], number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function normalizeCategory(value: string): TimelineCategory {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

  if (["career", "carrera", "work", "job", "professional"].includes(normalized)) return "career";
  if (["finance", "finanzas", "financial", "money", "savings"].includes(normalized)) return "finance";
  if (["projects", "project", "proyectos", "producto", "product", "builder", "build"].includes(normalized)) return "projects";
  if (["health", "salud", "wellbeing", "energia"].includes(normalized)) return "health";
  if (["learning", "aprendizaje", "study", "studies"].includes(normalized)) return "learning";
  return "personal";
}

function summarizeInsight(insight: AIInsight): TimelineInsightSummary {
  return {
    id: insight.id,
    title: insight.title,
    description: insight.description,
    severity: insight.severity,
    createdAt: insight.createdAt,
  };
}

function pickInsight(insights: AIInsight[]) {
  return insights
    .filter((insight) => !insight.dismissed)
    .sort((left, right) => {
      const severityDelta = severityWeight[right.severity] - severityWeight[left.severity];
      if (severityDelta !== 0) return severityDelta;
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    })[0];
}

function buildInsightIndex(aiInsights: AIInsight[]) {
  const insightIndex = new Map<string, AIInsight[]>();

  for (const insight of aiInsights) {
    if (!insight.relatedEntityId) continue;
    const items = insightIndex.get(insight.relatedEntityId) ?? [];
    items.push(insight);
    insightIndex.set(insight.relatedEntityId, items);
  }

  return insightIndex;
}

function resolveInsight(index: Map<string, AIInsight[]>, ids: Array<string | undefined>) {
  const candidates = ids.flatMap((id) => (id ? index.get(id) ?? [] : []));
  const selected = pickInsight(candidates);
  return selected ? summarizeInsight(selected) : undefined;
}

function compareTimelineItems(left: TimelineItem, right: TimelineItem) {
  const timeDelta = new Date(left.date).getTime() - new Date(right.date).getTime();
  if (timeDelta !== 0) return timeDelta;

  const order: Record<TimelineItem["type"], number> = {
    life_event: 0,
    win: 1,
    achievement: 2,
    goal: 3,
  };

  return order[left.type] - order[right.type];
}

function resolveStatus(date: string, today: string): TimelineItem["status"] {
  return new Date(date).getTime() > new Date(today).getTime() ? "future" : "past";
}

function resolveAchievementImpact(rarity: AppSnapshot["achievements"][number]["rarity"]): EventImpact {
  if (rarity === "legendary" || rarity === "epic") return "life_changing";
  if (rarity === "rare") return "high";
  return "medium";
}

export function buildTimelineItems(snapshot: TimelineSnapshot): TimelineItem[] {
  const today = getTodayKey();
  const insightIndex = buildInsightIndex(snapshot.aiInsights);
  const achievementByGoalId = new Map<string, string>();

  for (const achievement of [...snapshot.achievements].sort(
    (left, right) => new Date(right.unlockedAt).getTime() - new Date(left.unlockedAt).getTime(),
  )) {
    if (!achievement.relatedGoalId || achievementByGoalId.has(achievement.relatedGoalId)) continue;
    achievementByGoalId.set(achievement.relatedGoalId, achievement.id);
  }

  const items: TimelineItem[] = [
    ...snapshot.lifeEvents.map((event) => ({
      id: `timeline_life_event_${event.id}`,
      sourceId: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      category: normalizeCategory(event.category),
      type: "life_event" as const,
      impactLevel: event.impactLevel,
      status: resolveStatus(event.date, today),
      relatedGoalId: event.relatedGoalId,
      relatedAchievementId: event.relatedGoalId ? achievementByGoalId.get(event.relatedGoalId) : undefined,
      tags: event.tags,
      reflection: event.reflection,
      aiInsight: resolveInsight(insightIndex, [event.id, event.relatedGoalId]),
    })),
    ...snapshot.wins.map((win) => ({
      id: `timeline_win_${win.id}`,
      sourceId: win.id,
      title: win.title,
      description: win.description,
      date: win.date,
      category: normalizeCategory(win.category),
      type: "win" as const,
      impactLevel: win.impactLevel,
      status: resolveStatus(win.date, today),
      relatedGoalId: win.relatedGoalId,
      relatedWinId: win.id,
      relatedAchievementId: win.relatedGoalId ? achievementByGoalId.get(win.relatedGoalId) : undefined,
      reflection: win.reflection,
      aiInsight: resolveInsight(insightIndex, [win.id, win.relatedGoalId]),
    })),
    ...snapshot.achievements.map((achievement) => ({
      id: `timeline_achievement_${achievement.id}`,
      sourceId: achievement.id,
      title: achievement.title,
      description: achievement.description,
      date: achievement.unlockedAt,
      category: normalizeCategory(achievement.category),
      type: "achievement" as const,
      impactLevel: resolveAchievementImpact(achievement.rarity),
      status: resolveStatus(achievement.unlockedAt, today),
      relatedGoalId: achievement.relatedGoalId,
      relatedAchievementId: achievement.id,
      tags: [achievement.rarity, achievement.type.replace("_", " ")],
      reflection: achievement.significanceNote ?? achievement.celebrationText,
      aiInsight: resolveInsight(insightIndex, [achievement.id, achievement.relatedGoalId]),
    })),
    ...snapshot.goals
      .filter((goal) => goal.status === "active" || goal.status === "paused")
      .map((goal) => ({
        id: `timeline_goal_${goal.id}`,
        sourceId: goal.id,
        title: goal.title,
        description: goal.description,
        date: goal.targetDate,
        category: normalizeCategory(goal.category),
        type: "goal" as const,
        impactLevel: impactByPriority[goal.priority],
        status: "future" as const,
        relatedGoalId: goal.id,
        relatedAchievementId: goal.relatedAchievementIds[0] ?? achievementByGoalId.get(goal.id),
        tags: [goal.difficulty, goal.timeHorizon.replace("_", " ")],
        reflection: goal.whyItMatters,
        aiInsight: resolveInsight(insightIndex, [goal.id]),
      })),
  ];

  return items.sort(compareTimelineItems);
}

export function getDefaultTimelineItemId(items: TimelineItem[]) {
  if (!items.length) return undefined;

  const today = new Date(getTodayKey()).getTime();
  return items.reduce((best, item) => {
    if (!best) return item;

    const bestDistance = Math.abs(new Date(best.date).getTime() - today);
    const currentDistance = Math.abs(new Date(item.date).getTime() - today);
    if (currentDistance !== bestDistance) return currentDistance < bestDistance ? item : best;

    if (best.status !== item.status) {
      return item.status === "past" ? item : best;
    }

    return compareTimelineItems(best, item) <= 0 ? best : item;
  }, items[0]).id;
}
