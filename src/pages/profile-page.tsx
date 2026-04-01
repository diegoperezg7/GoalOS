import { Database, RefreshCcw, Save, ServerCog, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import { PageTransition } from "@/components/common/page-transition";
import { SectionHeading } from "@/components/common/section-heading";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { focusAreaOptions } from "@/data/options";
import { shouldRequireAIdentityAuth } from "@/services/auth/aidentity";
import { useAppStore } from "@/store/use-app-store";

export function ProfilePage() {
  const account = useAppStore((state) => state.account);
  const user = useAppStore((state) => state.user);
  const resetApp = useAppStore((state) => state.resetApp);
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);
  const [name, setName] = useState(user.name);
  const [quote, setQuote] = useState(user.quote);
  const [focusAreas, setFocusAreas] = useState<string[]>(user.focusAreas);
  const requiresAIdentityAuth = shouldRequireAIdentityAuth();

  useEffect(() => {
    setName(user.name);
    setQuote(user.quote);
    setFocusAreas(user.focusAreas);
  }, [user.focusAreas, user.name, user.quote]);

  return (
    <PageTransition>
      <SectionHeading
        eyebrow="Profile"
        title="Perfil y ajustes"
        description="Perfil personal, persistencia y restauración del seed real del sistema."
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <Avatar label={user.avatar} className="h-12 w-12 text-base sm:h-14 sm:w-14 sm:text-lg" />
            <div>
              <h2 className="text-xl font-semibold sm:text-2xl">{user.name}</h2>
              <p className="text-[13px] text-muted-foreground sm:text-sm">Nivel {user.level} · {user.xp} XP</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant={account ? "success" : requiresAIdentityAuth ? "warning" : "info"}>
              {account ? "Cuenta AIdentity" : requiresAIdentityAuth ? "Acceso pendiente" : "Modo local"}
            </Badge>
            {account?.email ? <Badge variant="info">{account.email}</Badge> : null}
            {account?.role ? <Badge>{account.role}</Badge> : null}
          </div>
          <div className="mt-5 rounded-[20px] border border-white/10 bg-white/[0.03] p-3.5 text-[13px] text-muted-foreground sm:mt-6 sm:rounded-[24px] sm:p-4 sm:text-sm">
            {user.quote}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {user.focusAreas.map((area) => (
              <Badge key={area} variant="info">
                {area}
              </Badge>
            ))}
          </div>
        </Card>

        <div className="grid gap-4">
          <Card className="p-4 sm:p-5">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-white/6 p-2.5 sm:rounded-2xl sm:p-3">
                <UserRound className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold sm:text-xl">Perfil personal</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                  Ajusta tu nombre, tus áreas foco y la frase central sin repetir el onboarding.
                </p>
                <div className="mt-5 grid gap-4">
                  <label className="space-y-2 text-sm" htmlFor="profile-name">
                    <span className="text-muted-foreground">Nombre visible</span>
                    <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} />
                  </label>
                  <label className="space-y-2 text-sm" htmlFor="profile-quote">
                    <span className="text-muted-foreground">Frase de perfil</span>
                    <Textarea
                      id="profile-quote"
                      className="min-h-[96px]"
                      value={quote}
                      onChange={(event) => setQuote(event.target.value)}
                    />
                  </label>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Áreas prioritarias</span>
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      {focusAreaOptions.map((area) => {
                        const selected = focusAreas.includes(area);
                        return (
                          <button
                            key={area}
                            type="button"
                            onClick={() =>
                              setFocusAreas((current) =>
                                selected ? current.filter((item) => item !== area) : [...current, area],
                              )
                            }
                            className={[
                              "rounded-[18px] border px-3 py-2.5 text-left text-[13px] transition-all sm:rounded-[20px] sm:px-4 sm:py-3 sm:text-sm",
                              selected
                                ? "border-primary/30 bg-primary/10 text-foreground"
                                : "border-white/10 bg-white/[0.03] text-muted-foreground",
                            ].join(" ")}
                          >
                            {area}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      className="gap-2"
                      onClick={() =>
                        updateUserProfile({
                          name,
                          quote,
                          focusAreas,
                        })
                      }
                      disabled={name.trim().length < 2 || quote.trim().length < 12 || focusAreas.length === 0}
                    >
                      <Save className="h-4 w-4" />
                      Guardar cambios
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-white/6 p-2.5 sm:rounded-2xl sm:p-3">
                <Database className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold sm:text-xl">Persistencia</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                  {account
                    ? "Tu setup y tus cambios se guardan por cuenta AIdentity. Si ya completaste el onboarding una vez, no debería volver a pedírtelo en otro dispositivo."
                    : requiresAIdentityAuth
                      ? "Sin una sesión válida de AIdentity no se debería entrar a la app. El onboarding tiene que resolverse por cuenta, no por navegador."
                      : "Sin una cuenta autenticada la app cae a modo local y guarda el snapshot solo en este navegador."}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-white/6 p-2.5 sm:rounded-2xl sm:p-3">
                <ServerCog className="h-4 w-4 text-accent sm:h-5 sm:w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold sm:text-xl">IA</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                  `AIService` ya soporta proveedores desacoplados. La ruta natural aquí es usar Ollama local como primary provider.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold sm:text-xl">Restaurar seed base</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                  Restaura los goals, wins, life events y ladder reales cargados por defecto para este perfil.
                </p>
              </div>
              <Button variant="danger" className="gap-2" onClick={resetApp}>
                <RefreshCcw className="h-4 w-4" />
                Restaurar base
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
