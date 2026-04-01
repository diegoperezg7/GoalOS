import { Card } from "@/components/ui/card";
import type { MonthlyReview } from "@/types";

export function AIMonthlyReviewCard({ review }: { review: MonthlyReview | null }) {
  return (
    <Card className="p-4 sm:p-5">
      <p className="text-xs uppercase tracking-[0.28em] text-primary/80">Monthly AI review</p>
      <h3 className="mt-2 text-xl font-semibold">{review?.headline ?? "Revisión mensual pendiente"}</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Momentum</p>
          <p className="mt-2 text-sm text-muted-foreground">{review?.momentum ?? "Todavía no hay lectura mensual generada."}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Dispersion</p>
          <p className="mt-2 text-sm text-muted-foreground">{review?.dispersion ?? "La IA resumirá aquí la dispersión detectada."}</p>
        </div>
      </div>
      {review?.priorityFocus ? (
        <div className="mt-4 rounded-[24px] border border-white/10 bg-primary/10 p-4 text-sm text-foreground">
          {review.priorityFocus}
        </div>
      ) : null}
    </Card>
  );
}
