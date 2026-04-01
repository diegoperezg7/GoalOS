import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

export function EmptyStateCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  highlights,
  actions,
  className,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  highlights?: string[];
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={["overflow-hidden p-5", className].filter(Boolean).join(" ")}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_32%)]" />
      <div className="relative space-y-4">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.28em] text-primary/78">{eyebrow}</p>
            <div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </div>
        </div>

        {highlights?.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {highlights.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
        ) : null}

        {actions ? <div className="flex flex-col gap-2 sm:flex-row">{actions}</div> : null}
      </div>
    </Card>
  );
}
