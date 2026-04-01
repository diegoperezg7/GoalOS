import { cn } from "@/lib/utils";

export function Avatar({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 font-display text-sm font-bold text-foreground",
        className,
      )}
    >
      {label}
    </div>
  );
}
