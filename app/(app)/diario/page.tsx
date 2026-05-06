import { CheckInForm } from "@/components/app/check-in-form";
import { DailyInsightCard } from "@/components/app/daily-insight-card";
import { Card, CardContent } from "@/components/ui/card";
import { requireSession } from "@/lib/auth";
import { getAppOverview } from "@/lib/queries";
import { formatShortDate } from "@/lib/utils";

export default async function DiaryPage() {
  const session = await requireSession();
  const data = await getAppOverview(session.userId);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Reflexão e check-in</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-white">Feche o dia, proteja sua streak e entre amanhã com clareza</h1>
      </div>
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <CheckInForm defaultValues={data.checkIn.today ? {
          advanced: data.checkIn.today.advanced,
          failed: data.checkIn.today.failed,
          improveTomorrow: data.checkIn.today.improveTomorrow,
          energy: data.checkIn.today.energy,
          mood: data.checkIn.today.mood,
          dayScore: data.checkIn.today.dayScore,
          sleepHours: data.checkIn.today.sleepHours,
          aiSummary: data.checkIn.today.aiSummary
        } : null} />
        <div className="space-y-4">
          {data.aiCards.slice(0, 3).map((card) => (
            <DailyInsightCard key={card.id} title={card.title} content={card.content} />
          ))}
          <Card className="border-white/10">
            <CardContent className="space-y-3 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Histórico recente</p>
              {data.checkIn.recent.map((checkIn) => (
                <div key={checkIn.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                  {formatShortDate(checkIn.date)} • energia {checkIn.energy}/10 • nota {checkIn.dayScore}/10
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
