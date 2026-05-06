import { ReactNode } from "react";

export function FormSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="surface surface-panel space-y-5 p-5 md:p-7">
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">Input estruturado</p>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}
