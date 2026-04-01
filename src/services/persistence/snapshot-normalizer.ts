import { createEmptySnapshot } from "@/data/empty-snapshot";
import type {
  Achievement,
  AchievementInput,
  AIInsight,
  AppSnapshot,
  Goal,
  Habit,
  LifeEvent,
  ProgressEntry,
  User,
  Win,
} from "@/types";
import { daysFromNowIso, getTodayKey } from "@/utils/date";

type LegacySnapshot = Partial<AppSnapshot> & {
  aiInsights?: LegacyInsight[];
};

type LegacyInsight = Partial<AIInsight> & {
  message?: string;
  recommendation?: string;
  relatedGoalId?: string;
  confidence?: number;
};

function asArray<T>(value: unknown, fallback: T[] = []) {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function normalizeUser(user: Partial<User> | undefined): User {
  const emptyUser = createEmptySnapshot().user;
  return {
    ...emptyUser,
    ...user,
    focusAreas: asArray(user?.focusAreas, emptyUser.focusAreas),
  };
}

function deriveTimeHorizon(targetDate?: string): Goal["timeHorizon"] {
  if (!targetDate) return "90_days";
  const days = Math.max(0, Math.round((new Date(targetDate).getTime() - new Date().getTime()) / 86_400_000));
  if (days <= 45) return "30_days";
  if (days <= 120) return "90_days";
  if (days <= 420) return "1_year";
  return "long_term";
}

function normalizeGoal(goal: Partial<Goal>): Goal {
  const targetDate = goal.targetDate ?? daysFromNowIso(90);
  return {
    id: goal.id ?? crypto.randomUUID(),
    title: goal.title ?? "Objetivo importado",
    description: goal.description ?? "",
    category: goal.category ?? "personal",
    priority: goal.priority ?? "medium",
    status: goal.status ?? "active",
    startDate: goal.startDate ?? getTodayKey(),
    targetDate,
    difficulty: goal.difficulty ?? "stretch",
    motivation: goal.motivation ?? "",
    whyItMatters: goal.whyItMatters ?? goal.motivation ?? "",
    timeHorizon: goal.timeHorizon ?? deriveTimeHorizon(targetDate),
    progress: goal.progress ?? 0,
    color: goal.color ?? "aqua",
    icon: goal.icon ?? "Target",
    milestoneIds: asArray(goal.milestoneIds),
    taskIds: asArray(goal.taskIds),
    progressEntryIds: asArray(goal.progressEntryIds),
    relatedAchievementIds: asArray(goal.relatedAchievementIds),
    notes: asArray(goal.notes),
  };
}

function normalizeHabit(habit: Partial<Habit>): Habit {
  return {
    id: habit.id ?? crypto.randomUUID(),
    title: habit.title ?? "Hábito importado",
    category: habit.category ?? "personal",
    frequency: habit.frequency ?? "daily",
    target: habit.target,
    streak: habit.streak ?? 0,
    history: asArray(habit.history),
    color: habit.color ?? "aqua",
    icon: habit.icon ?? "Sparkles",
    archived: habit.archived ?? false,
  };
}

function normalizeAchievement(achievement: Partial<Achievement> | Partial<AchievementInput>): Achievement {
  const current = achievement as Partial<Achievement>;
  return {
    id: current.id ?? crypto.randomUUID(),
    title: achievement.title ?? "Logro importado",
    description: achievement.description ?? "",
    category: achievement.category ?? "general",
    rarity: achievement.rarity ?? "common",
    icon: achievement.icon ?? "Award",
    unlockedAt: current.unlockedAt ?? getTodayKey(),
    type: achievement.type ?? "manual",
    relatedGoalId: achievement.relatedGoalId,
    celebrationText: achievement.celebrationText,
    significanceNote: achievement.significanceNote,
    confidence: achievement.confidence,
  };
}

function normalizeWin(win: Partial<Win>): Win {
  return {
    id: win.id ?? crypto.randomUUID(),
    title: win.title ?? "Victoria importada",
    description: win.description ?? "",
    date: win.date ?? getTodayKey(),
    category: win.category ?? "personal",
    impactLevel: win.impactLevel ?? "medium",
    relatedGoalId: win.relatedGoalId,
    reflection: win.reflection,
    source: win.source ?? "manual",
  };
}

function normalizeLifeEvent(event: Partial<LifeEvent>): LifeEvent {
  return {
    id: event.id ?? crypto.randomUUID(),
    title: event.title ?? "Evento importado",
    description: event.description ?? "",
    date: event.date ?? getTodayKey(),
    category: event.category ?? "personal",
    impactLevel: event.impactLevel ?? "medium",
    tags: asArray(event.tags),
    relatedGoalId: event.relatedGoalId,
    reflection: event.reflection,
    source: event.source ?? "manual",
  };
}

function normalizeProgress(entry: Partial<ProgressEntry>): ProgressEntry {
  return {
    id: entry.id ?? crypto.randomUUID(),
    goalId: entry.goalId ?? "",
    value: entry.value ?? 0,
    note: entry.note ?? "",
    date: entry.date ?? getTodayKey(),
    source: entry.source ?? "manual",
  };
}

function legacyTypeToInsightType(type?: string): AIInsight["type"] {
  if (type === "warning") return "stagnation";
  if (type === "opportunity") return "momentum";
  if (type === "balance") return "imbalance";
  if (type === "celebration") return "reflection";
  return "suggestion";
}

function legacySeverity(type?: string): AIInsight["severity"] {
  if (type === "warning") return "high";
  if (type === "balance") return "medium";
  return "low";
}

function normalizeInsight(insight: LegacyInsight): AIInsight {
  return {
    id: insight?.id ?? crypto.randomUUID(),
    type: insight?.type ? legacyTypeToInsightType(insight.type as string) : "suggestion",
    title: insight?.title ?? "Insight importado",
    description: insight?.description ?? insight?.message ?? "",
    category: insight?.category ?? "general",
    severity: insight?.severity ?? legacySeverity(insight?.type as string),
    relatedEntityId: insight?.relatedEntityId ?? insight?.relatedGoalId,
    relatedEntityType: insight?.relatedEntityType ?? (insight?.relatedGoalId ? "goal" : "dashboard"),
    actionsSuggested: asArray(insight?.actionsSuggested),
    createdAt: insight?.createdAt ?? getTodayKey(),
    dismissed: insight?.dismissed ?? false,
    accepted: insight?.accepted ?? false,
    postponedUntil: insight?.postponedUntil,
    payload: insight?.payload,
  };
}

export function normalizeSnapshot(raw: unknown): AppSnapshot {
  const emptySnapshot = createEmptySnapshot();

  if (!raw || typeof raw !== "object") {
    return emptySnapshot;
  }

  const legacy = raw as LegacySnapshot;

  return {
    user: normalizeUser(legacy.user),
    goals: asArray(legacy.goals, emptySnapshot.goals).map(normalizeGoal),
    milestones: asArray(legacy.milestones, emptySnapshot.milestones),
    tasks: asArray(legacy.tasks, emptySnapshot.tasks),
    habits: asArray(legacy.habits, emptySnapshot.habits).map(normalizeHabit),
    achievements: asArray(legacy.achievements, emptySnapshot.achievements).map(normalizeAchievement),
    wins: asArray<Partial<Win>>(legacy.wins).map(normalizeWin),
    lifeEvents: asArray(legacy.lifeEvents, emptySnapshot.lifeEvents).map(normalizeLifeEvent),
    progressEntries: asArray(legacy.progressEntries, emptySnapshot.progressEntries).map(normalizeProgress),
    aiInsights: asArray<LegacyInsight>(legacy.aiInsights, emptySnapshot.aiInsights as LegacyInsight[]).map(normalizeInsight),
  };
}
