import { Card, CardContent } from "@/components/ui/card";
import { requireSession } from "@/lib/auth";
import { getAppOverview } from "@/lib/queries";

export default async function EvolutionPage() {
  const session = await requireSession();
  const data = await getAppOverview(session.userId);
  const maxXp = Math.max(...data.xp.history.map((item) => item.xp), 1);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Analytics</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-white">Evolução semanal, mensal e por pilar</h1>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Consistência semanal" value={`${data.analytics.weeklyConsistency}%`} />
        <Metric label="XP no mês" value={`${data.analytics.monthlyXp} XP`} />
        <Metric label="Pilar forte" value={data.analytics.strongestPillar?.name ?? "Sem dados"} />
        <Metric label="Pilar fraco" value={data.analytics.weakestPillar?.name ?? "Sem dados"} />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/10">
          <CardContent className="space-y-5 p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">XP por dia</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">Últimos 30 dias</h2>
            </div>
            <div className="flex h-64 items-end gap-2">
              {data.xp.history.map((item) => (
                <div key={item.key} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-2xl bg-[linear-gradient(180deg,rgba(34,211,238,0.95),rgba(34,211,238,0.18))]"
                    style={{ height: `${Math.max(12, Math.round((item.xp / maxXp) * 100))}%` }}
                  />
                  <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10">
          <CardContent className="space-y-4 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Streak histórico</p>
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-4xl font-semibold tracking-[-0.08em] text-white">{data.streak.best} dias</p>
              <p className="mt-2 text-sm text-slate-300">Melhor sequência registrada até agora.</p>
            </div>
            {data.analytics.dailyCompletionTimeline.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>{item.label}</span>
                  <span>{item.completed} missões • nota {item.score}/10</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.05]">
                  <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${Math.min(100, item.completed * 14)}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-white/10">
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">{value}</p>
      </CardContent>
    </Card>
  );
}
