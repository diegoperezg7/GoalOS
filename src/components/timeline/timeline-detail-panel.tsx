import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BrainCircuit, Link2, Sparkles } from "lucide-react";

import {
  timelineCategoryIcons,
  timelineCategoryMeta,
  timelineImpactMeta,
  timelineStatusMeta,
  timelineTypeMeta,
} from "@/components/timeline/timeline-meta";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TimelineItem } from "@/types";
import { formatLongDate } from "@/utils/date";

function DetailCell({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  if (!value) return null;

  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-3.5 sm:rounded-[22px] sm:p-4">
      <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-[13px] leading-relaxed text-foreground/92 sm:text-sm">{value}</p>
    </div>
  );
}

export function TimelineDetailPanel({
  item,
  relatedGoalTitle,
  relatedAchievementTitle,
  relatedWinTitle,
}: {
  item?: TimelineItem;
  relatedGoalTitle?: string;
  relatedAchievementTitle?: string;
  relatedWinTitle?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (!item) {
    return (
      <Card className="p-4 text-[13px] text-muted-foreground sm:p-6 sm:text-sm">
        Selecciona un nodo de la timeline para ver su ficha expandida.
      </Card>
    );
  }

  const categoryMeta = timelineCategoryMeta[item.category];
  const CategoryIcon = timelineCategoryIcons[item.category];
  const TypeIcon = timelineTypeMeta[item.type].icon;
  const statusMeta = timelineStatusMeta[item.status];
  const reflectionCopy = item.reflection ?? item.aiInsight?.description ?? statusMeta.description;

  return (
    <Card className="overflow-hidden p-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0.98 } : { opacity: 0, y: -14 }}
          transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", categoryMeta.softClass)} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_30%)]" />

          <div className="relative grid gap-5 p-4 sm:gap-6 sm:p-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4 sm:space-y-5">
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-[18px] border bg-slate-950/70 backdrop-blur-md sm:h-14 sm:w-14 sm:rounded-[22px]",
                    categoryMeta.borderClass,
                    categoryMeta.glowClass,
                  )}
                >
                  <CategoryIcon className={cn("h-5 w-5 sm:h-6 sm:w-6", categoryMeta.textClass)} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="gap-2 border-white/14 bg-slate-950/75 text-foreground">
                    <TypeIcon className="h-3.5 w-3.5" />
                    {timelineTypeMeta[item.type].label}
                  </Badge>
                  <Badge className="border-white/12 bg-white/[0.04] text-muted-foreground">{statusMeta.label}</Badge>
                  <Badge className={cn("bg-slate-950/75", categoryMeta.borderClass, categoryMeta.textClass)}>
                    {timelineCategoryMeta[item.category].label}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-primary/75">{formatLongDate(item.date)}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-balance sm:text-3xl md:text-4xl">{item.title}</h2>
                </div>
                <p className="max-w-2xl text-sm leading-relaxed text-foreground/88 sm:text-base">{item.description}</p>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-slate-950/60 p-4 sm:rounded-[26px] sm:p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-primary/75">Lectura del momento</p>
                <p className="mt-3 text-[13px] leading-relaxed text-foreground/92 sm:text-sm">{reflectionCopy}</p>
              </div>

              {item.tags?.length ? (
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} className="border-white/12 bg-white/[0.04] text-muted-foreground">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid gap-3.5 sm:gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailCell label="Impacto" value={timelineImpactMeta[item.impactLevel].label} />
                <DetailCell label="Categoría" value={timelineCategoryMeta[item.category].label} />
                <DetailCell label="Goal relacionado" value={relatedGoalTitle} />
                <DetailCell label="Achievement asociado" value={relatedAchievementTitle} />
                <DetailCell label="Win relacionado" value={relatedWinTitle} />
                <DetailCell label="Tipo de evento" value={timelineTypeMeta[item.type].label} />
              </div>

              {item.aiInsight ? (
                <div className="rounded-[22px] border border-white/10 bg-slate-950/72 p-4 sm:rounded-[26px] sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-primary sm:rounded-2xl sm:p-3">
                      <BrainCircuit className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.28em] text-primary/75">Insight IA opcional</p>
                      <h3 className="text-base font-semibold sm:text-lg">{item.aiInsight.title}</h3>
                      <p className="text-[13px] leading-relaxed text-muted-foreground sm:text-sm">{item.aiInsight.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="info">{item.aiInsight.severity}</Badge>
                        <Badge className="gap-2 border-white/10 bg-white/[0.04] text-muted-foreground">
                          <Sparkles className="h-3.5 w-3.5" />
                          Vinculado a este tramo
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[22px] border border-white/10 bg-slate-950/62 p-4 text-[13px] text-muted-foreground sm:rounded-[26px] sm:p-5 sm:text-sm">
                  <div className="flex items-center gap-3 text-foreground/90">
                    <Link2 className="h-4 w-4 text-primary" />
                    Relación contextual preparada para futuras lecturas con IA.
                  </div>
                  <p className="mt-3 leading-relaxed">
                    Esta ficha ya puede enlazarse con detección automática de wins, resúmenes de etapa y reflexiones de trayectoria.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </Card>
  );
}
