import { WandSparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AIRefineButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="secondary" size="sm" onClick={onClick}>
      <WandSparkles className="h-4 w-4" />
      Refinar con IA
    </Button>
  );
}
