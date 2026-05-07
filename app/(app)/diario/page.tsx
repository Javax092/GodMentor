import { CheckInManager } from "@/components/app/check-in-manager";
import { DailyInsightCard } from "@/components/app/daily-insight-card";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAppOverview } from "@/lib/queries";

export default async function DiaryPage() {
  const session = await requireSession();
  const data = await getAppOverview(session.userId);
  const checkIns = await prisma.checkIn.findMany({
    where: { userId: session.userId },
    orderBy: { date: "desc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Diário inteligente</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-white">Registre o que aconteceu, o que sentiu e o que aprendeu</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Escreva sem filtro. A IA organiza depois. Seu padrão aparece quando você escreve com frequência.
        </p>
      </div>
      <CheckInManager initialCheckIns={checkIns as never} />
      <section className="grid gap-4 xl:grid-cols-3">
        {data.aiCards.slice(0, 3).map((card) => (
          <DailyInsightCard key={card.id} title={card.title} content={card.content} />
        ))}
      </section>
    </div>
  );
}
