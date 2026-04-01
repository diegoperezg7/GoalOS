import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";

export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:p-4 md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="min-h-[88svh] w-full overflow-y-auto rounded-t-[32px] border border-white/10 bg-slate-950/97 p-4 pb-[calc(1.2rem+env(safe-area-inset-bottom))] shadow-glow sm:min-h-0 sm:max-w-2xl sm:rounded-[32px] sm:p-5 sm:pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:max-h-[min(860px,calc(100svh-3rem))] md:p-6"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.98 }}
            transition={shouldReduceMotion ? { duration: 0.12 } : { type: "spring", stiffness: 110, damping: 18 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/12 sm:hidden" />
            <div className="mb-5 flex items-start justify-between gap-4 md:mb-6">
              <div className="space-y-1">
                <h3 className="font-display text-xl font-semibold sm:text-2xl">{title}</h3>
                {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
