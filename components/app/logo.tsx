export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/12 text-sm font-semibold tracking-[0.24em] text-primary">
        EA
      </div>
      <div>
        <p className="text-base font-semibold tracking-[0.18em] text-foreground uppercase">
          Evolua AI
        </p>
        <p className="text-xs text-muted-foreground">Lugar de Luz</p>
      </div>
    </div>
  );
}
