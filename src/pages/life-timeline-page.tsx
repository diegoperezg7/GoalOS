import { startTransition, useEffect, useMemo, useState } from "react";

import { LifeTimeline } from "@/components/timeline/life-timeline";
import { TimelineControls } from "@/components/timeline/timeline-controls";
import { TimelineDetailPanel } from "@/components/timeline/timeline-detail-panel";
import { TimelineLegend } from "@/components/timeline/timeline-legend";
import { PageTransition } from "@/components/common/page-transition";
import { Card } from "@/components/ui/card";
import { buildTimelineItems, getDefaultTimelineItemId } from "@/services/life-timeline-service";
import { useAppStore } from "@/store/use-app-store";

export function LifeTimelinePage() {
  const goals = useAppStore((state) => state.goals);
  const wins = useAppStore((state) => state.wins);
  const lifeEvents = useAppStore((state) => state.lifeEvents);
  const achievements = useAppStore((state) => state.achievements);
  const aiInsights = useAppStore((state) => state.aiInsights);

  const snapshot = useMemo(
    () => ({
      goals,
      wins,
      lifeEvents,
      achievements,
      aiInsights,
    }),
    [achievements, aiInsights, goals, lifeEvents, wins],
  );

  const items = useMemo(() => buildTimelineItems(snapshot), [snapshot]);
  const defaultSelectedId = useMemo(() => getDefaultTimelineItemId(items), [items]);
  const [selectedId, setSelectedId] = useState<string | undefined>(defaultSelectedId);

  useEffect(() => {
    if (selectedId && items.some((item) => item.id === selectedId)) return;
    setSelectedId(defaultSelectedId);
  }, [defaultSelectedId, items, selectedId]);

  const goalsById = useMemo(() => new Map(goals.map((goal) => [goal.id, goal])), [goals]);
  const winsById = useMemo(() => new Map(wins.map((win) => [win.id, win])), [wins]);
  const achievementsById = useMemo(
    () => new Map(achievements.map((achievement) => [achievement.id, achievement])),
    [achievements],
  );
  const selectedItem = items.find((item) => item.id === selectedId) ?? items[0];
  const selectedIndex = Math.max(0, items.findIndex((item) => item.id === selectedItem?.id));
  const categories = Array.from(new Set(items.map((item) => item.category)));
  const pastCount = items.filter((item) => item.status === "past").length;
  const futureCount = items.filter((item) => item.status === "future").length;
  const coveredYears = new Set(items.map((item) => new Date(item.date).getFullYear())).size;

  const updateSelection = (id: string) => {
    startTransition(() => setSelectedId(id));
  };

  return (
    <PageTransition>
      <Card className="overflow-hidden p-0">
        <div className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.14),transparent_24%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_30%)]" />

          <div className="relative space-y-5 p-4 sm:space-y-6 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-2.5 sm:space-y-3">
                <p className="text-[10px] uppercase tracking-[0.28em] text-primary/78 sm:text-xs sm:tracking-[0.34em]">Life Timeline</p>
                <h2 className="text-2xl font-semibold text-balance sm:text-3xl md:text-4xl">
                  Del verano de 2024 en Estados Unidos a la subida salarial de marzo de 2026: una timeline horizontal para leer el cambio real.
                </h2>
                <p className="text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                  La narrativa ya está sembrada con wins y life events reales. Desliza en horizontal, toca un nodo y abre debajo el detalle del
                  momento, su contexto y la relación con tus goals actuales.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {[
                  { label: "Momentos vividos", value: pastCount },
                  { label: "Markers futuros", value: futureCount },
                  { label: "Años cubiertos", value: coveredYears },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[20px] border border-white/10 bg-slate-950/55 px-3 py-3 backdrop-blur-md sm:rounded-[24px] sm:px-4 sm:py-4"
                  >
                    <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground sm:text-[10px] sm:tracking-[0.28em]">{stat.label}</p>
                    <p className="mt-1.5 text-xl font-semibold sm:mt-2 sm:text-2xl">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <TimelineLegend categories={categories} />
              <TimelineControls
                current={items.length ? selectedIndex + 1 : 0}
                total={items.length}
                onPrevious={() => {
                  const previous = items[selectedIndex - 1];
                  if (previous) updateSelection(previous.id);
                }}
                onNext={() => {
                  const next = items[selectedIndex + 1];
                  if (next) updateSelection(next.id);
                }}
                onPresent={() => {
                  if (defaultSelectedId) updateSelection(defaultSelectedId);
                }}
                canPrevious={selectedIndex > 0}
                canNext={selectedIndex < items.length - 1}
              />
            </div>

            <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs sm:tracking-[0.24em]">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1.5 sm:px-3 sm:py-2">Swipe horizontal en iPhone</span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1.5 sm:px-3 sm:py-2">Detalle expandido debajo</span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1.5 sm:px-3 sm:py-2">Goals futuros conectados al recorrido</span>
            </div>

            <LifeTimeline items={items} selectedId={selectedItem?.id} onSelect={updateSelection} />
          </div>
        </div>
      </Card>

      <TimelineDetailPanel
        item={selectedItem}
        relatedGoalTitle={selectedItem?.relatedGoalId ? goalsById.get(selectedItem.relatedGoalId)?.title : undefined}
        relatedAchievementTitle={
          selectedItem?.relatedAchievementId ? achievementsById.get(selectedItem.relatedAchievementId)?.title : undefined
        }
        relatedWinTitle={selectedItem?.relatedWinId ? winsById.get(selectedItem.relatedWinId)?.title : undefined}
      />
    </PageTransition>
  );
}
