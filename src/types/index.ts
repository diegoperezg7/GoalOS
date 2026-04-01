export type GoalStatus = "active" | "completed" | "paused" | "archived";
export type GoalPriority = "low" | "medium" | "high" | "critical";
export type GoalDifficulty = "steady" | "stretch" | "bold";
export type GoalTimeHorizon = "30_days" | "90_days" | "1_year" | "long_term";
export type HabitFrequency = "daily" | "weekdays" | "weekly";
export type TaskPriority = "low" | "medium" | "high";
export type AchievementType = "automatic" | "manual" | "ai_suggested";
export type AchievementRarity = "common" | "rare" | "epic" | "legendary";
export type EventImpact = "low" | "medium" | "high" | "life_changing";
export type AIInsightType =
  | "stagnation"
  | "momentum"
  | "imbalance"
  | "suggestion"
  | "achievement_candidate"
  | "goal_refinement"
  | "focus_recommendation"
  | "reflection";
export type AIInsightSeverity = "low" | "medium" | "high";
export type ColorToken = "aqua" | "amber" | "rose" | "emerald" | "violet" | "sky";
export type SuggestedEntityType = "goal" | "win" | "life_event" | "achievement" | "insight";
export type EntrySource = "manual" | "ai";
export type TimelineItemType = "win" | "life_event" | "achievement" | "goal";
export type TimelineItemStatus = "past" | "future";
export type TimelineCategory = "career" | "finance" | "projects" | "personal" | "health" | "learning";

export interface User {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  role?: string;
  level: number;
  xp: number;
  streak: number;
  focusAreas: string[];
  quote: string;
  hasCompletedOnboarding: boolean;
  theme: "dark";
}

export interface AuthSession {
  userId: string;
  email?: string;
  role?: string;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
}

export interface Task {
  id: string;
  goalId: string;
  milestoneId?: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority: TaskPriority;
}

export interface ProgressEntry {
  id: string;
  goalId: string;
  value: number;
  note: string;
  date: string;
  source: EntrySource;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: GoalPriority;
  status: GoalStatus;
  startDate: string;
  targetDate: string;
  difficulty: GoalDifficulty;
  motivation: string;
  whyItMatters: string;
  timeHorizon: GoalTimeHorizon;
  progress: number;
  color: ColorToken;
  icon: string;
  milestoneIds: string[];
  taskIds: string[];
  progressEntryIds: string[];
  relatedAchievementIds: string[];
  notes: string[];
}

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string;
  value: number;
  completed: boolean;
}

export interface Habit {
  id: string;
  title: string;
  category: string;
  frequency: HabitFrequency;
  target?: number;
  streak: number;
  history: HabitEntry[];
  color: ColorToken;
  icon: string;
  archived: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  rarity: AchievementRarity;
  icon: string;
  unlockedAt: string;
  type: AchievementType;
  relatedGoalId?: string;
  celebrationText?: string;
  significanceNote?: string;
  confidence?: number;
}

export interface Win {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  impactLevel: EventImpact;
  relatedGoalId?: string;
  reflection?: string;
  source: EntrySource;
}

export interface LifeEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  impactLevel: EventImpact;
  tags: string[];
  relatedGoalId?: string;
  reflection?: string;
  source: EntrySource;
}

export interface AIInsightAction {
  id: string;
  label: string;
  kind: "accept" | "edit" | "postpone" | "dismiss" | "open";
  targetType?: SuggestedEntityType;
}

export interface AIInsight {
  id: string;
  type: AIInsightType;
  title: string;
  description: string;
  category: string;
  severity: AIInsightSeverity;
  relatedEntityId?: string;
  relatedEntityType?: SuggestedEntityType | "dashboard" | "analytics";
  actionsSuggested: AIInsightAction[];
  createdAt: string;
  dismissed: boolean;
  accepted: boolean;
  postponedUntil?: string;
  payload?: Record<string, unknown>;
}

export interface TimelineInsightSummary {
  id: string;
  title: string;
  description: string;
  severity: AIInsightSeverity;
  createdAt: string;
}

export interface TimelineItem {
  id: string;
  sourceId: string;
  title: string;
  description: string;
  date: string;
  category: TimelineCategory;
  type: TimelineItemType;
  impactLevel: EventImpact;
  status: TimelineItemStatus;
  relatedGoalId?: string;
  relatedWinId?: string;
  relatedAchievementId?: string;
  tags?: string[];
  reflection?: string;
  aiInsight?: TimelineInsightSummary;
}

export interface DashboardStats {
  activeGoals: number;
  completedGoals: number;
  habitsToday: number;
  currentStreak: number;
  globalProgress: number;
  weeklyProgress: number;
  upcomingMilestones: number;
  unlockedAchievements: number;
  winsCount: number;
}

export interface AppSnapshot {
  user: User;
  goals: Goal[];
  milestones: Milestone[];
  tasks: Task[];
  habits: Habit[];
  achievements: Achievement[];
  wins: Win[];
  lifeEvents: LifeEvent[];
  progressEntries: ProgressEntry[];
  aiInsights: AIInsight[];
}

export interface GoalInput {
  title: string;
  description: string;
  category: string;
  priority: GoalPriority;
  targetDate: string;
  difficulty: GoalDifficulty;
  motivation: string;
  whyItMatters: string;
  timeHorizon: GoalTimeHorizon;
  color: ColorToken;
  icon: string;
}

export interface HabitInput {
  title: string;
  category: string;
  frequency: HabitFrequency;
  target?: number;
  color: ColorToken;
  icon: string;
}

export interface WinInput {
  title: string;
  description: string;
  date: string;
  category: string;
  impactLevel: EventImpact;
  relatedGoalId?: string;
  reflection?: string;
  source?: EntrySource;
}

export interface LifeEventInput {
  title: string;
  description: string;
  date: string;
  category: string;
  impactLevel: EventImpact;
  tags: string[];
  relatedGoalId?: string;
  reflection?: string;
  source?: EntrySource;
}

export interface AchievementInput {
  title: string;
  description: string;
  category: string;
  rarity: AchievementRarity;
  icon: string;
  type: AchievementType;
  relatedGoalId?: string;
  celebrationText?: string;
  significanceNote?: string;
  confidence?: number;
}

export interface MilestoneInput {
  title: string;
  description?: string;
  dueDate: string;
}

export interface TaskInput {
  title: string;
  priority: TaskPriority;
  dueDate?: string;
  milestoneId?: string;
}

export interface ProgressInput {
  value: number;
  note: string;
}

export interface OnboardingInput {
  name: string;
  focusAreas: string[];
  firstGoal: GoalInput;
  firstHabit: HabitInput;
  initialMilestones?: MilestoneInput[];
  initialWins?: WinInput[];
  initialInsights?: AIInsight[];
}

export interface UserProfileInput {
  name: string;
  quote: string;
  focusAreas: string[];
}

export interface GoalPlanRequest {
  note: string;
  focusAreas?: string[];
  timeframeHint?: string;
}

export interface GoalPlan {
  summary: string;
  goal: GoalInput;
  milestones: MilestoneInput[];
  habit?: HabitInput;
  focusAreas?: string[];
}

export interface WeeklySummary {
  headline: string;
  highlights: string[];
  focus: string;
  mainInsight: string;
  strongestArea?: string;
  weakestArea?: string;
  priorityGoalId?: string;
}

export interface MonthlyReview {
  headline: string;
  momentum: string;
  strongestArea?: string;
  weakestArea?: string;
  dispersion: string;
  priorityFocus: string;
  goalToRefine?: string;
  goalToPause?: string;
  insights: string[];
}
