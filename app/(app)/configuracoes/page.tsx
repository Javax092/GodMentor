import { Card, CardContent } from "@/components/ui/card";
import { requireSession } from "@/lib/auth";
import { getAppOverview } from "@/lib/queries";

export default async function SettingsPage() {
  const session = await requireSession();
  const data = await getAppOverview(session.userId);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Configurações</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-white">Permissões por plano e controle da experiência</h1>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ConfigCard label="Plano atual" value={data.plan.name} description={data.plan.description} />
        <ConfigCard label="Analytics avançado" value={data.plan.hasAdvancedAnalytics ? "Ativo" : "Bloqueado"} description="Estrutura preparada para liberar ou restringir páginas e blocos." />
        <ConfigCard label="Voz IA" value={data.plan.hasVoiceAi ? "Ativa" : "Bloqueada"} description="Tier Elite reserva automações e experiências premium." />
      </section>
    </div>
  );
}

function ConfigCard({ label, value, description }: { label: string; value: string; description: string }) {
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
