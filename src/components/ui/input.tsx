import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary/50 focus:bg-white/[0.05] md:text-sm",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
