import type { AppSnapshot } from "@/types";

export function syncAutomaticAchievements(snapshot: AppSnapshot) {
  return {
    snapshot,
    lastUnlockedAchievementId: undefined,
  };
}
