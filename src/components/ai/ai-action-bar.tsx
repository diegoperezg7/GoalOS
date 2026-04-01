import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

export function AIActionBar({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions: ReactNode;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-primary/80">AI action bar</p>
          <h3 className="mt-2 text-lg font-semibold sm:text-xl">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">{actions}</div>
      </div>
    </Card>
  );
}
