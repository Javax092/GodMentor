import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { iconMap } from "@/lib/constants";

export function PillarProgressCard({
  pillar
}: {
  pillar: {
    name: string;
    description: string;
    icon: string;
    todayProgress: number;
    completionRate: number;
    metricLabel: string;
  };
}) {
  const Icon = iconMap[pillar.icon as keyof typeof iconMap] ?? iconMap.Sparkles;

  return (
    <Card className="border-white/10">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <Icon className="size-5 text-cyan-200" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-[-0.04em] text-white">{pillar.name}</p>
            <p className="text-sm text-slate-400">{pillar.description}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>{pillar.metricLabel}</span>
            <span>{pillar.todayProgress}% hoje</span>
          </div>
          <Progress value={pillar.todayProgress} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300">
          Consistência histórica: {pillar.completionRate}%
        </div>
      </CardContent>
    </Card>
  );
}
