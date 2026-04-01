import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { QuickCaptureAnalysis } from "@/services/ai/ai-types";

export function AIClassifyEntryDrawer({
  open,
  onClose,
  note,
  onChange,
  onAnalyze,
  analysis,
}: {
  open: boolean;
  onClose: () => void;
  note: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  analysis: QuickCaptureAnalysis | null;
}) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Quick Capture"
      description="Escribe libremente y deja que la IA lo convierta en estructura útil."
    >
      <div className="space-y-4">
        <Textarea
          value={note}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-[160px]"
          placeholder="Quiero ganar más dinero este año. Hoy me confirmaron una subida. Necesito más claridad..."
        />
        <Button className="w-full" onClick={onAnalyze} disabled={note.trim().length < 3}>
          <Sparkles className="h-4 w-4" />
          Analizar captura
        </Button>
        {analysis ? (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <p className="font-medium">{analysis.summary}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Tipo detectado: {analysis.detectedType} · categoría: {analysis.category}
            </p>
          </div>
        ) : null}
      </div>
    </Sheet>
  );
}
