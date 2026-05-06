import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LevelBadge } from "@/components/app/level-badge";

export function XpProgressCard({
  xp
}: {
  xp: {
    total: number;
    today: number;
    week: number;
    variation: number;
    level: {
      current: { rank: number; name: string };
      next: { name: string };
      progressPercent: number;
      xpToNext: number;
    };
  };
}) {
  return (
    <Card className="border-cyan-400/15 bg-[linear-gradient(180deg,rgba(34,211,238,0.10),rgba(255,255,255,0.02))]">
      <CardContent className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/70">Level / XP</p>
            <LevelBadge levelName={xp.level.current.name} rank={xp.level.current.rank} />
            <p className="text-3xl font-semibold tracking-[-0.06em] text-white">{xp.total} XP</p>
          </div>
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
            <Sparkles className="size-5 text-cyan-200" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>Barra de evolução</span>
            <span>{xp.level.progressPercent}%</span>
          </div>
          <Progress value={xp.level.progressPercent} className="h-3" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Hoje" value={`+${xp.today} XP`} />
          <Metric label="Semana" value={`+${xp.week} XP`} />
          <Metric
            label="Próximo nível"
            value={`${xp.level.xpToNext} XP`}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-white">{value}</p>
    </div>
  );
}
