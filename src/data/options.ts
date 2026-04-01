import type {
  ColorToken,
  EventImpact,
  GoalDifficulty,
  GoalPriority,
  GoalTimeHorizon,
  HabitFrequency,
  TaskPriority,
} from "@/types";

export const focusAreaOptions = [
  "carrera",
  "finanzas",
  "proyectos",
  "personal",
  "salud",
  "aprendizaje",
  "relaciones",
];

export const goalPriorityOptions: GoalPriority[] = ["medium", "high", "critical", "low"];
export const goalDifficultyOptions: GoalDifficulty[] = ["steady", "stretch", "bold"];
export const goalTimeHorizonOptions: GoalTimeHorizon[] = ["30_days", "90_days", "1_year", "long_term"];
export const habitFrequencyOptions: HabitFrequency[] = ["daily", "weekdays", "weekly"];
export const taskPriorityOptions: TaskPriority[] = ["medium", "high", "low"];
export const eventImpactOptions: EventImpact[] = ["medium", "high", "life_changing", "low"];
export const colorOptions: ColorToken[] = ["aqua", "amber", "emerald", "rose", "violet", "sky"];
export const iconOptions = [
  "Target",
  "HeartPulse",
  "BriefcaseBusiness",
  "PiggyBank",
  "GraduationCap",
  "Dumbbell",
  "NotebookPen",
  "Rocket",
  "Sparkles",
  "Brain",
];
