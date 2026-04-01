import { useEffect, useId } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { Goal, ProgressInput } from "@/types";

const schema = z.object({
  goalId: z.string().optional(),
  value: z.coerce.number().min(1).max(100),
  note: z.string().min(6),
});

type FormValues = z.output<typeof schema>;
type FormInput = z.input<typeof schema>;

export function ProgressSheet({
  open,
  onClose,
  onSubmit,
  goals,
  selectedGoalId,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ProgressInput, goalId?: string) => void;
  goals?: Goal[];
  selectedGoalId?: string;
}) {
  const idPrefix = useId();
  const form = useForm<FormInput, undefined, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      goalId: selectedGoalId ?? goals?.[0]?.id ?? "",
      value: 10,
      note: "",
    },
  });

  useEffect(() => {
    form.reset({
      goalId: selectedGoalId ?? goals?.[0]?.id ?? "",
      value: 10,
      note: "",
    });
  }, [form, goals, selectedGoalId]);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Registrar avance"
      description="Convierte una sesión productiva en señal visible dentro del sistema."
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          onSubmit(
            {
              value: values.value,
              note: values.note,
            },
            selectedGoalId ?? values.goalId,
          );
          form.reset();
          onClose();
        })}
      >
        {!selectedGoalId && goals?.length ? (
          <label htmlFor={`${idPrefix}-goal`} className="space-y-2 text-sm">
            <span className="text-muted-foreground">Goal</span>
            <Select id={`${idPrefix}-goal`} {...form.register("goalId")}>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))}
            </Select>
          </label>
        ) : null}
        <label htmlFor={`${idPrefix}-value`} className="space-y-2 text-sm">
          <span className="text-muted-foreground">Incremento</span>
          <Input id={`${idPrefix}-value`} type="number" min={1} max={100} {...form.register("value")} />
        </label>
        <label htmlFor={`${idPrefix}-note`} className="space-y-2 text-sm">
          <span className="text-muted-foreground">Nota</span>
          <Textarea id={`${idPrefix}-note`} placeholder="Qué cambió, qué terminaste o qué aprendiste." {...form.register("note")} />
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Guardar avance</Button>
        </div>
      </form>
    </Sheet>
  );
}
