import {
  buildAchievementPrompt,
  buildClassifyEntryPrompt,
  buildGoalPlanPrompt,
  buildMilestonesPrompt,
  buildMonthlyInsightsPrompt,
  buildPrioritiesPrompt,
  buildRefineGoalPrompt,
  buildStagnationPrompt,
  buildWeeklySummaryPrompt,
} from "@/services/ai/ai-prompts";
import type { AIProvider } from "@/services/ai/ai-provider";
import type {
  AchievementSuggestionResult,
  AIProviderConfig,
  ChatMessage,
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

type OllamaChatResponse = {
  message?: {
    content?: string;
  };
};

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error("Local AI timeout")), timeoutMs);
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

async function chatWithLocalModel(config: AIProviderConfig, messages: ChatMessage[], systemPrompt: string): Promise<string> {
  if (!config.baseUrl) {
    throw new Error("Local AI baseUrl is not configured.");
  }

  const response = await withTimeout(
    fetch(`${config.baseUrl.replace(/\/$/, "")}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model ?? "qwen3.5:4b",
        stream: false,
        think: false,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    }),
    // Chat needs more time than structured JSON ops — use at least 30s
    Math.max(config.timeoutMs, 30_000),
  );

  if (!response.ok) {
    throw new Error(`Local AI request failed: ${response.status}`);
  }

  const data = (await response.json()) as OllamaChatResponse;
  const content = data.message?.content;
  if (!content) {
    throw new Error("Local AI returned empty content.");
  }

  return content;
}

async function askLocalModel<T>(config: AIProviderConfig, prompt: string) {
  if (!config.baseUrl) {
    throw new Error("Local AI baseUrl is not configured.");
  }

  const response = await withTimeout(
    fetch(`${config.baseUrl.replace(/\/$/, "")}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model ?? "qwen3.5:4b",
        stream: false,
        think: false,
        messages: [
          {
            role: "system",
            content: "Responde siempre con JSON valido y sin markdown.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    }),
    config.timeoutMs,
  );

  if (!response.ok) {
    throw new Error(`Local AI request failed: ${response.status}`);
  }

  const data = (await response.json()) as OllamaChatResponse;
  const content = data.message?.content;
  if (!content) {
    throw new Error("Local AI returned empty content.");
  }

  return JSON.parse(content) as T;
}

export class LocalAIProvider implements AIProvider {
  constructor(private readonly config: AIProviderConfig) {}

  generateGoalPlan(input: GenerateGoalPlanInput): Promise<GenerateGoalPlanResult> {
    return askLocalModel(this.config, buildGoalPlanPrompt(input));
  }

  refineGoal(input: RefineGoalInput): Promise<GoalRefinementResult> {
    return askLocalModel(this.config, buildRefineGoalPrompt(input));
  }

  suggestMilestones(input: SuggestMilestonesInput): Promise<MilestoneSuggestionResult> {
    return askLocalModel(this.config, buildMilestonesPrompt(input));
  }

  classifyEntry(input: ClassifyEntryInput): Promise<QuickCaptureAnalysis> {
    return askLocalModel(this.config, buildClassifyEntryPrompt(input));
  }

  suggestAchievement(input: SuggestAchievementInput): Promise<AchievementSuggestionResult> {
    return askLocalModel<AchievementSuggestionResult>(this.config, buildAchievementPrompt(input));
  }

  generateWeeklySummary(snapshot: AppSnapshot): Promise<WeeklySummaryResult> {
    return askLocalModel(this.config, buildWeeklySummaryPrompt(snapshot));
  }

  generateMonthlyInsights(snapshot: AppSnapshot): Promise<MonthlyInsightsResult> {
    return askLocalModel(this.config, buildMonthlyInsightsPrompt(snapshot));
  }

  detectStagnation(input: DetectStagnationInput) {
    return askLocalModel<{ items: StagnationResult[] }>(this.config, buildStagnationPrompt(input)).then(
      (result) => result.items,
    );
  }

  suggestPriorities(input: SuggestPrioritiesInput): Promise<PrioritySuggestionResult> {
    return askLocalModel(this.config, buildPrioritiesPrompt(input));
  }

  chat(messages: ChatMessage[], systemPrompt: string): Promise<string> {
    return chatWithLocalModel(this.config, messages, systemPrompt);
  }
}
