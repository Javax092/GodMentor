import { AiMentorCard } from "@/components/app/ai-mentor-card";
import { PatternDetectedCard } from "@/components/app/pattern-detected-card";
import { PositivePressureCard } from "@/components/app/positive-pressure-card";
import { WeeklyReviewAiSummary } from "@/components/app/weekly-review-ai-summary";
import { requireSession } from "@/lib/auth";
import { getAppOverview } from "@/lib/queries";

export default async function AiPage() {
  const session = await requireSession();
  const data = await getAppOverview(session.userId);
  const cards = data.aiCards;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Mentor IA</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-white">Menos conselho genérico. Mais direção baseada no seu comportamento.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          A IA observa seus registros, metas e missões para sugerir próximos passos, alertar padrões e ajustar sua direção.
        </p>
      </div>
      <section className="grid gap-4 xl:grid-cols-2">
        <AiMentorCard title={cards[0]?.title ?? "Resumo diário"} content={cards[0]?.content ?? "Sem insights suficientes ainda."} />
        <AiMentorCard title={cards[1]?.title ?? "Alerta"} content={cards[1]?.content ?? "Seu histórico ainda está curto para alertas robustos."} tone="alert" />
        <PatternDetectedCard content={cards.find((card) => card.title.toLowerCase().includes("padrão"))?.content ?? "Seu padrão mais forte ainda está em formação."} />
        <PositivePressureCard content={cards.find((card) => card.title.toLowerCase().includes("pressão"))?.content ?? "Feche hoje antes de buscar intensidade amanhã."} />
        <WeeklyReviewAiSummary content={cards.find((card) => card.title.toLowerCase().includes("revis"))?.content ?? "A revisão semanal da IA ficará mais precisa com mais dias de histórico."} />
        <AiMentorCard title="Plano de amanhã" content={`Comece por ${data.kpis.find((item) => item.id === "weekly-focus")?.value.toLowerCase() ?? "uma meta clara"}, depois proteja um bloco de foco e feche o check-in à noite.`} />
      </section>
    </div>
  );
}
