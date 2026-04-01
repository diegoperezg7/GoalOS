import type {
  AIInsightSeverity,
  AIInsightType,
  AchievementInput,
  AchievementRarity,
  AppSnapshot,
  Goal,
  GoalInput,
  GoalPlan,
  GoalPlanRequest,
  GoalPriority,
  GoalTimeHorizon,
  HabitInput,
  LifeEventInput,
  MilestoneInput,
  WeeklySummary,
  Win,
  WinInput,
} from "@/types";

export interface AIProviderConfig {
  provider: "rules" | "local" | "remote";
  baseUrl?: string;
  model?: string;
  timeoutMs: number;
  fallbackEnabled: boolean;
}

export interface SuggestedEntityDraft {
  type: "goal" | "win" | "life_event" | "achievement" | "insight";
  title: string;
  description: string;
  category: string;
  confidence: number;
  relatedGoalIds: string[];
  goal?: GoalInput;
  win?: WinInput;
  lifeEvent?: LifeEventInput;
  achievement?: AchievementInput;
  insight?: {
    type: AIInsightType;
    severity: AIInsightSeverity;
    actionsSuggested: string[];
  };
}

export interface QuickCaptureAnalysis {
  input: string;
  detectedType: SuggestedEntityDraft["type"] | "mixed";
  category: string;
  confidence: number;
  relatedGoalIds: string[];
  suggestedEntities: SuggestedEntityDraft[];
  suggestedActions: string[];
  summary: string;
}

export interface GoalRefinementResult {
  title: string;
  description: string;
  category: string;
  priority: GoalPriority;
  timeHorizon: GoalTimeHorizon;
  targetDate: string;
  motivation: string;
  whyItMatters: string;
  nextStep: string;
}

export interface MilestoneSuggestion {
  title: string;
  description?: string;
  dueDate: string;
  rationale: string;
}

export interface MilestoneSuggestionResult {
  milestones: MilestoneSuggestion[];
  risks: string[];
  nextStep: string;
}

export interface AchievementSuggestionResult {
  title: string;
  description: string;
  category: string;
  rarity: AchievementRarity;
  reason: string;
  icon: string;
  relatedGoalId?: string;
  confidence: number;
}

export interface StagnationResult {
  goalId: string;
  goalTitle: string;
  category: string;
  severity: Extract<AIInsightSeverity, "medium" | "high">;
  description: string;
  nextStep: string;
}

export interface PrioritySuggestionResult {
  headline: string;
  primaryGoalId?: string;
  primaryGoalTitle?: string;
  reason: string;
  pauseGoalIds: string[];
  reframeGoalIds: string[];
  strongestArea?: string;
  weakestArea?: string;
}

export interface MonthlyInsightsResult {
  summary: {
    headline: string;
    momentum: string;
    strongestArea?: string;
    weakestArea?: string;
    dispersion: string;
    priorityFocus: string;
    goalToRefine?: string;
    goalToPause?: string;
    insights: string[];
  };
  insights: Array<{
    type: AIInsightType;
    title: string;
    description: string;
    category: string;
    severity: AIInsightSeverity;
    relatedEntityId?: string;
    actionsSuggested: string[];
  }>;
}

export type WeeklySummaryResult = WeeklySummary;

export interface SuggestMilestonesInput {
  goal: Goal;
  snapshot: AppSnapshot;
}

export interface RefineGoalInput {
  goal: Goal;
  snapshot: AppSnapshot;
}

export interface SuggestAchievementInput {
  win: Win;
  snapshot: AppSnapshot;
}

export interface SuggestPrioritiesInput {
  snapshot: AppSnapshot;
}

export interface DetectStagnationInput {
  snapshot: AppSnapshot;
  goalId?: string;
}

export interface ClassifyEntryInput {
  note: string;
  snapshot: AppSnapshot;
}

export type GenerateGoalPlanInput = GoalPlanRequest;

export interface GenerateGoalPlanResult extends GoalPlan {
  habit?: HabitInput;
}

export interface AIInsightDraftPayload {
  entityType: SuggestedEntityDraft["type"];
  draft: GoalInput | WinInput | LifeEventInput | AchievementInput | Record<string, unknown>;
}

export interface AIInsightRecordPayload {
  summary?: string;
  source?: string;
}

export type AIInsightPayload = AIInsightDraftPayload | AIInsightRecordPayload | Record<string, unknown>;

export interface MonthlyReviewCardData {
  headline: string;
  momentum: string;
  dispersion: string;
  priorityFocus: string;
  strongestArea?: string;
  weakestArea?: string;
  goalToRefine?: string;
}

export interface AIActionContext {
  snapshot: AppSnapshot;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type AIProviderMethodResult =
  | QuickCaptureAnalysis
  | GoalRefinementResult
  | MilestoneSuggestionResult
  | AchievementSuggestionResult
  | WeeklySummaryResult
  | StagnationResult[]
  | PrioritySuggestionResult
  | MonthlyInsightsResult
  | GenerateGoalPlanResult
  | MilestoneInput[];
