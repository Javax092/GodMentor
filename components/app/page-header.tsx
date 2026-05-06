import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function PageHeader({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode | null;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary">Evolua AI</p>
        <h1 className="max-w-4xl text-balance text-3xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-[15px] md:leading-7">{description}</p>
      </div>
      {action === undefined ? <Button>Nova ação</Button> : action}
    </div>
  );
}
