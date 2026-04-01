import { create } from "zustand";

import { fetchAuthSession } from "@/services/auth/auth-session";
import { createSeedSnapshot, shouldUseSeedSnapshot } from "@/data/seed-snapshot";
import { aiService } from "@/services/ai/ai-service";
import {
  mapAchievementSuggestionToInsight,
  mapGoalRefinementToInsight,
  mapMonthlyInsights,
  mapPriorityToInsights,
  mapQuickCaptureToInsights,
  mapStagnationToInsights,
  readAchievementDraft,
  readGoalDraft,
  readLifeEventDraft,
  readWinDraft,
} from "@/services/ai/ai-mappers";
import type {
  MilestoneSuggestionResult,
  PrioritySuggestionResult,
  QuickCaptureAnalysis,
  WeeklySummaryResult,
} from "@/services/ai/ai-types";
import { syncAutomaticAchievements } from "@/services/achievement-engine";
import { pullSnapshotFromSupabase, pushSnapshotToSupabase } from "@/services/integrations/supabase/snapshot-sync";
import { LocalStorageRepository } from "@/services/persistence/local-storage-repository";
import { normalizeSnapshot } from "@/services/persistence/snapshot-normalizer";
import type {
  Achievement,
  AchievementInput,
  AIInsight,
  AppSnapshot,
  AuthSession,
  Goal,
  GoalInput,
  Habit,
  HabitInput,
  LifeEventInput,
  MilestoneInput,
  MonthlyReview,
  OnboardingInput,
  ProgressInput,
  ProgressEntry,
  TaskInput,
  UserProfileInput,
  WinInput,
} from "@/types";
import { daysFromNowIso, getTodayKey, isSameDayKey } from "@/utils/date";
import { clamp } from "@/utils/format";
import { createId } from "@/utils/id";

const repository = new LocalStorageRepository();

type StoreState = AppSnapshot & {
  account: AuthSession | null;
  isBootstrapping: boolean;
  weeklySummary: WeeklySummaryResult | null;
  monthlyReview: MonthlyReview | null;
  lastQuickCapture: QuickCaptureAnalysis | null;
  lastUnlockedAchievementId?: string;
  initializeApp: () => Promise<void>;
  completeOnboarding: (input: OnboardingInput) => void;
  updateUserProfile: (input: UserProfileInput) => void;
  addGoal: (input: GoalInput) => string;
  updateGoal: (goalId: string, patch: Partial<Goal>) => void;
  archiveGoal: (goalId: string) => void;
  completeGoal: (goalId: string) => void;
  addMilestone: (goalId: string, input: MilestoneInput) => void;
  toggleMilestone: (milestoneId: string, completedAt?: string) => void;
  addTask: (goalId: string, input: TaskInput) => void;
  toggleTask: (taskId: string) => void;
  registerGoalProgress: (goalId: string, input: ProgressInput) => void;
  addHabit: (input: HabitInput) => void;
  toggleHabitCompletion: (habitId: string) => void;
  archiveHabit: (habitId: string) => void;
  addWin: (input: WinInput) => string;
  addLifeEvent: (input: LifeEventInput) => string;
  addAchievement: (input: AchievementInput) => string;
  refreshAIInsights: () => Promise<void>;
  refreshAISummaries: () => Promise<void>;
  analyzeQuickCapture: (note: string) => Promise<QuickCaptureAnalysis>;
  generateGoalRefinement: (goalId: string) => Promise<AIInsight | undefined>;
  generateGoalMilestones: (goalId: string) => Promise<MilestoneSuggestionResult | undefined>;
  suggestGoalPriorities: () => Promise<PrioritySuggestionResult>;
  detectGoalStagnation: (goalId?: string) => Promise<AIInsight[]>;
  suggestAchievementFromWin: (winId: string) => Promise<AIInsight | undefined>;
  applyAIInsight: (insightId: string, overrides?: Record<string, unknown>) => void;
  dismissAIInsight: (insightId: string) => void;
  postponeAIInsight: (insightId: string, days?: number) => void;
  dismissAchievementCelebration: () => void;
  resetApp: () => void;
};

const generatedInsightSources = new Set(["stagnation", "priorities", "monthly_review"]);
let activeAccount: AuthSession | null = null;
let initializePromise: Promise<void> | null = null;

function buildSnapshot(state: StoreState): AppSnapshot {
  return {
    user: state.user,
    goals: state.goals,
    milestones: state.milestones,
    tasks: state.tasks,
    habits: state.habits,
    achievements: state.achievements,
    wins: state.wins,
    lifeEvents: state.lifeEvents,
    progressEntries: state.progressEntries,
    aiInsights: state.aiInsights,
  };
}

function deriveNameFromAccount(account: AuthSession | null) {
  if (!account?.email) return undefined;
  const [local] = account.email.split("@");
  if (!local) return undefined;
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function attachAccountToSnapshot(snapshot: AppSnapshot, account: AuthSession | null): AppSnapshot {
  if (!account) {
    return snapshot;
  }

  const nextName = snapshot.user.name.trim().length > 0 ? snapshot.user.name : deriveNameFromAccount(account) ?? snapshot.user.name;

  return {
    ...snapshot,
    user: {
      ...snapshot.user,
      id: account.userId,
      email: account.email,
      role: account.role,
      name: nextName,
      avatar: nextName.slice(0, 2).toUpperCase(),
    },
  };
}

function recalculateUserStreak(habits: Habit[]) {
  return Math.max(0, ...habits.map((habit) => habit.streak));
}

function withDerivedData(snapshot: AppSnapshot) {
  const synced = syncAutomaticAchievements(snapshot);
  return {
    snapshot: {
      ...synced.snapshot,
      user: {
        ...synced.snapshot.user,
        streak: recalculateUserStreak(synced.snapshot.habits),
      },
    },
    lastUnlockedAchievementId: synced.lastUnlockedAchievementId,
  };
}

function persistSnapshot(snapshot: AppSnapshot) {
  repository.save(snapshot);

  if (activeAccount) {
    void pushSnapshotToSupabase(snapshot, activeAccount.userId).catch(() => undefined);
  }
}

function createGoal(input: GoalInput): Goal {
  return {
    id: createId("goal"),
    title: input.title,
    description: input.description,
    category: input.category,
    priority: input.priority,
    status: "active",
    startDate: getTodayKey(),
    targetDate: input.targetDate || daysFromNowIso(90),
    difficulty: input.difficulty,
    motivation: input.motivation,
    whyItMatters: input.whyItMatters,
    timeHorizon: input.timeHorizon,
    progress: 0,
    color: input.color,
    icon: input.icon,
    milestoneIds: [],
    taskIds: [],
    progressEntryIds: [],
    relatedAchievementIds: [],
    notes: ["Empieza con una versión mínima del objetivo y conviértela en sistema antes de escalar."],
  };
}

function createAchievement(input: AchievementInput): Achievement {
  return {
    id: createId("achievement"),
    unlockedAt: getTodayKey(),
    ...input,
  };
}

function dedupeInsights(insights: AIInsight[]) {
  const seen = new Set<string>();
  return insights.filter((insight) => {
    const key = `${insight.type}|${insight.title}|${insight.relatedEntityId ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergeGeneratedInsights(existing: AIInsight[], generated: AIInsight[]) {
  const retained = existing.filter((insight) => {
    const source = typeof insight.payload?.source === "string" ? insight.payload.source : undefined;
    if (!source) return true;
    if (!generatedInsightSources.has(source)) return true;
    return insight.accepted;
  });

  return dedupeInsights([...generated, ...retained]).slice(0, 14);
}

function createWinRecord(input: WinInput) {
  return {
    id: createId("win"),
    title: input.title,
    description: input.description,
    date: input.date,
    category: input.category,
    impactLevel: input.impactLevel,
    relatedGoalId: input.relatedGoalId,
    reflection: input.reflection,
    source: input.source ?? "manual",
  };
}

function createLifeEventRecord(input: LifeEventInput) {
  return {
    id: createId("event"),
    title: input.title,
    description: input.description,
    date: input.date,
    category: input.category,
    impactLevel: input.impactLevel,
    tags: input.tags,
    relatedGoalId: input.relatedGoalId,
    reflection: input.reflection,
    source: input.source ?? "manual",
  };
}

const initialSnapshot = withDerivedData(repository.load()).snapshot;

export const useAppStore = create<StoreState>((set, get) => ({
  ...initialSnapshot,
  account: null,
  isBootstrapping: true,
  weeklySummary: null,
  monthlyReview: null,
  lastQuickCapture: null,
  lastUnlockedAchievementId: undefined,

  initializeApp: async () => {
    if (initializePromise) {
      return initializePromise;
    }

    initializePromise = (async () => {
      const account = await fetchAuthSession();

      if (!account) {
        activeAccount = null;
        set({ account: null, isBootstrapping: false });
        initializePromise = null;
        return;
      }

      activeAccount = account;
      repository.setScope(account.userId);

      const currentSnapshot = buildSnapshot(get());
      const scopedLocalSnapshot = repository.loadExisting();
      const remoteSnapshot = await pullSnapshotFromSupabase(account.userId);
      const normalizedRemoteSnapshot = remoteSnapshot ? normalizeSnapshot(remoteSnapshot) : null;
      const safeRemoteSnapshot =
        normalizedRemoteSnapshot && !shouldUseSeedSnapshot(normalizedRemoteSnapshot) ? normalizedRemoteSnapshot : null;
      const safeScopedLocalSnapshot =
        scopedLocalSnapshot && !shouldUseSeedSnapshot(scopedLocalSnapshot) ? scopedLocalSnapshot : null;
      const safeCurrentSnapshot =
        currentSnapshot.user.hasCompletedOnboarding && !shouldUseSeedSnapshot(currentSnapshot) ? currentSnapshot : createSeedSnapshot();

      const baseSnapshot =
        safeRemoteSnapshot ??
        safeScopedLocalSnapshot ??
        safeCurrentSnapshot ??
        initialSnapshot;

      // Preserve user profile edits saved locally to prevent remote sync from silently
      // overwriting changes the user made (e.g. name, quote) when the remote snapshot is stale.
      const localUser = safeScopedLocalSnapshot?.user ?? currentSnapshot.user;
      const localHasProfileEdit =
        localUser.hasCompletedOnboarding &&
        localUser.name.trim().length > 0 &&
        localUser.name !== baseSnapshot.user.name;
      const mergedBase = localHasProfileEdit
        ? {
            ...baseSnapshot,
            user: {
              ...baseSnapshot.user,
              name: localUser.name,
              quote: localUser.quote || baseSnapshot.user.quote,
              focusAreas: localUser.focusAreas.length > 0 ? localUser.focusAreas : baseSnapshot.user.focusAreas,
              avatar: localUser.avatar || localUser.name.slice(0, 2).toUpperCase(),
            },
          }
        : baseSnapshot;

      // One-time migration: apply real historical completedAt dates to ladder milestones
      // that were completed before the app tracked dates.
      const FLIP_MIGRATION_KEY = "migrated_flip_dates_v2";
      const flipDates: Record<string, string> = {
        milestone_ladder_500: "2025-08-10",
        milestone_ladder_1000: "2025-08-28",
        milestone_ladder_2000: "2025-09-27",
        milestone_ladder_4000: "2025-11-28",
      };
      const needsMigration = !localStorage.getItem(FLIP_MIGRATION_KEY);
      const migratedBase = needsMigration
        ? {
            ...mergedBase,
            milestones: mergedBase.milestones.map((m) =>
              flipDates[m.id]
                ? { ...m, completed: true, completedAt: flipDates[m.id] }
                : m,
            ),
          }
        : mergedBase;
      if (needsMigration) localStorage.setItem(FLIP_MIGRATION_KEY, "1");

      const derived = withDerivedData(attachAccountToSnapshot(migratedBase, account));
      repository.save(derived.snapshot);

      if (!remoteSnapshot && derived.snapshot.user.hasCompletedOnboarding) {
        void pushSnapshotToSupabase(derived.snapshot, account.userId).catch(() => undefined);
      }

      set({
        ...derived.snapshot,
        account,
        isBootstrapping: false,
        lastUnlockedAchievementId: derived.lastUnlockedAchievementId,
      });

      initializePromise = null;
    })();

    return initializePromise;
  },

  completeOnboarding: (input) => {
    const goal = createGoal(input.firstGoal);
    const habitId = createId("habit");
    const onboardingMilestones =
      input.initialMilestones?.map((milestone) => ({
        id: createId("milestone"),
        goalId: goal.id,
        title: milestone.title,
        description: milestone.description,
        dueDate: milestone.dueDate,
        completed: false,
      })) ?? [];
    const nextSnapshot: AppSnapshot = {
      ...buildSnapshot(get()),
      user: {
        ...get().user,
        name: input.name,
        avatar: input.name.slice(0, 2).toUpperCase(),
        focusAreas: input.focusAreas,
        hasCompletedOnboarding: true,
      },
      goals: [goal, ...get().goals],
      milestones: [...onboardingMilestones, ...get().milestones],
      habits: [
        {
          id: habitId,
          title: input.firstHabit.title,
          category: input.firstHabit.category,
          frequency: input.firstHabit.frequency,
          target: input.firstHabit.target,
          streak: 0,
          history: [],
          color: input.firstHabit.color,
          icon: input.firstHabit.icon,
          archived: false,
        },
        ...get().habits,
      ],
      wins: [...(input.initialWins?.map(createWinRecord) ?? []), ...get().wins],
      lifeEvents: [
        createLifeEventRecord({
          title: "GoalOS activado",
          description: "Primer setup del sistema personal y prioridades definidas.",
          date: getTodayKey(),
          category: "sistema",
          impactLevel: "medium",
          tags: ["onboarding"],
          source: "manual",
        }),
        ...get().lifeEvents,
      ],
      aiInsights: [...(input.initialInsights ?? []), ...get().aiInsights],
    };
    nextSnapshot.goals = nextSnapshot.goals.map((item) =>
      item.id === goal.id
        ? {
            ...item,
            milestoneIds: onboardingMilestones.map((milestone) => milestone.id),
          }
        : item,
    );
    const derived = withDerivedData(nextSnapshot);
    persistSnapshot(derived.snapshot);
    set({
      ...derived.snapshot,
      lastUnlockedAchievementId: derived.lastUnlockedAchievementId,
    });
  },

  updateUserProfile: (input) => {
    const derived = withDerivedData({
      ...buildSnapshot(get()),
      user: {
        ...get().user,
        name: input.name.trim(),
        avatar: input.name.trim().slice(0, 2).toUpperCase(),
        quote: input.quote.trim(),
        focusAreas: input.focusAreas,
      },
    });
    persistSnapshot(derived.snapshot);
    set({
      ...derived.snapshot,
      lastUnlockedAchievementId: derived.lastUnlockedAchievementId,
    });
  },

  addGoal: (input) => {
    const goal = createGoal(input);
    const derived = withDerivedData({
      ...buildSnapshot(get()),
      goals: [goal, ...get().goals],
    });
    persistSnapshot(derived.snapshot);
    set({
      ...derived.snapshot,
      lastUnlockedAchievementId: derived.lastUnlockedAchievementId,
    });
    return goal.id;
  },

  updateGoal: (goalId, patch) => {
    const derived = withDerivedData({
      ...buildSnapshot(get()),
      goals: get().goals.map((goal) => (goal.id === goalId ? { ...goal, ...patch } : goal)),
    });
    persistSnapshot(derived.snapshot);
    set({
      ...derived.snapshot,
      lastUnlockedAchievementId: derived.lastUnlockedAchievementId,
    });
  },

  archiveGoal: (goalId) => {
    get().updateGoal(goalId, { status: "archived" });
  },

  completeGoal: (goalId) => {
    get().updateGoal(goalId, { status: "completed", progress: 100 });
  },

  addMilestone: (goalId, input) => {
    const milestoneId = createId("milestone");
    const derived = withDerivedData({
      ...buildSnapshot(get()),
      milestones: [
        {
          id: milestoneId,
          goalId,
          title: input.title,
          description: input.description,
          dueDate: input.dueDate,
          completed: false,
        },
        ...get().milestones,
      ],
      goals: get().goals.map((goal) =>
        goal.id === goalId ? { ...goal, milestoneIds: [milestoneId, ...goal.milestoneIds] } : goal,
      ),
    });
    persistSnapshot(derived.snapshot);
    set({
      ...derived.snapshot,
      lastUnlockedAchievementId: derived.lastUnlockedAchievementId,
    });
  },

  toggleMilestone: (milestoneId, completedAt) => {
    const milestone = get().milestones.find((item) => item.id === milestoneId);
    if (!milestone) return;

    const derived = withDerivedData({
      ...buildSnapshot(get()),
      milestones: get().milestones.map((item) =>
        item.id === milestoneId
          ? {
              ...item,
              completed: !item.completed,
              completedAt: !item.completed ? (completedAt ?? getTodayKey()) : undefined,
            }
          : item,
      ),
    });
    persistSnapshot(derived.snapshot);
    set({
      ...derived.snapshot,
      lastUnlockedAchievementId: derived.lastUnlockedAchievementId,
    });
  },

  addTask: (goalId, input) => {
    const taskId = createId("task");
    const derived = withDerivedData({
      ...buildSnapshot(get()),
      tasks: [
        {
          id: taskId,
          goalId,
          title: input.title,
          priority: input.priority,
          dueDate: input.dueDate,
          milestoneId: input.milestoneId,
          completed: false,
        },
        ...get().tasks,
      ],
      goals: get().goals.map((goal) =>
        goal.id === goalId ? { ...goal, taskIds: [taskId, ...goal.taskIds] } : goal,
      ),
    });
    persistSnapshot(derived.snapshot);
    set({
      ...derived.snapshot,
      lastUnlockedAchievementId: derived.lastUnlockedAchievementId,
    });
  },

  toggleTask: (taskId) => {
    const derived = withDerivedData({
      ...buildSnapshot(get()),
      tasks: get().tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)),
    });
    persistSnapshot(derived.snapshot);
    set({
      ...derived.snapshot,
      lastUnlockedAchievementId: derived.lastUnlockedAchievementId,
    });
  },

  registerGoalProgress: (goalId, input) => {
    const progressId = createId("progress");
    const goal = get().goals.find((item) => item.id === goalId);
    if (!goal) return;

    const nextProgress = clamp(goal.progress + input.value);
    const progressEntry: ProgressEntry = {
      id: progressId,
      goalId,
      value: input.value,
      note: input.note,
      date: getTodayKey(),
      source: "manual",
    };

    const derived = withDerivedData({
      ...buildSnapshot(get()),
      progressEntries: [progressEntry, ...get().progressEntries],
      goals: get().goals.map((item) =>
        item.id === goalId
          ? {
              ...item,
              progress: nextProgress,
              status: nextProgress >= 100 ? "completed" : item.status,
              progressEntryIds: [progressId, ...item.progressEntryIds],
            }
          : item,
      ),
    });
    persistSnapshot(derived.snapshot);
    set({
      ...derived.snapshot,
      lastUnlockedAchievementId: derived.lastUnlockedAchievementId,
    });
  },

  addHabit: (input) => {
    const derived = withDerivedData({
      ...buildSnapshot(get()),
      habits: [
        {
          id: createId("habit"),
          title: input.title,
          category: input.category,
          frequency: input.frequency,
          target: input.target,
          streak: 0,
          history: [],
          color: input.color,
          icon: input.icon,
          archived: false,
        },
        ...get().habits,
      ],
    });
    persistSnapshot(derived.snapshot);
    set({
      ...derived.snapshot,
      lastUnlockedAchievementId: derived.lastUnlockedAchievementId,
    });
  },

  toggleHabitCompletion: (habitId) => {
    const today = getTodayKey();
    const targetHabit = get().habits.find((habit) => habit.id === habitId);
    if (!targetHabit) return;

    const existingEntry = targetHabit.history.find((entry) => isSameDayKey(entry.date, today));

    const updatedHabits = get().habits.map((habit) => {
      if (habit.id !== habitId) return habit;

      const history = existingEntry
        ? habit.history.map((entry) =>
            isSameDayKey(entry.date, today)
              ? { ...entry, completed: !entry.completed, value: entry.completed ? 0 : 1 }
              : entry,
          )
        : [
            ...habit.history,
            {
              id: createId("habit_entry"),
              habitId,
              date: today,
              value: 1,
              completed: true,
            },
          ];

      const sortedHistory = [...history].sort((left, right) => left.date.localeCompare(right.date));
      let streak = 0;
      for (let index = sortedHistory.length - 1; index >= 0; index -= 1) {
        const entry = sortedHistory[index];
        if (entry.completed) {
          streak += 1;
        } else {
          break;
        }
      }

      return {
        ...habit,
        history,
        streak,
      };
    });

    const derived = withDerivedData({
      ...buildSnapshot(get()),
      habits: updatedHabits,
    });
    persistSnapshot(derived.snapshot);
    set({
      ...derived.snapshot,
      lastUnlockedAchievementId: derived.lastUnlockedAchievementId,
    });
  },

  archiveHabit: (habitId) => {
    const derived = withDerivedData({
      ...buildSnapshot(get()),
      habits: get().habits.map((habit) => (habit.id === habitId ? { ...habit, archived: true } : habit)),
    });
    persistSnapshot(derived.snapshot);
    set({
      ...derived.snapshot,
      lastUnlockedAchievementId: derived.lastUnlockedAchievementId,
    });
  },

  addWin: (input) => {
    const win = createWinRecord(input);
    const derived = withDerivedData({
      ...buildSnapshot(get()),
      wins: [win, ...get().wins],
    });
    persistSnapshot(derived.snapshot);
    set({
      ...derived.snapshot,
      lastUnlockedAchievementId: derived.lastUnlockedAchievementId,
    });
    return win.id;
  },

  addLifeEvent: (input) => {
    const event = createLifeEventRecord(input);
    const derived = withDerivedData({
      ...buildSnapshot(get()),
      lifeEvents: [event, ...get().lifeEvents],
    });
    persistSnapshot(derived.snapshot);
    set({
      ...derived.snapshot,
      lastUnlockedAchievementId: derived.lastUnlockedAchievementId,
    });
    return event.id;
  },

  addAchievement: (input) => {
    const achievement = createAchievement(input);
    const derived = withDerivedData({
      ...buildSnapshot(get()),
      achievements: [achievement, ...get().achievements],
    });
    persistSnapshot(derived.snapshot);
    set({
      ...derived.snapshot,
      lastUnlockedAchievementId: achievement.id,
    });
    return achievement.id;
  },

  refreshAIInsights: async () => {
    const snapshot = buildSnapshot(get());
    const [weeklySummary, priorities, monthlyResult, stagnation] = await Promise.all([
      aiService.generateWeeklySummary(snapshot),
      aiService.suggestPriorities({ snapshot }),
      aiService.generateMonthlyInsights(snapshot),
      aiService.detectStagnation({ snapshot }),
    ]);

    const aiInsights = mergeGeneratedInsights(snapshot.aiInsights, [
      ...mapPriorityToInsights(priorities),
      ...mapMonthlyInsights(monthlyResult),
      ...mapStagnationToInsights(stagnation),
    ]);

    const nextSnapshot = {
      ...snapshot,
      aiInsights,
    };
    persistSnapshot(nextSnapshot);
    set({
      ...nextSnapshot,
      weeklySummary,
      monthlyReview: monthlyResult.summary,
    });
  },

  refreshAISummaries: async () => {
    const snapshot = buildSnapshot(get());
    const [weeklySummary, monthlyResult] = await Promise.all([
      aiService.generateWeeklySummary(snapshot),
      aiService.generateMonthlyInsights(snapshot),
    ]);
    const nextSnapshot = {
      ...snapshot,
      aiInsights: mergeGeneratedInsights(snapshot.aiInsights, mapMonthlyInsights(monthlyResult)),
    };
    persistSnapshot(nextSnapshot);
    set({
      ...nextSnapshot,
      weeklySummary,
      monthlyReview: monthlyResult.summary,
    });
  },

  analyzeQuickCapture: async (note) => {
    const snapshot = buildSnapshot(get());
    const analysis = await aiService.classifyEntry({ note, snapshot });
    const nextSnapshot = {
      ...snapshot,
      aiInsights: dedupeInsights([...mapQuickCaptureToInsights(analysis), ...snapshot.aiInsights]).slice(0, 20),
    };
    persistSnapshot(nextSnapshot);
    set({
      ...nextSnapshot,
      lastQuickCapture: analysis,
    });
    return analysis;
  },

  generateGoalRefinement: async (goalId) => {
    const snapshot = buildSnapshot(get());
    const goal = snapshot.goals.find((item) => item.id === goalId);
    if (!goal) return undefined;
    const result = await aiService.refineGoal({ goal, snapshot });
    const insight = mapGoalRefinementToInsight(goal.id, result);
    const nextSnapshot = {
      ...snapshot,
      aiInsights: dedupeInsights([insight, ...snapshot.aiInsights]).slice(0, 20),
    };
    persistSnapshot(nextSnapshot);
    set(nextSnapshot);
    return insight;
  },

  generateGoalMilestones: async (goalId) => {
    const snapshot = buildSnapshot(get());
    const goal = snapshot.goals.find((item) => item.id === goalId);
    if (!goal) return undefined;
    return aiService.suggestMilestones({ goal, snapshot });
  },

  suggestGoalPriorities: async () => {
    const snapshot = buildSnapshot(get());
    const result = await aiService.suggestPriorities({ snapshot });
    const nextSnapshot = {
      ...snapshot,
      aiInsights: dedupeInsights([...mapPriorityToInsights(result), ...snapshot.aiInsights]).slice(0, 20),
    };
    persistSnapshot(nextSnapshot);
    set(nextSnapshot);
    return result;
  },

  detectGoalStagnation: async (goalId) => {
    const snapshot = buildSnapshot(get());
    const results = await aiService.detectStagnation({ snapshot, goalId });
    const insights = mapStagnationToInsights(results);
    const nextSnapshot = {
      ...snapshot,
      aiInsights: dedupeInsights([...insights, ...snapshot.aiInsights]).slice(0, 20),
    };
    persistSnapshot(nextSnapshot);
    set(nextSnapshot);
    return insights;
  },

  suggestAchievementFromWin: async (winId) => {
    const snapshot = buildSnapshot(get());
    const win = snapshot.wins.find((item) => item.id === winId);
    if (!win) return undefined;
    const suggestion = await aiService.suggestAchievement({ win, snapshot });
    const insight = mapAchievementSuggestionToInsight(win.id, suggestion);
    const nextSnapshot = {
      ...snapshot,
      aiInsights: dedupeInsights([insight, ...snapshot.aiInsights]).slice(0, 20),
    };
    persistSnapshot(nextSnapshot);
    set(nextSnapshot);
    return insight;
  },

  applyAIInsight: (insightId, overrides) => {
    const state = get();
    const insight = state.aiInsights.find((item) => item.id === insightId);
    if (!insight) return;

    const goalDraft = readGoalDraft(insight.payload);
    const winDraft = readWinDraft(insight.payload);
    const lifeEventDraft = readLifeEventDraft(insight.payload);
    const achievementDraft = readAchievementDraft(insight.payload);

    let nextSnapshot = buildSnapshot(state);
    let lastUnlockedAchievementId = state.lastUnlockedAchievementId;

    if (goalDraft) {
      const mergedDraft = { ...goalDraft, ...(overrides ?? {}) } as GoalInput;
      const relatedGoal = insight.relatedEntityType === "goal" ? state.goals.find((goal) => goal.id === insight.relatedEntityId) : undefined;
      if (relatedGoal) {
        nextSnapshot = {
          ...nextSnapshot,
          goals: state.goals.map((goal) =>
            goal.id === relatedGoal.id
              ? {
                  ...goal,
                  title: mergedDraft.title,
                  description: mergedDraft.description,
                  category: mergedDraft.category,
                  priority: mergedDraft.priority,
                  targetDate: mergedDraft.targetDate,
                  difficulty: mergedDraft.difficulty,
                  motivation: mergedDraft.motivation,
                  whyItMatters: mergedDraft.whyItMatters,
                  timeHorizon: mergedDraft.timeHorizon,
                  color: mergedDraft.color,
                  icon: mergedDraft.icon,
                }
              : goal,
          ),
        };
      } else {
        nextSnapshot = {
          ...nextSnapshot,
          goals: [createGoal(mergedDraft), ...state.goals],
        };
      }
    }

    if (winDraft) {
      const mergedDraft = { ...winDraft, ...(overrides ?? {}) } as WinInput;
      nextSnapshot = {
        ...nextSnapshot,
        wins: [createWinRecord(mergedDraft), ...nextSnapshot.wins],
      };
    }

    if (lifeEventDraft) {
      const mergedDraft = { ...lifeEventDraft, ...(overrides ?? {}) } as LifeEventInput;
      nextSnapshot = {
        ...nextSnapshot,
        lifeEvents: [createLifeEventRecord(mergedDraft), ...nextSnapshot.lifeEvents],
      };
    }

    if (achievementDraft) {
      const mergedDraft = { ...achievementDraft, ...(overrides ?? {}) } as AchievementInput;
      const achievement = createAchievement(mergedDraft);
      nextSnapshot = {
        ...nextSnapshot,
        achievements: [achievement, ...nextSnapshot.achievements],
      };
      lastUnlockedAchievementId = achievement.id;
    }

    const derived = withDerivedData({
      ...nextSnapshot,
      aiInsights: nextSnapshot.aiInsights.map((item) =>
        item.id === insightId ? { ...item, accepted: true, dismissed: false } : item,
      ),
    });
    persistSnapshot(derived.snapshot);
    set({
      ...derived.snapshot,
      lastUnlockedAchievementId: lastUnlockedAchievementId ?? derived.lastUnlockedAchievementId,
    });
  },

  dismissAIInsight: (insightId) => {
    const nextSnapshot = {
      ...buildSnapshot(get()),
      aiInsights: get().aiInsights.map((insight) =>
        insight.id === insightId ? { ...insight, dismissed: true } : insight,
      ),
    };
    persistSnapshot(nextSnapshot);
    set(nextSnapshot);
  },

  postponeAIInsight: (insightId, days = 7) => {
    const postponedUntil = daysFromNowIso(days);
    const nextSnapshot = {
      ...buildSnapshot(get()),
      aiInsights: get().aiInsights.map((insight) =>
        insight.id === insightId ? { ...insight, postponedUntil } : insight,
      ),
    };
    persistSnapshot(nextSnapshot);
    set(nextSnapshot);
  },

  dismissAchievementCelebration: () => {
    set({ lastUnlockedAchievementId: undefined });
  },

  resetApp: () => {
    const snapshot = withDerivedData(attachAccountToSnapshot(repository.reset(), activeAccount)).snapshot;
    persistSnapshot(snapshot);
    set({
      ...snapshot,
      weeklySummary: null,
      monthlyReview: null,
      lastQuickCapture: null,
      lastUnlockedAchievementId: undefined,
    });
  },
}));
