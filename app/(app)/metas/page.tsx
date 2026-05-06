import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireSession } from "@/lib/auth";
import { getAppOverview } from "@/lib/queries";
import { goalCategoryLabels } from "@/lib/constants";

export default async function GoalsPage() {
  const session = await requireSession();
  const data = await getAppOverview(session.userId);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Metas semanais e mensais</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-white">Objetivos ligados aos pilares que movem sua semana</h1>
      </div>
      <section className="grid gap-4 md:grid-cols-3">
        <FeatureCard label="Plano" value={data.plan.name} description={data.plan.description} />
        <FeatureCard label="Pilares liberados" value={data.plan.pillarsLimit ? String(data.plan.pillarsLimit) : "7"} description="Estrutura de permissões por plano pronta no código." />
        <FeatureCard label="Metas avançadas" value={data.plan.hasAdvancedGoals ? "Ativas" : "Bloqueadas"} description="Recursos premium podem ser abertos por tier." />
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        {data.goals.map((goal) => (
          <Card key={goal.id} className="border-white/10">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{goalCategoryLabels[goal.category]}</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-white">{goal.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{goal.description}</p>
                </div>
                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                  {goal.period}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>Progresso</span>
                  <span>{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
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
