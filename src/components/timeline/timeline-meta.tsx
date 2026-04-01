import type { EventImpact, TimelineCategory, TimelineItemStatus, TimelineItemType } from "@/types";
import {
  Award,
  BriefcaseBusiness,
  Flag,
  GraduationCap,
  HeartPulse,
  LucideIcon,
  PiggyBank,
  Rocket,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";

export const timelineCategoryMeta: Record<
  TimelineCategory,
  {
    label: string;
    accent: string;
    textClass: string;
    borderClass: string;
    softClass: string;
    glowClass: string;
  }
> = {
  career: {
    label: "Career",
    accent: "#f6ad55",
    textClass: "text-amber-100",
    borderClass: "border-amber-300/30",
    softClass: "from-amber-300/18 via-orange-300/10 to-transparent",
    glowClass: "shadow-[0_0_34px_rgba(251,191,36,0.2)]",
  },
  finance: {
    label: "Finance",
    accent: "#34d399",
    textClass: "text-emerald-100",
    borderClass: "border-emerald-300/30",
    softClass: "from-emerald-300/18 via-lime-300/10 to-transparent",
    glowClass: "shadow-[0_0_34px_rgba(52,211,153,0.2)]",
  },
  projects: {
    label: "Projects",
    accent: "#5eead4",
    textClass: "text-teal-100",
    borderClass: "border-teal-300/30",
    softClass: "from-teal-300/18 via-cyan-300/10 to-transparent",
    glowClass: "shadow-[0_0_34px_rgba(45,212,191,0.2)]",
  },
  personal: {
    label: "Personal",
    accent: "#f472b6",
    textClass: "text-rose-100",
    borderClass: "border-rose-300/30",
    softClass: "from-rose-300/18 via-pink-300/10 to-transparent",
    glowClass: "shadow-[0_0_34px_rgba(244,114,182,0.2)]",
  },
  health: {
    label: "Health",
    accent: "#38bdf8",
    textClass: "text-sky-100",
    borderClass: "border-sky-300/30",
    softClass: "from-sky-300/18 via-cyan-300/10 to-transparent",
    glowClass: "shadow-[0_0_34px_rgba(56,189,248,0.18)]",
  },
  learning: {
    label: "Learning",
    accent: "#a78bfa",
    textClass: "text-violet-100",
    borderClass: "border-violet-300/30",
    softClass: "from-violet-300/18 via-fuchsia-300/10 to-transparent",
    glowClass: "shadow-[0_0_34px_rgba(167,139,250,0.18)]",
  },
};

export const timelineCategoryIcons: Record<TimelineCategory, LucideIcon> = {
  career: BriefcaseBusiness,
  finance: PiggyBank,
  projects: Rocket,
  personal: UserRound,
  health: HeartPulse,
  learning: GraduationCap,
};

export const timelineTypeMeta: Record<TimelineItemType, { label: string; icon: LucideIcon }> = {
  win: {
    label: "Victoria registrada",
    icon: Sparkles,
  },
  life_event: {
    label: "Momento clave",
    icon: Flag,
  },
  achievement: {
    label: "Achievement derivado",
    icon: Award,
  },
  goal: {
    label: "Próximo gran objetivo",
    icon: Target,
  },
};

export const timelineStatusMeta: Record<TimelineItemStatus, { label: string; description: string }> = {
  past: {
    label: "Impacto consolidado",
    description: "Tramo ya vivido y convertido en señal real de trayectoria.",
  },
  future: {
    label: "Próximo gran objetivo",
    description: "Punto aún abierto, visible como dirección y tensión futura.",
  },
};

export const timelineImpactMeta: Record<EventImpact, { label: string }> = {
  low: { label: "Impacto inicial" },
  medium: { label: "Impacto sostenido" },
  high: { label: "Impacto fuerte" },
  life_changing: { label: "Cambio de trayectoria" },
};
