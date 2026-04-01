import type { ColorToken } from "@/types";

export const colorTokenMap: Record<
  ColorToken,
  {
    ring: string;
    soft: string;
    text: string;
    glow: string;
  }
> = {
  aqua: {
    ring: "bg-teal-400",
    soft: "from-teal-400/20 via-cyan-400/10 to-transparent",
    text: "text-teal-200",
    glow: "shadow-[0_0_30px_rgba(45,212,191,0.22)]",
  },
  amber: {
    ring: "bg-amber-400",
    soft: "from-amber-300/20 via-orange-300/10 to-transparent",
    text: "text-amber-200",
    glow: "shadow-[0_0_30px_rgba(251,191,36,0.24)]",
  },
  rose: {
    ring: "bg-rose-400",
    soft: "from-rose-400/20 via-pink-400/10 to-transparent",
    text: "text-rose-200",
    glow: "shadow-[0_0_30px_rgba(251,113,133,0.22)]",
  },
  emerald: {
    ring: "bg-emerald-400",
    soft: "from-emerald-400/20 via-lime-300/10 to-transparent",
    text: "text-emerald-200",
    glow: "shadow-[0_0_30px_rgba(52,211,153,0.22)]",
  },
  violet: {
    ring: "bg-violet-400",
    soft: "from-violet-400/20 via-fuchsia-300/10 to-transparent",
    text: "text-violet-200",
    glow: "shadow-[0_0_30px_rgba(167,139,250,0.24)]",
  },
  sky: {
    ring: "bg-sky-400",
    soft: "from-sky-400/20 via-blue-300/10 to-transparent",
    text: "text-sky-200",
    glow: "shadow-[0_0_30px_rgba(56,189,248,0.22)]",
  },
};
