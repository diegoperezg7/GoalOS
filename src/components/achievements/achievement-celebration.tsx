import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/use-app-store";

export function AchievementCelebration() {
  const achievements = useAppStore((state) => state.achievements);
  const lastUnlockedAchievementId = useAppStore((state) => state.lastUnlockedAchievementId);
  const dismiss = useAppStore((state) => state.dismissAchievementCelebration);
  const shouldReduceMotion = useReducedMotion();
  const achievement = achievements.find((item) => item.id === lastUnlockedAchievementId);

  useEffect(() => {
    if (!achievement) return;
    const timer = window.setTimeout(() => dismiss(), 3200);
    return () => window.clearTimeout(timer);
  }, [achievement, dismiss]);

  return (
    <AnimatePresence>
      {achievement ? (
        <motion.div
          className="fixed inset-x-4 top-4 z-[70] mx-auto max-w-lg rounded-[28px] border border-accent/25 bg-slate-950/95 p-5 shadow-glow backdrop-blur-xl"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -30, scale: 0.96 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.98 }}
        >
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-accent/15 p-3 text-accent">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.28em] text-accent/80">Achievement unlocked</p>
              <h3 className="mt-2 text-xl font-semibold">{achievement.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {achievement.celebrationText ?? achievement.description}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={dismiss}>
              Cerrar
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
