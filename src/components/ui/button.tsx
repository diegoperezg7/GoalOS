import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-glow hover:scale-[1.01] hover:bg-teal-300",
        secondary: "bg-white/6 text-foreground hover:bg-white/10",
        ghost: "bg-transparent text-muted-foreground hover:bg-white/6 hover:text-foreground",
        accent: "bg-accent text-accent-foreground hover:bg-amber-300",
        outline: "border border-white/10 bg-white/[0.02] text-foreground hover:bg-white/7",
        danger: "bg-danger/90 text-white hover:bg-danger",
      },
      size: {
        default: "h-11 px-4 py-2.5",
        sm: "h-10 rounded-2xl px-3.5 text-[13px]",
        lg: "h-12 px-5 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button };
