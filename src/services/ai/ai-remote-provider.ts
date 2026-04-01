import type { AIProvider } from "@/services/ai/ai-provider";
import type {
  AchievementSuggestionResult,
  AIProviderConfig,
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

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error("Remote AI timeout")), timeoutMs);
    promise
      .then((value) => {
        window.clearTimeout(timeout);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timeout);
        reject(error);
      });
  });
}

export class RemoteAIProvider implements AIProvider {
  constructor(private readonly config: AIProviderConfig) {}

  private async request<T>(task: string, input: unknown) {
    if (!this.config.baseUrl) {
      throw new Error("Remote AI baseUrl is not configured.");
    }

    const response = await withTimeout(
      fetch(`${this.config.baseUrl.replace(/\/$/, "")}/ai/${task}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.config.model,
          input,
        }),
      }),
      this.config.timeoutMs,
    );

    if (!response.ok) {
      throw new Error(`Remote AI request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  }

  generateGoalPlan(input: GenerateGoalPlanInput): Promise<GenerateGoalPlanResult> {
    return this.request("generate-goal-plan", input);
  }

  refineGoal(input: RefineGoalInput): Promise<GoalRefinementResult> {
    return this.request("refine-goal", input);
  }

  suggestMilestones(input: SuggestMilestonesInput): Promise<MilestoneSuggestionResult> {
    return this.request("suggest-milestones", input);
  }

  classifyEntry(input: ClassifyEntryInput): Promise<QuickCaptureAnalysis> {
    return this.request("classify-entry", input);
  }

  suggestAchievement(input: SuggestAchievementInput): Promise<AchievementSuggestionResult> {
    return this.request<AchievementSuggestionResult>("suggest-achievement", input);
  }

  generateWeeklySummary(snapshot: AppSnapshot): Promise<WeeklySummaryResult> {
    return this.request("generate-weekly-summary", snapshot);
  }

  generateMonthlyInsights(snapshot: AppSnapshot): Promise<MonthlyInsightsResult> {
    return this.request("generate-monthly-insights", snapshot);
  }

  detectStagnation(input: DetectStagnationInput) {
    return this.request<StagnationResult[]>("detect-stagnation", input);
  }

  suggestPriorities(input: SuggestPrioritiesInput): Promise<PrioritySuggestionResult> {
    return this.request("suggest-priorities", input);
  }
}
