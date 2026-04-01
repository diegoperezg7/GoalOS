import { cn } from "@/lib/utils";

export function TimelineYearMarker({
  x,
  label,
  active = false,
}: {
  x: number;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className="pointer-events-none absolute top-0 flex h-full -translate-x-1/2 flex-col items-center"
      style={{ left: x }}
      aria-hidden="true"
    >
      <div
        className={cn(
          "rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md sm:px-3 sm:text-[10px] sm:tracking-[0.28em]",
          active ? "border-white/22 bg-white/10 text-foreground" : "border-white/10 bg-slate-950/60 text-muted-foreground",
        )}
      >
        {label}
      </div>
      <div className={cn("mt-2.5 h-full w-px sm:mt-3", active ? "bg-white/22" : "bg-white/10")} />
    </div>
  );
}
