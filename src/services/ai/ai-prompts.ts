import type {
  ClassifyEntryInput,
  DetectStagnationInput,
  GenerateGoalPlanInput,
  RefineGoalInput,
  SuggestAchievementInput,
  SuggestMilestonesInput,
  SuggestPrioritiesInput,
} from "@/services/ai/ai-types";
import type { AppSnapshot } from "@/types";

function summarizeSnapshot(snapshot: AppSnapshot) {
  return {
    goals: snapshot.goals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      category: goal.category,
      priority: goal.priority,
      progress: goal.progress,
      targetDate: goal.targetDate,
      whyItMatters: goal.whyItMatters,
    })),
    wins: snapshot.wins.map((win) => ({
      id: win.id,
      title: win.title,
      category: win.category,
      impactLevel: win.impactLevel,
      relatedGoalId: win.relatedGoalId,
    })),
    lifeEvents: snapshot.lifeEvents.map((event) => ({
      id: event.id,
      title: event.title,
      category: event.category,
      impactLevel: event.impactLevel,
    })),
    achievements: snapshot.achievements.map((achievement) => ({
      id: achievement.id,
      title: achievement.title,
      category: achievement.category,
      rarity: achievement.rarity,
    })),
  };
}

export function buildGoalPlanPrompt(input: GenerateGoalPlanInput) {
  return `
Responde solo con JSON valido.
Convierte esta entrada vaga en una estructura operativa de GoalOS.

entrada=${input.note}
focusAreas=${JSON.stringify(input.focusAreas ?? [])}
timeframeHint=${input.timeframeHint ?? ""}

JSON esperado:
{
  "summary": "string",
  "goal": {
    "title": "string",
    "description": "string",
    "category": "string",
    "priority": "low|medium|high|critical",
    "targetDate": "YYYY-MM-DD",
    "difficulty": "steady|stretch|bold",
    "motivation": "string",
    "whyItMatters": "string",
    "timeHorizon": "30_days|90_days|1_year|long_term",
    "color": "aqua|amber|rose|emerald|violet|sky",
    "icon": "string"
  },
  "milestones": [
    { "title": "string", "description": "string", "dueDate": "YYYY-MM-DD" }
  ],
  "habit": {
    "title": "string",
    "category": "string",
    "frequency": "daily|weekdays|weekly",
    "target": 1,
    "color": "aqua|amber|rose|emerald|violet|sky",
    "icon": "string"
  }
}
`.trim();
}

export function buildRefineGoalPrompt(input: RefineGoalInput) {
  return `
Responde solo con JSON valido.
Refina este objetivo para hacerlo mas claro, accionable y medible.

goal=${JSON.stringify(input.goal)}
context=${JSON.stringify(summarizeSnapshot(input.snapshot))}

JSON esperado:
{
  "title": "string",
  "description": "string",
  "category": "string",
  "priority": "low|medium|high|critical",
  "timeHorizon": "30_days|90_days|1_year|long_term",
  "targetDate": "YYYY-MM-DD",
  "motivation": "string",
  "whyItMatters": "string",
  "nextStep": "string"
}
`.trim();
}

export function buildMilestonesPrompt(input: SuggestMilestonesInput) {
  return `
Responde solo con JSON valido.
Sugiere hitos logicos, riesgos y siguiente paso para este goal.

goal=${JSON.stringify(input.goal)}
snapshot=${JSON.stringify(summarizeSnapshot(input.snapshot))}

JSON esperado:
{
  "milestones": [
    {
      "title": "string",
      "description": "string",
      "dueDate": "YYYY-MM-DD",
      "rationale": "string"
    }
  ],
  "risks": ["string"],
  "nextStep": "string"
}
`.trim();
}

export function buildClassifyEntryPrompt(input: ClassifyEntryInput) {
  return `
Responde solo con JSON valido.
Analiza esta captura libre y conviertela en propuestas estructuradas.

note=${input.note}
existingGoals=${JSON.stringify(
    input.snapshot.goals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      category: goal.category,
      priority: goal.priority,
    })),
  )}

JSON esperado:
{
  "input": "string",
  "detectedType": "goal|win|life_event|achievement|insight|mixed",
  "category": "string",
  "confidence": 0,
  "relatedGoalIds": ["string"],
  "suggestedActions": ["string"],
  "summary": "string",
  "suggestedEntities": [
    {
      "type": "goal|win|life_event|achievement|insight",
      "title": "string",
      "description": "string",
      "category": "string",
      "confidence": 0,
      "relatedGoalIds": ["string"],
      "goal": {},
      "win": {},
      "lifeEvent": {},
      "achievement": {},
      "insight": {
        "type": "stagnation|momentum|imbalance|suggestion|achievement_candidate|goal_refinement|focus_recommendation|reflection",
        "severity": "low|medium|high",
        "actionsSuggested": ["string"]
      }
    }
  ]
}
`.trim();
}

export function buildAchievementPrompt(input: SuggestAchievementInput) {
  return `
Responde solo con JSON valido.
Propone un achievement potente a partir de este win.

win=${JSON.stringify(input.win)}
goals=${JSON.stringify(
    input.snapshot.goals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      category: goal.category,
      progress: goal.progress,
    })),
  )}

JSON esperado:
{
  "title": "string",
  "description": "string",
  "category": "string",
  "rarity": "common|rare|epic|legendary",
  "reason": "string",
  "icon": "string",
  "relatedGoalId": "string",
  "confidence": 0
}
`.trim();
}

export function buildWeeklySummaryPrompt(snapshot: AppSnapshot) {
  return `
Responde solo con JSON valido.
Resume la semana con tono elegante, directo y no infantil.

snapshot=${JSON.stringify(summarizeSnapshot(snapshot))}

JSON esperado:
{
  "headline": "string",
  "highlights": ["string"],
  "focus": "string",
  "mainInsight": "string",
  "strongestArea": "string",
  "weakestArea": "string",
  "priorityGoalId": "string"
}
`.trim();
}

export function buildMonthlyInsightsPrompt(snapshot: AppSnapshot) {
  return `
Responde solo con JSON valido.
Interpreta el mes con foco en momentum, imbalance, dispersion y prioridades.

snapshot=${JSON.stringify(summarizeSnapshot(snapshot))}

JSON esperado:
{
  "summary": {
    "headline": "string",
    "momentum": "string",
    "strongestArea": "string",
    "weakestArea": "string",
    "dispersion": "string",
    "priorityFocus": "string",
    "goalToRefine": "string",
    "goalToPause": "string",
    "insights": ["string"]
  },
  "insights": [
    {
      "type": "stagnation|momentum|imbalance|suggestion|achievement_candidate|goal_refinement|focus_recommendation|reflection",
      "title": "string",
      "description": "string",
      "category": "string",
      "severity": "low|medium|high",
      "relatedEntityId": "string",
      "actionsSuggested": ["string"]
    }
  ]
}
`.trim();
}

export function buildStagnationPrompt(input: DetectStagnationInput) {
  return `
Responde solo con JSON valido.
Detecta objetivos estancados y devuelve solo los que requieren atencion.

goalId=${input.goalId ?? ""}
snapshot=${JSON.stringify(summarizeSnapshot(input.snapshot))}

JSON esperado:
{
  "items": [
    {
      "goalId": "string",
      "goalTitle": "string",
      "category": "string",
      "severity": "medium|high",
      "description": "string",
      "nextStep": "string"
    }
  ]
}
`.trim();
}

export function buildChatSystemPrompt(snapshot: AppSnapshot): string {
  const activeGoals = snapshot.goals
    .filter((g) => g.status === "active")
    .map((g) => `- ${g.title} (${g.category}, prioridad: ${g.priority}, progreso: ${g.progress}%)`);

  const activeHabits = snapshot.habits
    .filter((h) => !h.archived)
    .map((h) => `- ${h.title} (${h.frequency})`);

  const recentAchievements = snapshot.achievements
    .slice(-5)
    .map((a) => `- ${a.title} (${a.rarity})`);

  const recentWins = snapshot.wins
    .slice(-5)
    .map((w) => `- ${w.title} (${w.category})`);

  return `Eres el asistente personal de ${snapshot.user.name}. Hablas en español, eres directo, útil y orientado a la acción. Tienes acceso completo a todos los datos de GoalOS de ${snapshot.user.name}.

NORTH STAR: ${snapshot.user.quote}

GOALS ACTIVOS (${activeGoals.length}):
${activeGoals.join("\n") || "- Ninguno"}

HÁBITOS ACTIVOS (${activeHabits.length}):
${activeHabits.join("\n") || "- Ninguno"}

LOGROS RECIENTES:
${recentAchievements.join("\n") || "- Ninguno"}

WINS RECIENTES:
${recentWins.join("\n") || "- Ninguno"}

ESTADÍSTICAS: ${snapshot.wins.length} wins · ${snapshot.lifeEvents.length} eventos · ${snapshot.achievements.length} logros

Responde siempre en español. Sé conciso y directo. Cuando hagas recomendaciones, basa las en los datos reales del usuario.`.trim();
}

export function buildPrioritiesPrompt(input: SuggestPrioritiesInput) {
  return `
Responde solo con JSON valido.
Sugiere que goal priorizar ahora, cual pausar y cual redefinir.

snapshot=${JSON.stringify(summarizeSnapshot(input.snapshot))}

JSON esperado:
{
  "headline": "string",
  "primaryGoalId": "string",
  "primaryGoalTitle": "string",
  "reason": "string",
  "pauseGoalIds": ["string"],
  "reframeGoalIds": ["string"],
  "strongestArea": "string",
  "weakestArea": "string"
}
`.trim();
}
