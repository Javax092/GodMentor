import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/app/empty-state";
import { iconMap } from "@/lib/constants";

export function KpiCard({
  label,
  value,
  icon,
  microcopy,
  progress,
  variation,
  empty
}: {
  label: string;
  value: string;
  icon: string;
  microcopy: string;
  progress: number;
  variation: number;
  empty?: string | null;
}) {
  const Icon = iconMap[icon as keyof typeof iconMap] ?? iconMap.Sparkles;

  if (empty) {
    return (
      <EmptyState
        icon={<Icon className="size-5 text-cyan-300" />}
        title={label}
        description={empty}
      />
    );
  }

  const TrendIcon = variation > 0 ? TrendingUp : variation < 0 ? TrendingDown : Minus;
  const trendTone = variation > 0 ? "text-emerald-300" : variation < 0 ? "text-rose-300" : "text-slate-300";

  return (
    <Card className="border-white/10">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</p>
            <p className="text-2xl font-semibold tracking-[-0.05em] text-white">{value}</p>
          </div>
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
            <Icon className="size-5 text-cyan-200" />
          </div>
        </div>
        <Progress value={progress} />
        <div className="flex items-center justify-between gap-3 text-sm">
          <p className="max-w-[18rem] text-slate-400">{microcopy}</p>
          <p className={`flex shrink-0 items-center gap-1 font-medium ${trendTone}`}>
            <TrendIcon className="size-4" />
            {variation > 0 ? "+" : ""}
            {variation}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
