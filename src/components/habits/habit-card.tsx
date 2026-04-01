import { motion, useReducedMotion } from "framer-motion";
import { Flame, Repeat2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Habit } from "@/types";
import { getTodayKey } from "@/utils/date";
import { colorTokenMap } from "@/utils/color-tokens";
import { getIcon } from "@/utils/icon-map";

export function HabitCard({
  habit,
  onToggle,
}: {
  habit: Habit;
  onToggle: () => void;
}) {
  const todayDone = habit.history.some((entry) => entry.date === getTodayKey() && entry.completed);
  const Icon = getIcon(habit.icon);
  const palette = colorTokenMap[habit.color];
  const recent = habit.history.slice(-7);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div layout whileHover={shouldReduceMotion ? undefined : { y: -3 }} transition={{ duration: 0.2 }}>
      <Card className="overflow-hidden p-4 sm:p-5">
        <div className={`absolute inset-x-0 top-0 h-14 bg-gradient-to-r ${palette.soft} sm:h-16`} />
        <div className="relative space-y-3.5 sm:space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className={`rounded-xl border border-white/10 bg-slate-950/40 p-2.5 ${palette.glow} sm:rounded-2xl sm:p-3`}>
                <Icon className={`h-4 w-4 ${palette.text} sm:h-5 sm:w-5`} />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold sm:text-lg">{habit.title}</h3>
                <p className="text-[13px] text-muted-foreground sm:text-sm">
                  {habit.category} · {habit.frequency}
                </p>
              </div>
            </div>
            <Button
              variant={todayDone ? "accent" : "secondary"}
              onClick={onToggle}
              className="min-w-[104px] w-full sm:min-w-[112px] sm:w-auto"
            >
              {todayDone ? "Hecho hoy" : "Marcar"}
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-[13px] text-muted-foreground sm:px-4 sm:text-sm">
              <div className="inline-flex items-center gap-2 text-foreground">
                <Flame className="h-4 w-4 text-amber-300" />
                Racha
              </div>
              <div className="mt-1 text-base font-semibold text-foreground sm:text-lg">{habit.streak} días</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-[13px] text-muted-foreground sm:px-4 sm:text-sm">
              <div className="inline-flex items-center gap-2 text-foreground">
                <Repeat2 className="h-4 w-4 text-primary" />
                Historial
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
                {recent.map((entry) => (
                  <motion.div
                    key={entry.id}
                    className={[
                      "h-8 w-6 rounded-lg border border-white/10 sm:h-9 sm:w-7 sm:rounded-xl",
                      entry.completed ? palette.ring : "bg-white/[0.04]",
                    ].join(" ")}
                    whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
