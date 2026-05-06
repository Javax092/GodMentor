import { WeeklyReviewAiSummary } from "@/components/app/weekly-review-ai-summary";
import { WeeklyReviewCard } from "@/components/app/weekly-review-card";
import { Card, CardContent } from "@/components/ui/card";
import { requireSession } from "@/lib/auth";
import { getAppOverview } from "@/lib/queries";

export default async function ReviewPage() {
  const session = await requireSession();
  const data = await getAppOverview(session.userId);
  const review = data.latestWeeklyReview;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Revisão semanal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-white">Vitórias, falhas, padrões e plano da próxima semana</h1>
      </div>
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <WeeklyReviewCard defaultValues={review ? {
          worked: review.worked,
          didntWork: review.didntWork,
          lesson: review.lesson,
          obstacle: review.obstacle,
          nextFocus: review.nextFocus,
          wins: review.wins,
          failures: review.failures,
          patterns: review.patterns,
          aiSummary: review.aiSummary
        } : null} />
        <div className="space-y-4">
          <WeeklyReviewAiSummary content={review?.aiSummary ?? "Sua revisão semanal da IA aparecerá aqui quando houver material suficiente."} />
          <Card className="border-white/10">
            <CardContent className="space-y-3 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Resumo da semana</p>
              <p className="text-sm leading-7 text-slate-300">{review?.worked ?? "Sem review salva ainda. Use este espaço para capturar o que funcionou."}</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
