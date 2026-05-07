"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="surface surface-panel max-w-lg space-y-4 p-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">Erro</p>
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground">Algo saiu do trilho.</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          {error.message || "Houve uma falha inesperada. Tente novamente para recarregar o fluxo."}
        </p>
        <Button onClick={reset}>Tentar novamente</Button>
      </div>
    </main>
  );
}
