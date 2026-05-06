import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
  icon
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0 space-y-2.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-[-0.04em] text-foreground md:text-4xl">{value}</p>
          <p className="text-xs leading-5 text-muted-foreground">{hint}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">{icon}</div>
      </CardContent>
    </Card>
  );
}
