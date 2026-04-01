import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { TimelineNode } from "@/components/timeline/timeline-node";
import { TimelinePath } from "@/components/timeline/timeline-path";
import { TimelineYearMarker } from "@/components/timeline/timeline-year-marker";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import type { TimelineItem } from "@/types";
import { getTodayKey } from "@/utils/date";
import { clamp } from "@/utils/format";

type LayoutPoint = {
  item: TimelineItem;
  x: number;
  y: number;
  timestamp: number;
  labelSide: "top" | "bottom";
};

function buildPath(points: LayoutPoint[]) {
  if (!points.length) return "";

  return points.reduce((path, point, index, collection) => {
    if (index === 0) return `M ${point.x} ${point.y}`;

    const previous = collection[index - 1];
    const controlX = previous.x + (point.x - previous.x) / 2;
    return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
}

function projectTimestamp(target: number, points: LayoutPoint[]) {
  if (!points.length) return 0;
  if (points.length === 1) return points[0].x;

  const first = points[0];
  const last = points[points.length - 1];

  if (target <= first.timestamp) {
    const next = points[1];
    const ratio = (target - first.timestamp) / Math.max(1, next.timestamp - first.timestamp);
    return first.x + ratio * (next.x - first.x);
  }

  if (target >= last.timestamp) {
    const previous = points[points.length - 2];
    const ratio = (target - previous.timestamp) / Math.max(1, last.timestamp - previous.timestamp);
    return previous.x + ratio * (last.x - previous.x);
  }

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const next = points[index];
    if (target > next.timestamp) continue;

    const ratio = (target - previous.timestamp) / Math.max(1, next.timestamp - previous.timestamp);
    return previous.x + ratio * (next.x - previous.x);
  }

  return last.x;
}

const categoryOffset: Record<TimelineItem["category"], number> = {
  career: -0.8,
  finance: -0.25,
  projects: 0.35,
  personal: 0.75,
  health: 0.18,
  learning: -0.45,
};

const impactOffset: Record<TimelineItem["impactLevel"], number> = {
  low: -10,
  medium: 0,
  high: 14,
  life_changing: 24,
};

export function LifeTimeline({
  items,
  selectedId,
  onSelect,
}: {
  items: TimelineItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const hasFinePointer = useMediaQuery("(pointer: fine)");
  const shouldReduceMotion = useReducedMotion();
  const [dragging, setDragging] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    scrollLeft: 0,
  });
  const nodeRefs = useRef(new Map<string, HTMLButtonElement | null>());

  const layout = useMemo(() => {
    const height = isMobile ? 312 : 420;
    const sidePadding = isMobile ? 88 : 156;
    const minGap = isMobile ? 138 : 212;
    const centerY = height * 0.55;
    const amplitude = isMobile ? 34 : 56;
    const timestamps = items.map((item) => new Date(item.date).getTime());
    const minTimestamp = Math.min(...timestamps);
    const maxTimestamp = Math.max(...timestamps);
    const spanDays = Math.max(1, Math.round((maxTimestamp - minTimestamp) / 86_400_000));
    const baseWidth = Math.max(isMobile ? 980 : 1680, sidePadding * 2 + spanDays * (isMobile ? 1.15 : 1.8));

    const points = items.map((item, index) => {
      const timestamp = new Date(item.date).getTime();
      const ratio = (timestamp - minTimestamp) / Math.max(1, maxTimestamp - minTimestamp);
      const rawX = sidePadding + ratio * (baseWidth - sidePadding * 2);
      const previousX = index === 0 ? sidePadding : 0;
      const priorPoint = index === 0 ? undefined : items[index - 1];
      const minX =
        index === 0 ? rawX : previousX + minGap + (priorPoint?.status === "future" && item.status === "future" ? -18 : 0);

      return {
        item,
        timestamp,
        rawX,
        minX,
      };
    });

    const positioned: LayoutPoint[] = [];

    points.forEach((point, index) => {
      const previous = positioned[index - 1];
      const x = previous ? Math.max(point.rawX, previous.x + minGap) : point.rawX;
      const wave = Math.sin(index * 0.78) * amplitude;
      const y = clamp(
        centerY + wave + categoryOffset[point.item.category] * 26 + impactOffset[point.item.impactLevel],
        isMobile ? 78 : 92,
        height - (isMobile ? 78 : 92),
      );

      positioned.push({
        item: point.item,
        x: Math.max(x, point.minX),
        y,
        timestamp: point.timestamp,
        labelSide: y < centerY ? "bottom" : "top",
      });
    });

    const width = Math.max(baseWidth, (positioned[positioned.length - 1]?.x ?? 0) + sidePadding);
    const pathData = buildPath(positioned);
    const currentYear = new Date().getFullYear();
    const years = Array.from(
      { length: new Date(maxTimestamp).getFullYear() - new Date(minTimestamp).getFullYear() + 1 },
      (_, index) => new Date(minTimestamp).getFullYear() + index,
    ).map((year) => ({
      year,
      x: projectTimestamp(new Date(`${year}-01-01T00:00:00`).getTime(), positioned),
      active: year === currentYear,
    }));

    return {
      width,
      height,
      pathData,
      points: positioned,
      years,
      currentX: projectTimestamp(new Date(getTodayKey()).getTime(), positioned),
    };
  }, [isMobile, items]);

  const registerNode = (id: string, node: HTMLButtonElement | null) => {
    if (node) {
      nodeRefs.current.set(id, node);
      return;
    }

    nodeRefs.current.delete(id);
  };

  useEffect(() => {
    if (!selectedId) return;

    const viewport = viewportRef.current;
    const node = nodeRefs.current.get(selectedId);
    if (!viewport || !node) return;

    const nextLeft = node.offsetLeft + node.offsetWidth / 2 - viewport.clientWidth / 2;
    const boundedLeft = clamp(nextLeft, 0, viewport.scrollWidth - viewport.clientWidth);
    viewport.scrollTo({ left: boundedLeft, behavior: shouldReduceMotion ? "auto" : "smooth" });
  }, [selectedId, shouldReduceMotion]);

  if (!items.length) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-slate-950/50 p-4 text-[13px] text-muted-foreground sm:rounded-[30px] sm:p-6 sm:text-sm">
        La timeline aparecerá cuando existan wins, eventos, achievements o goals relevantes.
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/52 sm:rounded-[32px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_35%)]" />

      <div
        ref={viewportRef}
        className={cn(
          "hide-scrollbar relative overflow-x-auto overflow-y-hidden px-3 py-5 sm:px-7 sm:py-8",
          hasFinePointer ? (dragging ? "cursor-grabbing" : "cursor-grab") : "",
        )}
        style={{ height: layout.height + 24, touchAction: "pan-x", overscrollBehaviorX: "contain" }}
        onWheel={(event) => {
          if (!hasFinePointer) return;
          const viewport = viewportRef.current;
          if (!viewport) return;
          if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
          if (viewport.scrollWidth <= viewport.clientWidth) return;

          event.preventDefault();
          viewport.scrollLeft += event.deltaY * 0.95;
        }}
        onPointerDown={(event) => {
          if (!hasFinePointer || event.pointerType !== "mouse") return;

          dragStateRef.current = {
            active: true,
            pointerId: event.pointerId,
            startX: event.clientX,
            scrollLeft: event.currentTarget.scrollLeft,
          };
          setDragging(true);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!dragStateRef.current.active) return;
          const viewport = viewportRef.current;
          if (!viewport) return;

          const delta = event.clientX - dragStateRef.current.startX;
          viewport.scrollLeft = dragStateRef.current.scrollLeft - delta;
        }}
        onPointerUp={(event) => {
          if (!dragStateRef.current.active) return;
          dragStateRef.current.active = false;
          setDragging(false);
          if (event.currentTarget.hasPointerCapture(dragStateRef.current.pointerId)) {
            event.currentTarget.releasePointerCapture(dragStateRef.current.pointerId);
          }
        }}
        onPointerCancel={() => {
          dragStateRef.current.active = false;
          setDragging(false);
        }}
      >
        <div className="relative" style={{ width: layout.width, height: layout.height }}>
          <TimelinePath pathData={layout.pathData} width={layout.width} height={layout.height} />

          {layout.years.map((marker) => (
            <TimelineYearMarker key={marker.year} x={marker.x} label={String(marker.year)} active={marker.active} />
          ))}

          <div className="pointer-events-none absolute top-0 h-full -translate-x-1/2" style={{ left: layout.currentX }}>
            <div className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-primary sm:px-3 sm:text-[10px] sm:tracking-[0.28em]">
              Ahora
            </div>
            <div className="mt-2.5 h-full w-px bg-primary/20 sm:mt-3" />
          </div>

          {layout.points.map((point, index) => (
            <TimelineNode
              key={point.item.id}
              item={point.item}
              x={point.x}
              y={point.y}
              isSelected={point.item.id === selectedId}
              labelSide={point.labelSide}
              onSelect={onSelect}
              registerNode={registerNode}
              delay={index * 0.05}
            />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-950 to-transparent sm:w-14" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-950 to-transparent sm:w-14" />
    </div>
  );
}
