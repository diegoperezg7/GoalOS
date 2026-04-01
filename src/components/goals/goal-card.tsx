import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarDays, Flag, ListTodo } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Goal } from "@/types";
import { colorTokenMap } from "@/utils/color-tokens";
import { formatPercent } from "@/utils/format";
import { getIcon } from "@/utils/icon-map";
import { formatShortDate } from "@/utils/date";

export function GoalCard({
  goal,
  milestoneCount,
  taskCount,
}: {
  goal: Goal;
  milestoneCount: number;
  taskCount: number;
}) {
  const Icon = getIcon(goal.icon);
  const palette = colorTokenMap[goal.color];
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.01 }} transition={{ duration: 0.2 }}>
      <Link to={`/goals/${goal.id}`}>
        <Card className="group h-full overflow-hidden p-4 sm:p-5">
          <div className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-br ${palette.soft} opacity-80 sm:h-24`} />
          <div className="relative space-y-3.5 sm:space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2.5 sm:space-y-3">
                <div className={`inline-flex rounded-xl border border-white/10 bg-slate-950/40 p-2.5 ${palette.glow} sm:rounded-2xl sm:p-3`}>
                  <Icon className={`h-4 w-4 ${palette.text} sm:h-5 sm:w-5`} />
                </div>
                <div>
                  <h3 className="text-base font-semibold sm:text-xl">{goal.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">{goal.description}</p>
                </div>
              </div>
              <Badge variant={goal.priority === "critical" ? "danger" : "default"}>{goal.priority}</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[13px] text-muted-foreground sm:text-sm">
                <span>Progreso</span>
                <span className="font-medium text-foreground">{formatPercent(goal.progress)}</span>
              </div>
              <Progress value={goal.progress} indicatorClassName={palette.ring} />
            </div>

            <div className="grid gap-2.5 text-[13px] text-muted-foreground sm:grid-cols-2 sm:gap-3 sm:text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="mb-1.5 inline-flex items-center gap-2 text-foreground sm:mb-2">
                  <Flag className="h-4 w-4 text-primary" />
                  Hitos
                </div>
                <p>{milestoneCount} activos</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="mb-1.5 inline-flex items-center gap-2 text-foreground sm:mb-2">
                  <ListTodo className="h-4 w-4 text-primary" />
                  Tasks
                </div>
                <p>{taskCount} en curso</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:text-sm">
              <div className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {formatShortDate(goal.targetDate)}
              </div>
              <div className="inline-flex items-center gap-1 text-primary">
                Abrir
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
