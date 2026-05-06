import { FocusTimer } from "@/components/app/focus-timer";
import { Card, CardContent } from "@/components/ui/card";
import { requireSession } from "@/lib/auth";
import { getAppOverview } from "@/lib/queries";
import { formatShortDate } from "@/lib/utils";

export default async function FocusPage() {
  const session = await requireSession();
  const data = await getAppOverview(session.userId);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Pomodoro + Deep Work</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-white">Foco deliberado com XP e histórico real</h1>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <FocusTimer suggestedMinutes={50} />
        <Card className="border-white/10">
          <CardContent className="space-y-5 p-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <Metric label="Hoje" value={`${data.focus.totalToday} min`} />
              <Metric label="Semana" value={`${data.focus.totalWeek} min`} />
              <Metric label="Variação" value={`${data.focus.variation > 0 ? "+" : ""}${data.focus.variation}%`} />
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Melhor janela</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">{data.analytics.focusPattern}</p>
              <p className="mt-2 text-sm text-slate-300">Sua produtividade tende a responder melhor nessa faixa de horário.</p>
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Sessões recentes</p>
              {data.focus.recent.map((session) => (
                <div key={session.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
                  <span className="text-slate-200">{session.category ?? "Deep work"}</span>
                  <span className="text-slate-400">{session.durationMinutes} min • {formatShortDate(session.startedAt)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
