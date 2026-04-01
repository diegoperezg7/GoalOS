import type { AIProvider } from "@/services/ai/ai-provider";
import { FallbackAIProvider } from "@/services/ai/ai-fallback-provider";
import { LocalAIProvider } from "@/services/ai/ai-local-provider";
import { RemoteAIProvider } from "@/services/ai/ai-remote-provider";
import { RulesAIProvider } from "@/services/ai/ai-rules-provider";
import type {
  AIProviderConfig,
  ChatMessage,
  ClassifyEntryInput,
  DetectStagnationInput,
  GenerateGoalPlanInput,
  RefineGoalInput,
  SuggestAchievementInput,
  SuggestMilestonesInput,
  SuggestPrioritiesInput,
} from "@/services/ai/ai-types";
import type { AppSnapshot } from "@/types";

function resolveProviderKind(value?: string): AIProviderConfig["provider"] {
  if (value === "local" || value === "ollama") return "local";
  if (value === "remote" || value === "external") return "remote";
  return "rules";
}

function sanitizeBrowserBaseUrl(value?: string) {
  if (!value) return undefined;
  if (typeof window === "undefined") return value;

  try {
    const resolved = new URL(value, window.location.href);
    if (window.location.protocol === "https:" && resolved.protocol === "http:") {
      return undefined;
    }
    return resolved.toString().replace(/\/$/, "");
  } catch {
    return undefined;
  }
}

export function resolveAIConfig(): AIProviderConfig {
  const requestedProvider = resolveProviderKind(import.meta.env.VITE_AI_PROVIDER);
  const timeoutMs = Number(import.meta.env.VITE_AI_TIMEOUT_MS ?? "6500");
  const localBase = sanitizeBrowserBaseUrl(import.meta.env.VITE_OLLAMA_BASE_URL ?? import.meta.env.VITE_AI_LOCAL_BASE_URL);
  const remoteBase = sanitizeBrowserBaseUrl(import.meta.env.VITE_AI_API_BASE_URL);
  let provider = requestedProvider;

  if (provider === "local" && !localBase) {
    provider = remoteBase ? "remote" : "rules";
  }

  if (provider === "remote" && !remoteBase) {
    provider = localBase ? "local" : "rules";
  }

  return {
    provider,
    baseUrl: provider === "local" ? localBase : provider === "remote" ? remoteBase : undefined,
    model: provider === "local" ? import.meta.env.VITE_OLLAMA_MODEL ?? "qwen3.5:4b" : import.meta.env.VITE_AI_MODEL,
    timeoutMs: Number.isFinite(timeoutMs) ? timeoutMs : 6500,
    fallbackEnabled: (import.meta.env.VITE_AI_FALLBACK_ENABLED ?? "true") !== "false",
  };
}

function createProvider(config: AIProviderConfig): AIProvider {
  if (config.provider === "local") {
    return new LocalAIProvider(config);
  }

  if (config.provider === "remote") {
    return new RemoteAIProvider(config);
  }

  return new RulesAIProvider();
}

function createFallbackChain(config: AIProviderConfig) {
  const providers: AIProvider[] = [createProvider(config)];

  if (config.fallbackEnabled) {
    const safeRemoteBase = sanitizeBrowserBaseUrl(import.meta.env.VITE_AI_API_BASE_URL);
    if (config.provider === "local" && safeRemoteBase) {
      providers.push(
        new RemoteAIProvider({
          provider: "remote",
          baseUrl: safeRemoteBase,
          model: import.meta.env.VITE_AI_MODEL,
          timeoutMs: config.timeoutMs,
          fallbackEnabled: false,
        }),
      );
    }

    providers.push(new RulesAIProvider());
  }

  return new FallbackAIProvider(providers);
}

export class AIOrchestrator {
  constructor(private readonly provider: AIProvider = createFallbackChain(resolveAIConfig())) {}

  generateGoalPlan(input: GenerateGoalPlanInput) {
    return this.provider.generateGoalPlan(input);
  }

  refineGoal(input: RefineGoalInput) {
    return this.provider.refineGoal(input);
  }

  suggestMilestones(input: SuggestMilestonesInput) {
    return this.provider.suggestMilestones(input);
  }

  classifyEntry(input: ClassifyEntryInput) {
    return this.provider.classifyEntry(input);
  }

  suggestAchievement(input: SuggestAchievementInput) {
    return this.provider.suggestAchievement(input);
  }

  generateWeeklySummary(snapshot: AppSnapshot) {
    return this.provider.generateWeeklySummary(snapshot);
  }

  generateMonthlyInsights(snapshot: AppSnapshot) {
    return this.provider.generateMonthlyInsights(snapshot);
  }

  detectStagnation(input: DetectStagnationInput) {
    return this.provider.detectStagnation(input);
  }

  suggestPriorities(input: SuggestPrioritiesInput) {
    return this.provider.suggestPriorities(input);
  }

  chat(messages: ChatMessage[], systemPrompt: string): Promise<string> {
    const config = resolveAIConfig();
    if (config.provider === "local" && config.baseUrl) {
      const localProvider = new LocalAIProvider(config);
      return localProvider.chat(messages, systemPrompt);
    }
    return Promise.reject(new Error("Chat requiere que Ollama esté configurado y activo."));
  }
}

export const aiOrchestrator = new AIOrchestrator();
