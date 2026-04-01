import type {
  AchievementInput,
  AIInsight,
  AIInsightAction,
  AIInsightSeverity,
  AIInsightType,
  GoalInput,
  LifeEventInput,
  WinInput,
} from "@/types";
import type {
  AchievementSuggestionResult,
  GoalRefinementResult,
  MonthlyInsightsResult,
  PrioritySuggestionResult,
  QuickCaptureAnalysis,
  StagnationResult,
} from "@/services/ai/ai-types";
import { getTodayKey } from "@/utils/date";
import { createId } from "@/utils/id";

function buildActions(targetType?: AIInsightAction["targetType"], includeEdit = true): AIInsightAction[] {
  const actions: AIInsightAction[] = [];

  if (targetType) {
    actions.push({
      id: createId("ai_action"),
      label: "Aceptar",
      kind: "accept",
      targetType,
    });
    if (includeEdit) {
      actions.push({
        id: createId("ai_action"),
        label: "Editar",
        kind: "edit",
        targetType,
      });
    }
  }

  actions.push({
    id: createId("ai_action"),
    label: "Posponer",
    kind: "postpone",
    targetType,
  });
  actions.push({
    id: createId("ai_action"),
    label: "Descartar",
    kind: "dismiss",
    targetType,
  });

  return actions;
}

export function buildInsight(input: {
  type: AIInsightType;
  title: string;
  description: string;
  category: string;
  severity: AIInsightSeverity;
  relatedEntityId?: string;
  relatedEntityType?: AIInsight["relatedEntityType"];
  actionsSuggested?: AIInsightAction[];
  payload?: Record<string, unknown>;
}): AIInsight {
  return {
    id: createId("insight"),
    createdAt: getTodayKey(),
    dismissed: false,
    accepted: false,
    actionsSuggested: input.actionsSuggested ?? buildActions(),
    ...input,
  };
}

export function mapQuickCaptureToInsights(result: QuickCaptureAnalysis) {
  return result.suggestedEntities.map((entity) =>
    buildInsight({
      type: entity.type === "achievement" ? "achievement_candidate" : entity.type === "goal" ? "suggestion" : entity.type === "insight" ? entity.insight?.type ?? "reflection" : "suggestion",
      title: entity.title,
      description: entity.description,
      category: entity.category,
      severity: entity.confidence >= 0.82 ? "high" : entity.confidence >= 0.65 ? "medium" : "low",
      relatedEntityId: entity.relatedGoalIds[0],
      relatedEntityType: entity.type === "insight" ? "dashboard" : entity.type,
      actionsSuggested:
        entity.type === "insight"
          ? buildActions(undefined, false)
          : buildActions(entity.type),
      payload:
        entity.type === "goal" && entity.goal
          ? { entityType: "goal", draft: entity.goal, source: "quick_capture" }
          : entity.type === "win" && entity.win
            ? { entityType: "win", draft: entity.win, source: "quick_capture" }
            : entity.type === "life_event" && entity.lifeEvent
              ? { entityType: "life_event", draft: entity.lifeEvent, source: "quick_capture" }
              : entity.type === "achievement" && entity.achievement
                ? { entityType: "achievement", draft: entity.achievement, source: "quick_capture" }
                : entity.type === "insight" && entity.insight
                  ? { entityType: "insight", source: "quick_capture", actionsSuggested: entity.insight.actionsSuggested }
                  : undefined,
    }),
  );
}

export function mapGoalRefinementToInsight(goalId: string, result: GoalRefinementResult) {
  return buildInsight({
    type: "goal_refinement",
    title: `Refinar ${result.title}`,
    description: result.nextStep,
    category: result.category,
    severity: "medium",
    relatedEntityId: goalId,
    relatedEntityType: "goal",
    actionsSuggested: buildActions("goal"),
    payload: {
      entityType: "goal",
      draft: {
        title: result.title,
        description: result.description,
        category: result.category,
        priority: result.priority,
        targetDate: result.targetDate,
        difficulty: "stretch",
        motivation: result.motivation,
        whyItMatters: result.whyItMatters,
        timeHorizon: result.timeHorizon,
        color: "aqua",
        icon: "Target",
      } satisfies GoalInput,
      source: "goal_refinement",
    },
  });
}

export function mapStagnationToInsights(results: StagnationResult[]) {
  return results.map((item) =>
    buildInsight({
      type: "stagnation",
      title: `${item.goalTitle} necesita atención`,
      description: `${item.description} ${item.nextStep}`,
      category: item.category,
      severity: item.severity,
      relatedEntityId: item.goalId,
      relatedEntityType: "goal",
      actionsSuggested: [
        {
          id: createId("ai_action"),
          label: "Abrir goal",
          kind: "open",
          targetType: "goal",
        },
        ...buildActions(undefined, false),
      ],
      payload: {
        goalId: item.goalId,
        source: "stagnation",
      },
    }),
  );
}

export function mapPriorityToInsights(result: PrioritySuggestionResult) {
  const insights: AIInsight[] = [
    buildInsight({
      type: "focus_recommendation",
      title: result.headline,
      description: result.reason,
      category: result.strongestArea ?? "focus",
      severity: "medium",
      relatedEntityId: result.primaryGoalId,
      relatedEntityType: "goal",
      actionsSuggested: [
        {
          id: createId("ai_action"),
          label: "Abrir goal",
          kind: "open",
          targetType: "goal",
        },
        ...buildActions(undefined, false),
      ],
      payload: {
        goalId: result.primaryGoalId,
        goalTitle: result.primaryGoalTitle,
        source: "priorities",
      },
    }),
  ];

  if (result.strongestArea && result.weakestArea && result.strongestArea !== result.weakestArea) {
    insights.push(
      buildInsight({
        type: "imbalance",
        title: "Hay desequilibrio entre áreas",
        description: `${result.strongestArea} gana tracción mientras ${result.weakestArea} pierde presencia.`,
        category: result.weakestArea,
        severity: "medium",
        relatedEntityType: "analytics",
        actionsSuggested: buildActions(undefined, false),
        payload: {
          strongestArea: result.strongestArea,
          weakestArea: result.weakestArea,
          source: "priorities",
        },
      }),
    );
  }

  return insights;
}

export function mapAchievementSuggestionToInsight(winId: string, suggestion: AchievementSuggestionResult) {
  return buildInsight({
    type: "achievement_candidate",
    title: suggestion.title,
    description: suggestion.reason,
    category: suggestion.category,
    severity: suggestion.confidence >= 0.85 ? "high" : "medium",
    relatedEntityId: winId,
    relatedEntityType: "win",
    actionsSuggested: buildActions("achievement"),
    payload: {
      entityType: "achievement",
      draft: {
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category,
        rarity: suggestion.rarity,
        icon: suggestion.icon,
        type: "ai_suggested",
        relatedGoalId: suggestion.relatedGoalId,
        significanceNote: suggestion.reason,
        confidence: Math.round(suggestion.confidence * 100),
      } satisfies AchievementInput,
      source: "achievement_suggestion",
    },
  });
}

export function mapMonthlyInsights(result: MonthlyInsightsResult) {
  return result.insights.map((insight) =>
    buildInsight({
      type: insight.type,
      title: insight.title,
      description: insight.description,
      category: insight.category,
      severity: insight.severity,
      relatedEntityId: insight.relatedEntityId,
      actionsSuggested: buildActions(undefined, false),
      payload: {
        summary: result.summary.headline,
        source: "monthly_review",
      },
    }),
  );
}

export function readGoalDraft(payload?: Record<string, unknown>) {
  if (!payload || payload.entityType !== "goal") {
    return null;
  }

  return payload.draft as GoalInput;
}

export function readWinDraft(payload?: Record<string, unknown>) {
  if (!payload || payload.entityType !== "win") {
    return null;
  }

  return payload.draft as WinInput;
}

export function readLifeEventDraft(payload?: Record<string, unknown>) {
  if (!payload || payload.entityType !== "life_event") {
    return null;
  }

  return payload.draft as LifeEventInput;
}

export function readAchievementDraft(payload?: Record<string, unknown>) {
  if (!payload || payload.entityType !== "achievement") {
    return null;
  }

  return payload.draft as AchievementInput;
}
