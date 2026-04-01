import type { LucideIcon } from "lucide-react";
import {
  Brain,
  BriefcaseBusiness,
  Crown,
  Dumbbell,
  Flag,
  Flame,
  GraduationCap,
  HeartPulse,
  Landmark,
  LineChart,
  NotebookPen,
  PiggyBank,
  Rocket,
  Sparkles,
  Star,
  Target,
  TimerReset,
  Trophy,
  WandSparkles,
  Zap,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Brain,
  BriefcaseBusiness,
  Crown,
  Dumbbell,
  Flag,
  Flame,
  GraduationCap,
  HeartPulse,
  Landmark,
  LineChart,
  NotebookPen,
  PiggyBank,
  Rocket,
  Sparkles,
  Star,
  Target,
  TimerReset,
  Trophy,
  WandSparkles,
  Zap,
};

export function getIcon(name: string) {
  return iconMap[name] ?? Target;
}
