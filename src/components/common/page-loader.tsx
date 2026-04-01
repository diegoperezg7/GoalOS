export function PageLoader() {
  return (
    <div className="glass-card flex min-h-[240px] items-center justify-center px-6 py-10">
      <div className="space-y-3 text-center">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-2xl bg-primary/20" />
        <p className="text-sm text-muted-foreground">Cargando vista...</p>
      </div>
    </div>
  );
}
