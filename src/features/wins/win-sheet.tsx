import { useId } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { eventImpactOptions } from "@/data/options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { WinInput } from "@/types";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(8),
  date: z.string().min(4),
  category: z.string().min(2),
  impactLevel: z.enum(["low", "medium", "high", "life_changing"]),
  reflection: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function WinSheet({
  open,
  onClose,
  onSubmit,
  defaults,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: WinInput) => void;
  defaults?: Partial<WinInput>;
}) {
  const idPrefix = useId();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaults?.title ?? "",
      description: defaults?.description ?? "",
      date: defaults?.date ?? new Date().toISOString().slice(0, 10),
      category: defaults?.category ?? "carrera",
      impactLevel: defaults?.impactLevel ?? "medium",
      reflection: defaults?.reflection ?? "",
    },
  });

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Registrar logro"
      description="Guarda victorias con peso narrativo para que entren directas en la timeline."
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          onSubmit({
            ...values,
            source: "manual",
          });
          form.reset();
          onClose();
        })}
      >
        <label htmlFor={`${idPrefix}-title`} className="space-y-2 text-sm">
          <span className="text-muted-foreground">Título</span>
          <Input id={`${idPrefix}-title`} placeholder="Me confirmaron la subida salarial" {...form.register("title")} />
        </label>
        <label htmlFor={`${idPrefix}-description`} className="space-y-2 text-sm">
          <span className="text-muted-foreground">Descripción</span>
          <Textarea id={`${idPrefix}-description`} placeholder="Qué pasó y por qué merece quedar registrado." {...form.register("description")} />
        </label>
        <div className="grid gap-4 md:grid-cols-3">
          <label htmlFor={`${idPrefix}-date`} className="space-y-2 text-sm">
            <span className="text-muted-foreground">Fecha</span>
            <Input id={`${idPrefix}-date`} type="date" {...form.register("date")} />
          </label>
          <label htmlFor={`${idPrefix}-category`} className="space-y-2 text-sm">
            <span className="text-muted-foreground">Categoría</span>
            <Input id={`${idPrefix}-category`} placeholder="carrera" {...form.register("category")} />
          </label>
          <label htmlFor={`${idPrefix}-impact`} className="space-y-2 text-sm">
            <span className="text-muted-foreground">Impacto</span>
            <Select id={`${idPrefix}-impact`} {...form.register("impactLevel")}>
              {eventImpactOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </label>
        </div>
        <label htmlFor={`${idPrefix}-reflection`} className="space-y-2 text-sm">
          <span className="text-muted-foreground">Reflexión</span>
          <Textarea id={`${idPrefix}-reflection`} placeholder="Por qué esta victoria importa de verdad." {...form.register("reflection")} />
        </label>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Guardar logro</Button>
        </div>
      </form>
    </Sheet>
  );
}
