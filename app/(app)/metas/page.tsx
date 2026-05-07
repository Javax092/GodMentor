import { GoalsClientPage } from "@/components/app/goals-client-page";
import { requireSession } from "@/lib/auth";
import { getAppOverview } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/card";

export default async function GoalsPage() {
  const session = await requireSession();
  const data = await getAppOverview(session.userId);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Metas ativas</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-white">Escolha poucas batalhas e vença com consistência</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Toda meta precisa de uma próxima ação. Sem próxima ação, a meta vira desejo.
        </p>
      </div>
      <section className="grid gap-4 md:grid-cols-3">
        <FeatureCard label="Plano" value={data.plan.name} description="Seu sistema atual define profundidade, histórico e IA disponível." />
        <FeatureCard label="Pilares liberados" value={data.plan.pillarsLimit ? String(data.plan.pillarsLimit) : "7"} description="Poucos pilares bem escolhidos criam mais avanço que excesso de frentes." />
        <FeatureCard label="Metas avançadas" value={data.plan.hasAdvancedGoals ? "Ativas" : "Bloqueadas"} description="Metas fortes precisam virar direção operacional, não só intenção." />
      </section>
      <GoalsClientPage goals={data.goals} />
    </div>
  );
}

function FeatureCard({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <Card className="border-white/10">
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        <p className="mt-2 text-sm text-slate-300">{description}</p>
      </CardContent>
    </Card>
  );
}
