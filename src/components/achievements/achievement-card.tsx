import { motion, useReducedMotion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Achievement } from "@/types";
import { getIcon } from "@/utils/icon-map";
import { formatShortDate } from "@/utils/date";

const rarityVariant = {
  common: "default",
  rare: "info",
  epic: "warning",
  legendary: "danger",
} as const;

export function AchievementCard({ achievement, highlight = false }: { achievement: Achievement; highlight?: boolean }) {
  const Icon = getIcon(achievement.icon);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={highlight ? (shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 20 }) : false}
      animate={highlight ? (shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }) : undefined}
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
    >
      <Card className={highlight ? "border-primary/25 bg-primary/[0.06] p-4 sm:p-5" : "p-4 sm:p-5"}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex rounded-2xl border border-white/10 bg-white/6 p-3">
              <Icon className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{achievement.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{achievement.description}</p>
            </div>
          </div>
          <Badge variant={rarityVariant[achievement.rarity]}>{achievement.rarity}</Badge>
        </div>
        <div className="mt-4 flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>{achievement.type.replace("_", " ")}</span>
          <span>{formatShortDate(achievement.unlockedAt)}</span>
        </div>
      </Card>
    </motion.div>
  );
}
