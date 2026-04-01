import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarClock } from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import { GlobalActionFab } from "@/components/layout/global-action-fab";
import { navigationItems } from "@/components/layout/navigation";
import { Avatar } from "@/components/ui/avatar";
import { useMotivationalPhrase } from "@/hooks/use-motivational-phrase";
import { useAppStore } from "@/store/use-app-store";

const routeCopy: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Home",
    description: "Resumen compacto del momento: foco actual, señales recientes y siguiente movimiento.",
  },
  "/timeline": {
    title: "Timeline",
    description: "Wins, life events, logros y objetivos futuros leídos dentro de una sola línea de vida.",
  },
  "/goals": {
    title: "Goals",
    description: "Metas activas, anuales y de largo plazo organizadas sin fragmentar la experiencia.",
  },
  "/progress": {
    title: "Progress",
    description: "Financial Ladder, stats, señales de avance e insights en una sola capa.",
  },
  "/profile": {
    title: "Perfil",
    description: "Ajustes, persistencia y restauración del seed real del sistema.",
  },
  "/chat": {
    title: "Chat IA",
    description: "Conversación directa con tu asistente personal. Tiene acceso completo a todos tus datos.",
  },
};

export function AppShell() {
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const shouldReduceMotion = useReducedMotion();
  const motivationalPhrase = useMotivationalPhrase();
  const lastPath = location.pathname.startsWith("/goals/") ? "/goals" : location.pathname;
  const copy = routeCopy[lastPath] ?? routeCopy["/"];

  return (
    <div className="app-shell-grid min-h-screen pb-[calc(6.2rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4 md:grid-cols-[286px_minmax(0,1fr)] md:gap-6 md:px-6 md:py-6">
        <aside className="glass-card subtle-grid sticky top-6 hidden h-[calc(100dvh-3rem)] flex-col justify-between overflow-hidden p-5 md:flex">
          <div className="min-h-0 flex-1 space-y-8 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src="/goalos-mark.svg" alt="GoalOS" className="h-16 w-16 shrink-0 drop-shadow-[0_0_32px_rgba(34,211,238,0.34)]" />
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-primary/80">GoalOS / LifeOS</p>
                  <p className="font-display text-lg font-semibold">4 áreas principales</p>
                  <p className="text-sm text-muted-foreground">Home, Timeline, Goals y Progress. Sin ruido, sin menús duplicados.</p>
                </div>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-slate-950/45 p-4">
                <p className="text-sm text-muted-foreground">North Star</p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={motivationalPhrase}
                    className="mt-2 text-sm leading-relaxed text-foreground/90"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {motivationalPhrase}
                  </motion.p>
                </AnimatePresence>
                <p className="mt-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground/50">Tu North Star</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground/70">{user.quote}</p>
              </div>
            </div>

            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all",
                      isActive ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/6 hover:text-foreground",
                    ].join(" ")
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
              <NavLink
                to="/chat"
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all",
                    isActive ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/6 hover:text-foreground",
                  ].join(" ")
                }
              >
                {/* chat icon — inline svg, no import needed */}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                Chat
              </NavLink>
            </nav>
          </div>

          <Link to="/profile" className="rounded-[28px] border border-white/10 bg-gradient-to-br from-teal-400/15 via-transparent to-amber-400/10 p-4 transition-colors hover:bg-white/[0.06]">
            <p className="text-xs uppercase tracking-[0.24em] text-primary/80">System</p>
            <h3 className="mt-2 text-lg font-semibold">Perfil y restauración</h3>
            <p className="mt-2 text-sm text-muted-foreground">Acceso a ajustes sin convertirlos en una sección principal más.</p>
          </Link>
        </aside>

        <div className="min-w-0 space-y-3 md:space-y-6">
          <header className="glass-card flex items-start justify-between gap-3 px-4 py-3.5 md:px-6 md:py-4">
            <div className="flex min-w-0 items-start gap-3">
              <img src="/goalos-mark.svg" alt="GoalOS" className="mt-0.5 h-14 w-14 shrink-0 drop-shadow-[0_0_28px_rgba(34,211,238,0.3)]" />
              <div className="min-w-0 space-y-1">
                <p className="text-[10px] uppercase tracking-[0.28em] text-primary/80 sm:text-xs">GoalOS / LifeOS</p>
                <h1 className="truncate text-xl font-semibold sm:text-2xl md:text-3xl">{copy.title}</h1>
                <p className="hidden max-w-2xl text-[13px] leading-relaxed text-muted-foreground sm:block sm:text-sm">{copy.description}</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-muted-foreground lg:flex lg:items-center lg:gap-2">
                <CalendarClock className="h-4 w-4 text-primary" />
                {new Intl.DateTimeFormat("es-ES", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                }).format(new Date())}
              </div>
              <Link to="/profile" aria-label="Abrir perfil">
                <Avatar label={user.avatar} />
              </Link>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
              transition={shouldReduceMotion ? { duration: 0.12 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
        </div>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center gap-1 rounded-[28px] border border-white/10 bg-slate-950/92 p-1.5 backdrop-blur-xl md:hidden">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[20px] px-1.5 py-2 text-[10px] font-medium transition-all",
                isActive ? "bg-white/10 text-foreground" : "text-muted-foreground",
              ].join(" ")
            }
          >
            <item.icon className="h-4 w-4" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
        <NavLink
          to="/chat"
          className={({ isActive }) =>
            [
              "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[20px] px-1.5 py-2 text-[10px] font-medium transition-all",
              isActive ? "bg-white/10 text-foreground" : "text-muted-foreground",
            ].join(" ")
          }
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          <span className="truncate">Chat</span>
        </NavLink>
      </nav>
      <GlobalActionFab />
    </div>
  );
}
