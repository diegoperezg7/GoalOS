import type {
  AchievementSuggestionResult,
  ClassifyEntryInput,
  DetectStagnationInput,
  GenerateGoalPlanInput,
  GenerateGoalPlanResult,
  GoalRefinementResult,
  MilestoneSuggestionResult,
  MonthlyInsightsResult,
  PrioritySuggestionResult,
  QuickCaptureAnalysis,
  RefineGoalInput,
  StagnationResult,
  SuggestAchievementInput,
  SuggestMilestonesInput,
  SuggestPrioritiesInput,
  WeeklySummaryResult,
} from "@/services/ai/ai-types";
import type { AppSnapshot } from "@/types";

export interface AIProvider {
  generateGoalPlan(input: GenerateGoalPlanInput): Promise<GenerateGoalPlanResult>;
  refineGoal(input: RefineGoalInput): Promise<GoalRefinementResult>;
  suggestMilestones(input: SuggestMilestonesInput): Promise<MilestoneSuggestionResult>;
  classifyEntry(input: ClassifyEntryInput): Promise<QuickCaptureAnalysis>;
  suggestAchievement(input: SuggestAchievementInput): Promise<AchievementSuggestionResult>;
  generateWeeklySummary(snapshot: AppSnapshot): Promise<WeeklySummaryResult>;
  generateMonthlyInsights(snapshot: AppSnapshot): Promise<MonthlyInsightsResult>;
  detectStagnation(input: DetectStagnationInput): Promise<StagnationResult[]>;
  suggestPriorities(input: SuggestPrioritiesInput): Promise<PrioritySuggestionResult>;
}
