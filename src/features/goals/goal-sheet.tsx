import type { ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { colorOptions, goalDifficultyOptions, goalPriorityOptions, goalTimeHorizonOptions, iconOptions } from "@/data/options";
import type { GoalInput } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(12),
  category: z.string().min(2),
  priority: z.enum(["low", "medium", "high", "critical"]),
  targetDate: z.string().min(4),
  difficulty: z.enum(["steady", "stretch", "bold"]),
  motivation: z.string().min(10),
  whyItMatters: z.string().min(10),
  timeHorizon: z.enum(["30_days", "90_days", "1_year", "long_term"]),
  color: z.enum(["aqua", "amber", "rose", "emerald", "violet", "sky"]),
  icon: z.string().min(2),
});

type FormValues = z.infer<typeof schema>;

export function GoalSheet({
  open,
  onClose,
  onSubmit,
  defaults,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: GoalInput) => void;
  defaults?: Partial<FormValues>;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaults?.title ?? "",
      description: defaults?.description ?? "",
      category: defaults?.category ?? "carrera",
      priority: defaults?.priority ?? "high",
      targetDate: defaults?.targetDate ?? "",
      difficulty: defaults?.difficulty ?? "stretch",
      motivation: defaults?.motivation ?? "",
      whyItMatters: defaults?.whyItMatters ?? "",
      timeHorizon: defaults?.timeHorizon ?? "90_days",
      color: defaults?.color ?? "aqua",
      icon: defaults?.icon ?? "Target",
    },
  });

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Nuevo objetivo"
      description="Define una meta con contexto, horizonte y señal de progreso."
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          onSubmit(values);
          form.reset();
          onClose();
        })}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Título" error={form.formState.errors.title?.message}>
            <Input placeholder="Subir mi posicionamiento profesional" {...form.register("title")} />
          </Field>
          <Field label="Categoría" error={form.formState.errors.category?.message}>
            <Input placeholder="carrera" {...form.register("category")} />
          </Field>
        </div>

        <Field label="Descripción" error={form.formState.errors.description?.message}>
          <Textarea placeholder="Qué significa ganar este objetivo y cómo se ve." {...form.register("description")} />
        </Field>

        <Field label="Motivación" error={form.formState.errors.motivation?.message}>
          <Textarea
            className="min-h-[92px]"
            placeholder="Por qué esto importa realmente en tu vida o carrera."
            {...form.register("motivation")}
          />
        </Field>

        <Field label="Why it matters" error={form.formState.errors.whyItMatters?.message}>
          <Textarea
            className="min-h-[92px]"
            placeholder="Qué cambia si lo consigues y por qué merece foco ahora."
            {...form.register("whyItMatters")}
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Prioridad">
            <Select {...form.register("priority")}>
              {goalPriorityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Horizonte">
            <Select {...form.register("timeHorizon")}>
              {goalTimeHorizonOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Dificultad">
            <Select {...form.register("difficulty")}>
              {goalDifficultyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Fecha objetivo">
            <Input type="date" {...form.register("targetDate")} />
          </Field>
          <Field label="Color">
            <Select {...form.register("color")}>
              {colorOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Icono">
            <Select {...form.register("icon")}>
              {iconOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Guardar objetivo</Button>
        </div>
      </form>
    </Sheet>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {children}
      {error ? <span className="text-xs text-rose-300">{error}</span> : null}
    </label>
  );
}
