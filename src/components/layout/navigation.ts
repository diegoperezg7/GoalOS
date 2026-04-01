import { Compass, LayoutDashboard, Target, TrendingUp } from "lucide-react";

export const navigationItems = [
  {
    label: "Home",
    to: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Timeline",
    to: "/timeline",
    icon: Compass,
  },
  {
    label: "Goals",
    to: "/goals",
    icon: Target,
  },
  {
    label: "Progress",
    to: "/progress",
    icon: TrendingUp,
  },
] as const;
