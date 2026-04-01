import type { AIProvider } from "@/services/ai/ai-provider";
import type {
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
  SuggestAchievementInput,
  SuggestMilestonesInput,
  SuggestPrioritiesInput,
  WeeklySummaryResult,
} from "@/services/ai/ai-types";
import type { AppSnapshot } from "@/types";

export class FallbackAIProvider implements AIProvider {
  constructor(private readonly providers: AIProvider[]) {}

  private async firstResult<T>(run: (provider: AIProvider) => Promise<T>) {
    let lastError: unknown;
    for (const provider of this.providers) {
      try {
        return await run(provider);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError ?? new Error("No AI provider available.");
  }

  generateGoalPlan(input: GenerateGoalPlanInput): Promise<GenerateGoalPlanResult> {
    return this.firstResult((provider) => provider.generateGoalPlan(input));
  }

  refineGoal(input: RefineGoalInput): Promise<GoalRefinementResult> {
    return this.firstResult((provider) => provider.refineGoal(input));
  }

  suggestMilestones(input: SuggestMilestonesInput): Promise<MilestoneSuggestionResult> {
    return this.firstResult((provider) => provider.suggestMilestones(input));
  }

  classifyEntry(input: ClassifyEntryInput): Promise<QuickCaptureAnalysis> {
    return this.firstResult((provider) => provider.classifyEntry(input));
  }

  suggestAchievement(input: SuggestAchievementInput) {
    return this.firstResult((provider) => provider.suggestAchievement(input));
  }

  generateWeeklySummary(snapshot: AppSnapshot): Promise<WeeklySummaryResult> {
    return this.firstResult((provider) => provider.generateWeeklySummary(snapshot));
  }

  generateMonthlyInsights(snapshot: AppSnapshot): Promise<MonthlyInsightsResult> {
    return this.firstResult((provider) => provider.generateMonthlyInsights(snapshot));
  }

  detectStagnation(input: DetectStagnationInput) {
    return this.firstResult((provider) => provider.detectStagnation(input));
  }

  suggestPriorities(input: SuggestPrioritiesInput): Promise<PrioritySuggestionResult> {
    return this.firstResult((provider) => provider.suggestPriorities(input));
  }
}
