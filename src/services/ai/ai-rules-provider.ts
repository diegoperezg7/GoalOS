import type { AIProvider } from "@/services/ai/ai-provider";
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
  SuggestAchievementInput,
  SuggestMilestonesInput,
  SuggestPrioritiesInput,
  WeeklySummaryResult,
} from "@/services/ai/ai-types";
import type {
  AchievementInput,
  AppSnapshot,
  EventImpact,
  Goal,
  GoalInput,
  GoalPriority,
  GoalTimeHorizon,
  HabitInput,
  WinInput,
} from "@/types";
import { addDays, daysFromNowIso, differenceInDays, getTodayKey } from "@/utils/date";

const categoryKeywords: Record<string, string[]> = {
  carrera: ["career", "senior", "trabajo", "salario", "sueldo", "promoc", "rol", "equipo", "lider", "cliente"],
  finanzas: ["dinero", "ahorro", "bonus", "eur", "euro", "finanzas", "invers", "fondo", "salario", "sueldo"],
  projects: ["app", "producto", "proyecto", "lanz", "build", "startup", "side project", "negocio"],
  personal: ["vida", "claridad", "orden", "personal", "balance", "familia", "rutina"],
  salud: ["salud", "entren", "gym", "descanso", "energia", "sueño", "caminar"],
  aprendizaje: ["certific", "curso", "aprender", "cloud", "estudiar", "skill"],
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function titleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function detectCategory(note: string) {
  const normalized = normalize(note);
  const match = Object.entries(categoryKeywords)
    .map(([category, words]) => ({
      category,
      score: words.reduce((total, word) => total + Number(normalized.includes(normalize(word))), 0),
    }))
    .sort((left, right) => right.score - left.score)[0];

  return match && match.score > 0 ? match.category : "personal";
}

function detectTimeHorizon(note: string): GoalTimeHorizon {
  const normalized = normalize(note);
  if (normalized.includes("ano") || normalized.includes("year")) return "1_year";
  if (normalized.includes("mes") || normalized.includes("month") || normalized.includes("trimestre")) return "90_days";
  if (normalized.includes("largo") || normalized.includes("grande")) return "long_term";
  return "90_days";
}

function detectPriority(note: string): GoalPriority {
  const normalized = normalize(note);
  if (normalized.includes("urgente") || normalized.includes("critico") || normalized.includes("ya")) return "critical";
  if (normalized.includes("quiero") || normalized.includes("necesito")) return "high";
  return "medium";
}

function detectColor(category: string): GoalInput["color"] {
  if (category === "carrera") return "amber";
  if (category === "finanzas") return "emerald";
  if (category === "projects") return "violet";
  if (category === "salud") return "aqua";
  if (category === "aprendizaje") return "sky";
  return "rose";
}

function detectIcon(category: string) {
  if (category === "carrera") return "BriefcaseBusiness";
  if (category === "finanzas") return "PiggyBank";
  if (category === "projects") return "Rocket";
  if (category === "salud") return "HeartPulse";
  if (category === "aprendizaje") return "GraduationCap";
  return "Compass";
}

function deriveTargetDate(horizon: GoalTimeHorizon) {
  if (horizon === "30_days") return daysFromNowIso(30);
  if (horizon === "1_year") return daysFromNowIso(365);
  if (horizon === "long_term") return daysFromNowIso(540);
  return daysFromNowIso(90);
}

function cleanSentence(note: string) {
  return note.trim().replace(/\.$/, "");
}

function createGoalDraftFromNote(note: string): GoalInput {
  const category = detectCategory(note);
  const timeHorizon = detectTimeHorizon(note);
  const cleaned = cleanSentence(note);
  const title = cleaned.toLowerCase().startsWith("quiero")
    ? `Construir ${cleaned.slice(6).trim()}`
    : cleaned.toLowerCase().startsWith("necesito")
      ? `Ordenar ${cleaned.slice(8).trim()}`
      : titleCase(cleaned);

  return {
    title: titleCase(title),
    description: `Definir un resultado claro y visible para ${cleaned.toLowerCase()}.`,
    category,
    priority: detectPriority(note),
    targetDate: deriveTargetDate(timeHorizon),
    difficulty: timeHorizon === "long_term" ? "bold" : "stretch",
    motivation: `Quiero mover ${category} con una narrativa más clara y una ejecución visible.`,
    whyItMatters: `Esto importa porque ${cleaned.toLowerCase()} afecta la calidad de mis decisiones y mi tracción real.`,
    timeHorizon,
    color: detectColor(category),
    icon: detectIcon(category),
  };
}

function createHabitDraftFromGoal(goal: GoalInput): HabitInput {
  return {
    title:
      goal.category === "salud"
        ? "Bloque de energía diaria"
        : goal.category === "carrera"
          ? "Bloque de trabajo estratégico"
          : "Bloque de claridad diaria",
    category: goal.category,
    frequency: "daily",
    target: 1,
    color: goal.color,
    icon: goal.category === "salud" ? "Sparkles" : "TimerReset",
  };
}

function buildMilestones(goal: GoalInput | Goal) {
  const horizonDays =
    goal.timeHorizon === "30_days" ? 30 : goal.timeHorizon === "1_year" ? 365 : goal.timeHorizon === "long_term" ? 540 : 90;
  const slices = [0.25, 0.55, 0.85];
  const labels = [
    "Aterrizar definición y métrica del resultado",
    "Publicar una evidencia visible de progreso",
    "Cerrar revisión y consolidar el siguiente tramo",
  ];

  return labels.map((label, index) => ({
    title: `${label} en ${goal.category}`,
    description:
      index === 0
        ? "Eliminar ambigüedad y fijar una señal de avance."
        : index === 1
          ? "Convertir el trabajo en una prueba externa o medible."
          : "Cerrar el tramo con aprendizaje y criterio de continuidad.",
    dueDate: getTodayKey(addDays(new Date(), Math.round(horizonDays * slices[index]))),
    rationale:
      index === 0
        ? "Sin claridad inicial el objetivo se dispersa."
        : index === 1
          ? "La evidencia visible acelera el momentum."
          : "La revisión final evita progreso difuso.",
  }));
}

function detectImpact(note: string): EventImpact {
  const normalized = normalize(note);
  if (
    normalized.includes("subido") ||
    normalized.includes("bonus") ||
    normalized.includes("promoc") ||
    normalized.includes("app") ||
    normalized.includes("lanz")
  ) {
    return "high";
  }
  if (normalized.includes("mud") || normalized.includes("bebe") || normalized.includes("boda")) {
    return "life_changing";
  }
  return "medium";
}

function isGoalLike(note: string) {
  const normalized = normalize(note);
  return ["quiero", "necesito", "me gustaria", "construir", "ordenar", "ser ", "llegar"].some((word) =>
    normalized.includes(word),
  );
}

function isWinLike(note: string) {
  const normalized = normalize(note);
  return ["he ", "hoy ", "me han", "cerr", "lanz", "subid", "confirm", "bonus", "ascenso", "promoc"].some((word) =>
    normalized.includes(word),
  );
}

function isLifeEventLike(note: string) {
  const normalized = normalize(note);
  return ["mudanza", "hijo", "bebe", "boda", "despido", "nuevo trabajo", "cambio", "contrato"].some((word) =>
    normalized.includes(word),
  );
}

function scoreGoalRelation(note: string, goal: Goal) {
  const normalized = normalize(note);
  let score = 0;
  if (normalized.includes(normalize(goal.category))) score += 2;
  goal.title
    .split(" ")
    .filter((word) => word.length >= 4)
    .forEach((word) => {
      if (normalized.includes(normalize(word))) score += 1;
    });
  return score;
}

function findRelatedGoalIds(note: string, snapshot: AppSnapshot) {
  return snapshot.goals
    .map((goal) => ({
      id: goal.id,
      score: scoreGoalRelation(note, goal),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 2)
    .map((item) => item.id);
}

function createWinDraft(note: string, relatedGoalIds: string[]): WinInput {
  const category = detectCategory(note);
  return {
    title: titleCase(cleanSentence(note)),
    description: `${titleCase(cleanSentence(note))}. Conviene dejar esta señal registrada porque cambia la narrativa reciente de ${category}.`,
    date: getTodayKey(),
    category,
    impactLevel: detectImpact(note),
    relatedGoalId: relatedGoalIds[0],
    reflection: `Esta victoria merece quedar registrada porque aporta señal real en ${category}.`,
    source: "ai",
  };
}

function createLifeEventDraft(note: string, relatedGoalIds: string[]) {
  const category = detectCategory(note);
  return {
    title: titleCase(cleanSentence(note)),
    description: `${titleCase(cleanSentence(note))}. Este cambio altera contexto, opciones o ritmo de ejecución.`,
    date: getTodayKey(),
    category,
    impactLevel: detectImpact(note),
    tags: [category],
    relatedGoalId: relatedGoalIds[0],
    reflection: `Conviene leer este evento como una señal estructural para ${category}.`,
    source: "ai" as const,
  };
}

function createAchievementSuggestionFromWin(win: WinInput): AchievementInput {
  const normalized = normalize(`${win.title} ${win.description}`);
  if (normalized.includes("salario") || normalized.includes("sueldo") || normalized.includes("bonus")) {
    return {
      title: "Career Leap",
      description: "Convertiste impacto profesional en una mejora tangible de compensación.",
      category: "carrera",
      rarity: "epic",
      icon: "Award",
      type: "ai_suggested",
      relatedGoalId: win.relatedGoalId,
      significanceNote: "No es solo un win puntual: cambia tu posicionamiento y tu margen de decisión.",
      confidence: 90,
    };
  }

  if (normalized.includes("app") || normalized.includes("launch") || normalized.includes("lanz")) {
    return {
      title: "Shipped Into Reality",
      description: "Convertiste trabajo en una entrega visible y real.",
      category: "projects",
      rarity: "rare",
      icon: "Rocket",
      type: "ai_suggested",
      relatedGoalId: win.relatedGoalId,
      significanceNote: "Publicar cambia el nivel de señal del proyecto.",
      confidence: 84,
    };
  }

  return {
    title: "Momentum Captured",
    description: "Registraste una señal de avance con suficiente peso narrativo como para conservarla.",
    category: win.category,
    rarity: "rare",
    icon: "Sparkles",
    type: "ai_suggested",
    relatedGoalId: win.relatedGoalId,
    significanceNote: "Reconocer el patrón correcto refuerza el sistema.",
    confidence: 78,
  };
}

function getStrongestAndWeakestAreas(snapshot: AppSnapshot) {
  const areas = snapshot.goals.reduce<Record<string, number[]>>((acc, goal) => {
    acc[goal.category] ??= [];
    acc[goal.category].push(goal.progress);
    return acc;
  }, {});

  const sorted = Object.entries(areas)
    .map(([category, values]) => ({
      category,
      average: values.reduce((sum, value) => sum + value, 0) / values.length,
    }))
    .sort((left, right) => right.average - left.average);

  return {
    strongestArea: sorted[0]?.category,
    weakestArea: sorted[sorted.length - 1]?.category,
  };
}

function getLatestProgressDate(goalId: string, snapshot: AppSnapshot) {
  return snapshot.progressEntries
    .filter((entry) => entry.goalId === goalId)
    .sort((left, right) => right.date.localeCompare(left.date))[0]?.date;
}

export class RulesAIProvider implements AIProvider {
  async generateGoalPlan(input: GenerateGoalPlanInput): Promise<GenerateGoalPlanResult> {
    const goal = createGoalDraftFromNote(input.note);

    return {
      summary: `La IA convirtió tu intención en una meta más operativa dentro de ${goal.category}.`,
      goal,
      milestones: buildMilestones(goal).map((item) => ({
        title: item.title,
        description: item.description,
        dueDate: item.dueDate,
      })),
      habit: createHabitDraftFromGoal(goal),
      focusAreas: input.focusAreas?.length ? input.focusAreas : [goal.category],
    };
  }

  async refineGoal(input: RefineGoalInput): Promise<GoalRefinementResult> {
    const refinedGoal = createGoalDraftFromNote(`${input.goal.title}. ${input.goal.description}`);

    return {
      title: refinedGoal.title,
      description: `${refinedGoal.description} Señal mínima: una evidencia visible cada 2 semanas.`,
      category: refinedGoal.category,
      priority: input.goal.priority,
      timeHorizon: input.goal.timeHorizon,
      targetDate: input.goal.targetDate,
      motivation: input.goal.motivation || refinedGoal.motivation,
      whyItMatters: input.goal.whyItMatters || refinedGoal.whyItMatters,
      nextStep: "Reduce el objetivo a un entregable visible para los próximos 7 días.",
    };
  }

  async suggestMilestones(input: SuggestMilestonesInput): Promise<MilestoneSuggestionResult> {
    return {
      milestones: buildMilestones(input.goal),
      risks: [
        "La ambigüedad actual puede esconder dispersión.",
        "Hay riesgo de trabajar sin una evidencia visible del avance.",
      ],
      nextStep: "Convierte el primer hito en una sesión de menos de 30 minutos.",
    };
  }

  async classifyEntry(input: ClassifyEntryInput): Promise<QuickCaptureAnalysis> {
    const category = detectCategory(input.note);
    const relatedGoalIds = findRelatedGoalIds(input.note, input.snapshot);
    const suggestedEntities: QuickCaptureAnalysis["suggestedEntities"] = [];

    if (isGoalLike(input.note)) {
      const goal = createGoalDraftFromNote(input.note);
      suggestedEntities.push({
        type: "goal",
        title: goal.title,
        description: goal.description,
        category: goal.category,
        confidence: 0.89,
        relatedGoalIds,
        goal,
      });

      if (normalize(input.note).includes("claridad") || normalize(input.note).includes("orden")) {
        suggestedEntities.push({
          type: "insight",
          title: "Esto apunta a falta de definición",
          description: "Tu nota sugiere que no te falta ambición, sino una estructura más concreta.",
          category,
          confidence: 0.75,
          relatedGoalIds,
          insight: {
            type: "reflection",
            severity: "medium",
            actionsSuggested: ["Convertir la intención en un goal con hitos iniciales."],
          },
        });
      }
    }

    if (isWinLike(input.note)) {
      const win = createWinDraft(input.note, relatedGoalIds);
      suggestedEntities.push({
        type: "win",
        title: win.title,
        description: win.description,
        category: win.category,
        confidence: 0.92,
        relatedGoalIds,
        win,
      });

      if (isLifeEventLike(input.note) || win.impactLevel === "high") {
        suggestedEntities.push({
          type: "life_event",
          title: win.title,
          description: "También puede leerse como un cambio relevante en tu trayectoria reciente.",
          category: win.category,
          confidence: 0.72,
          relatedGoalIds,
          lifeEvent: createLifeEventDraft(input.note, relatedGoalIds),
        });
      }

      if (win.impactLevel === "high" || win.impactLevel === "life_changing") {
        suggestedEntities.push({
          type: "achievement",
          title: createAchievementSuggestionFromWin(win).title,
          description: createAchievementSuggestionFromWin(win).description,
          category: win.category,
          confidence: 0.8,
          relatedGoalIds,
          achievement: createAchievementSuggestionFromWin(win),
        });
      }
    }

    if (suggestedEntities.length === 0) {
      suggestedEntities.push({
        type: "insight",
        title: "Esto merece una lectura más concreta",
        description: "La nota sugiere una necesidad real, pero todavía está poco definida.",
        category,
        confidence: 0.64,
        relatedGoalIds,
        insight: {
          type: "reflection",
          severity: "low",
          actionsSuggested: ["Describir qué cambio visible quieres dentro de 30 o 90 días."],
        },
      });
    }

    return {
      input: input.note,
      detectedType: suggestedEntities.length > 1 ? "mixed" : suggestedEntities[0].type,
      category,
      confidence: Math.max(...suggestedEntities.map((entity) => entity.confidence)),
      relatedGoalIds,
      suggestedEntities,
      suggestedActions: [
        "Aceptar la sugerencia principal",
        "Editar antes de guardar",
        "Vincularlo con un goal existente",
      ],
      summary: `La captura apunta sobre todo a ${category} y puede convertirse en ${suggestedEntities
        .map((entity) => entity.type)
        .join(", ")}.`,
    };
  }

  async suggestAchievement(input: SuggestAchievementInput): Promise<AchievementSuggestionResult> {
    const draft = createAchievementSuggestionFromWin({
      title: input.win.title,
      description: input.win.description,
      date: input.win.date,
      category: input.win.category,
      impactLevel: input.win.impactLevel,
      relatedGoalId: input.win.relatedGoalId,
      reflection: input.win.reflection,
      source: input.win.source,
    });

    return {
      title: draft.title,
      description: draft.description,
      category: draft.category,
      rarity: draft.rarity,
      reason: draft.significanceNote ?? draft.description,
      icon: draft.icon,
      relatedGoalId: draft.relatedGoalId,
      confidence: (draft.confidence ?? 78) / 100,
    };
  }

  async generateWeeklySummary(snapshot: AppSnapshot): Promise<WeeklySummaryResult> {
    const activeGoals = snapshot.goals.filter((goal) => goal.status === "active");
    const recentWins = snapshot.wins.filter((win) => differenceInDays(getTodayKey(), win.date) <= 7);
    const { strongestArea, weakestArea } = getStrongestAndWeakestAreas(snapshot);
    const priorityGoal = activeGoals
      .slice()
      .sort((left, right) => {
        const priorityScore = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityScore[right.priority] - priorityScore[left.priority] || left.targetDate.localeCompare(right.targetDate);
      })[0];

    return {
      headline: recentWins.length > 0 ? "Tu semana tiene señales de avance con peso real." : "La semana pide una victoria visible.",
      highlights: [
        `${activeGoals.length} objetivos activos siguen moviendo el sistema.`,
        `${snapshot.progressEntries.filter((entry) => differenceInDays(getTodayKey(), entry.date) <= 7).length} registros de progreso entraron esta semana.`,
        `${recentWins.length} wins recientes refuerzan la narrativa de avance.`,
      ],
      focus: priorityGoal
        ? `Pon foco en ${priorityGoal.title} antes de abrir un frente nuevo.`
        : "Conviene definir un objetivo prioritario antes de repartir energía.",
      mainInsight: strongestArea && weakestArea && strongestArea !== weakestArea
        ? `${strongestArea} gana tracción, mientras ${weakestArea} necesita atención.`
        : "El sistema necesita una señal más visible de progreso para consolidar momentum.",
      strongestArea,
      weakestArea,
      priorityGoalId: priorityGoal?.id,
    };
  }

  async generateMonthlyInsights(snapshot: AppSnapshot): Promise<MonthlyInsightsResult> {
    const { strongestArea, weakestArea } = getStrongestAndWeakestAreas(snapshot);
    const stalled = await this.detectStagnation({ snapshot });
    const priorities = await this.suggestPriorities({ snapshot });

    return {
      summary: {
        headline: "El mes muestra una mezcla de tracción real y dispersión evitable.",
        momentum:
          snapshot.wins.length >= 2
            ? "Hay enough momentum en forma de wins recientes y progreso visible."
            : "El progreso existe, pero falta convertirlo en más evidencias visibles.",
        strongestArea,
        weakestArea,
        dispersion: priorities.pauseGoalIds.length > 0 ? "Hay demasiados frentes activos para el foco actual." : "La dispersión está contenida.",
        priorityFocus: priorities.reason,
        goalToRefine: snapshot.goals.find((goal) => priorities.reframeGoalIds.includes(goal.id))?.title,
        goalToPause: snapshot.goals.find((goal) => priorities.pauseGoalIds.includes(goal.id))?.title,
        insights: [
          stalled[0]?.description ?? "No hay una meta claramente abandonada, pero sí margen para concretar foco.",
          strongestArea && weakestArea && strongestArea !== weakestArea
            ? `${strongestArea} supera a ${weakestArea} con suficiente distancia como para requerir corrección.`
            : "No hay imbalance fuerte entre áreas.",
        ],
      },
      insights: [
        ...(stalled.length
          ? stalled.map((item) => ({
              type: "stagnation" as const,
              title: `${item.goalTitle} necesita redefinición`,
              description: item.description,
              category: item.category,
              severity: item.severity,
              relatedEntityId: item.goalId,
              actionsSuggested: ["Reformular objetivo", "Definir siguiente paso"],
            }))
          : []),
        {
          type: "focus_recommendation" as const,
          title: priorities.headline,
          description: priorities.reason,
          category: priorities.weakestArea ?? "focus",
          severity: "medium",
          relatedEntityId: priorities.primaryGoalId,
          actionsSuggested: ["Revisar foco semanal"],
        },
      ],
    };
  }

  async detectStagnation(input: DetectStagnationInput) {
    const goals = input.goalId
      ? input.snapshot.goals.filter((goal) => goal.id === input.goalId)
      : input.snapshot.goals;

    return goals
      .filter((goal) => goal.status === "active")
      .map((goal) => {
        const latestDate = getLatestProgressDate(goal.id, input.snapshot);
        const missingMilestones = goal.milestoneIds.length === 0;
        const noRecentProgress = latestDate ? differenceInDays(getTodayKey(), latestDate) >= 14 : true;

        if (!missingMilestones && !noRecentProgress) {
          return null;
        }

        return {
          goalId: goal.id,
          goalTitle: goal.title,
          category: goal.category,
          severity: noRecentProgress ? "high" : "medium",
          description: noRecentProgress
            ? "Lleva al menos dos semanas sin una señal reciente de avance."
            : "Todavía no tiene hitos suficientes para sostener ejecución.",
          nextStep: missingMilestones
            ? "Define el siguiente hito antes de cerrar hoy."
            : "Registra un micro-avance visible en menos de 25 minutos.",
        };
      })
      .filter(Boolean)
      .slice(0, 3) as Awaited<ReturnType<AIProvider["detectStagnation"]>>;
  }

  async suggestPriorities(input: SuggestPrioritiesInput): Promise<PrioritySuggestionResult> {
    const activeGoals = input.snapshot.goals.filter((goal) => goal.status === "active");
    const priorities = { critical: 4, high: 3, medium: 2, low: 1 } as const;
    const ranked = activeGoals
      .map((goal) => {
        const dueSoon = Math.max(0, 120 - differenceInDays(goal.targetDate, getTodayKey()));
        const score = priorities[goal.priority] * 20 + goal.progress + dueSoon;
        return {
          goal,
          score,
        };
      })
      .sort((left, right) => right.score - left.score);

    const { strongestArea, weakestArea } = getStrongestAndWeakestAreas(input.snapshot);
    const primary = ranked[0]?.goal;
    const pauseCandidate = ranked.length > 4 ? ranked[ranked.length - 1]?.goal : undefined;
    const reframeCandidate = activeGoals.find((goal) => goal.progress < 20 && goal.title.split(" ").length <= 3);

    return {
      headline: primary ? `Ahora conviene priorizar ${primary.title}.` : "Conviene definir un foco prioritario.",
      primaryGoalId: primary?.id,
      primaryGoalTitle: primary?.title,
      reason: primary
        ? `Combina prioridad ${primary.priority}, proximidad temporal y mejor retorno esperado en ${primary.category}.`
        : "Sin un objetivo principal, el sistema se fragmenta.",
      pauseGoalIds: pauseCandidate ? [pauseCandidate.id] : [],
      reframeGoalIds: reframeCandidate ? [reframeCandidate.id] : [],
      strongestArea,
      weakestArea,
    };
  }
}
