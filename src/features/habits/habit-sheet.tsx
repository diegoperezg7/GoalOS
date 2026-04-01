import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { colorOptions, habitFrequencyOptions, iconOptions } from "@/data/options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import type { HabitInput } from "@/types";

const schema = z.object({
  title: z.string().min(3),
  category: z.string().min(2),
  frequency: z.enum(["daily", "weekdays", "weekly"]),
  target: z.coerce.number().optional(),
  color: z.enum(["aqua", "amber", "rose", "emerald", "violet", "sky"]),
  icon: z.string().min(2),
});

type FormValues = z.infer<typeof schema>;
type FormInput = z.input<typeof schema>;

export function HabitSheet({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: HabitInput) => void;
}) {
  const form = useForm<FormInput, undefined, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      category: "salud",
      frequency: "daily",
      target: 1,
      color: "amber",
      icon: "Sparkles",
    },
  });

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Nuevo hábito"
      description="Diseña un gesto pequeño, repetible y fácil de marcar."
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          onSubmit({
            ...values,
            target: values.target || undefined,
          });
          form.reset();
          onClose();
        })}
      >
        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground">Título</span>
          <Input placeholder="Journaling de 5 minutos" {...form.register("title")} />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">Categoría</span>
            <Input placeholder="claridad" {...form.register("category")} />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">Frecuencia</span>
            <Select {...form.register("frequency")}>
              {habitFrequencyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">Target</span>
            <Input type="number" min={1} {...form.register("target")} />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">Color</span>
            <Select {...form.register("color")}>
              {colorOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">Icono</span>
            <Select {...form.register("icon")}>
              {iconOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </label>
        </div>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Crear hábito</Button>
        </div>
      </form>
    </Sheet>
  );
}
