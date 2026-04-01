import type { AppSnapshot } from "@/types";

export function createEmptySnapshot(): AppSnapshot {
  return {
    user: {
      id: "local_user",
      name: "",
      avatar: "GO",
      level: 1,
      xp: 0,
      streak: 0,
      focusAreas: [],
      quote: "Tu sistema empieza limpio. Cada registro debería mover algo real.",
      hasCompletedOnboarding: false,
      theme: "dark",
    },
    goals: [],
    milestones: [],
    tasks: [],
    habits: [],
    achievements: [],
    wins: [],
    lifeEvents: [],
    progressEntries: [],
    aiInsights: [],
  };
}
