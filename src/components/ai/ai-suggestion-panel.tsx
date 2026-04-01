import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AISuggestionPanel({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("p-4 sm:p-5", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          {eyebrow ? <p className="text-xs uppercase tracking-[0.28em] text-primary/80">{eyebrow}</p> : null}
          <div>
            <h3 className="text-lg font-semibold sm:text-xl">{title}</h3>
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="w-full sm:w-auto">{actions}</div> : null}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </Card>
  );
}
