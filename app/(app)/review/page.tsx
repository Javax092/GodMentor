import { ReviewsManager } from "@/components/app/reviews-manager";
import { WeeklyReviewAiSummary } from "@/components/app/weekly-review-ai-summary";
import { Card, CardContent } from "@/components/ui/card";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAppOverview } from "@/lib/queries";

export default async function ReviewPage() {
  const session = await requireSession();
  const data = await getAppOverview(session.userId);
  const review = data.latestWeeklyReview;
  const [weeklyReviews, monthlyReviews] = await Promise.all([
    prisma.weeklyReview.findMany({
      where: { userId: session.userId },
      orderBy: { weekStart: "desc" }
    }),
    prisma.monthlyReview.findMany({
      where: { userId: session.userId },
      orderBy: { month: "desc" }
    })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Revisão semanal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-white">Transforme execução em aprendizado</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Veja o que funcionou, o que travou e o que precisa mudar. Não é sobre culpa. É sobre ajuste.
        </p>
      </div>
      <ReviewsManager initialWeeklyReviews={weeklyReviews} initialMonthlyReviews={monthlyReviews} />
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <WeeklyReviewAiSummary content={review?.aiSummary ?? "Sua revisão semanal da IA aparecerá aqui quando houver material suficiente."} />
        <Card className="border-white/10">
          <CardContent className="space-y-3 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Resumo da semana</p>
            <p className="text-sm leading-7 text-slate-300">
              {review?.worked ?? "Sem revisão salva ainda. Capture aqui o que funcionou para transformar execução em aprendizado."}
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
