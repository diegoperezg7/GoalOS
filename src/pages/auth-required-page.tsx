import { ArrowRight, RefreshCcw } from "lucide-react";
import { useState } from "react";

import { PageTransition } from "@/components/common/page-transition";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildPortalLoginUrl } from "@/services/auth/aidentity";
import { useAppStore } from "@/store/use-app-store";

export function AuthRequiredPage() {
  const initializeApp = useAppStore((state) => state.initializeApp);
  const [isRetrying, setIsRetrying] = useState(false);

  return (
    <PageTransition>
      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-3 py-4 sm:px-4 sm:py-6">
        <div className="grid w-full gap-4 lg:grid-cols-[1.02fr_0.98fr]">
          <Card className="overflow-hidden p-5 sm:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_38%)]" />
            <div className="relative space-y-5">
              <img src="/goalos-mark.svg" alt="GoalOS" className="h-24 w-24 drop-shadow-[0_0_36px_rgba(34,211,238,0.34)]" />

              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.28em] text-primary/80">AIdentity</p>
                <h1 className="max-w-2xl text-3xl font-semibold text-balance sm:text-4xl">
                  Accede con tu cuenta una vez y GoalOS debería recordarte en todos tus dispositivos.
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Si ya entraste desde el portal o tu sesión sigue activa, la app recuperará tu snapshot por cuenta y no debería volver a
                  pedirte el onboarding.
                </p>
              </div>

              <div className="grid gap-3">
                {[
                  "Onboarding asociado a tu cuenta, no a este navegador.",
                  "Acceso único compartido con el portal y el resto de apps.",
                  "Si la sesión ha caducado, vuelves a entrar y regresas a esta app.",
                ].map((item) => (
                  <div key={item} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.28em] text-primary/80">Acceso requerido</p>
                <h2 className="text-2xl font-semibold">No hay una sesión válida de AIdentity en esta app.</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Entra con tu cuenta y vuelve automáticamente a GoalOS. Si ya has iniciado sesión en otra pestaña, puedes reintentar
                  sin salir de aquí.
                </p>
              </div>

              <div className="grid gap-3">
                <Button
                  size="lg"
                  className="justify-between"
                  onClick={() => {
                    window.location.assign(buildPortalLoginUrl());
                  }}
                >
                  Entrar con AIdentity
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  disabled={isRetrying}
                  onClick={async () => {
                    setIsRetrying(true);
                    try {
                      await initializeApp();
                    } finally {
                      setIsRetrying(false);
                    }
                  }}
                >
                  <RefreshCcw className="h-4 w-4" />
                  {isRetrying ? "Comprobando sesión..." : "Ya he iniciado sesión"}
                </Button>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4 text-sm text-muted-foreground">
                Si entras directamente sin sesión activa, deberías pasar por el login del portal. Si entras desde el portal, el acceso
                debería ser transparente.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
