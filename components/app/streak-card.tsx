import { Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StreakCard({ current, best }: { current: number; best: number }) {
  return (
    <Card className="border-white/10">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-orange-400/20 bg-orange-400/10 p-3">
            <Flame className="size-5 text-orange-200" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Streak</p>
            <p className="text-2xl font-semibold tracking-[-0.05em] text-white">{current} dias seguidos</p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
          Melhor sequência: {best} dias. Sequência forte não nasce de intensidade, mas de repetição protegida.
        </div>
      </CardContent>
    </Card>
  );
}
