import { AchievementGrid } from "@/components/app/achievement-grid";
import { XpProgressCard } from "@/components/app/xp-progress-card";
import { Card, CardContent } from "@/components/ui/card";
import { requireSession } from "@/lib/auth";
import { getAppOverview } from "@/lib/queries";

export default async function RankingPage() {
  const session = await requireSession();
  const data = await getAppOverview(session.userId);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Gamificação</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-white">Nível, XP, badges e comparação com sua semana anterior</h1>
      </div>
      <XpProgressCard xp={{ ...data.xp, level: data.level }} />
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/10">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Plano atual</p>
            <p className="mt-2 text-2xl font-semibold text-white">{data.plan.name}</p>
            <p className="mt-2 text-sm text-slate-300">{data.plan.description}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Semana anterior</p>
            <p className="mt-2 text-2xl font-semibold text-white">{data.xp.variation > 0 ? "+" : ""}{data.xp.variation}%</p>
            <p className="mt-2 text-sm text-slate-300">Sua referência principal é você mesmo.</p>
          </CardContent>
        </Card>
        <Card className="border-white/10">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Ranking opcional</p>
            <p className="mt-2 text-2xl font-semibold text-white">{data.plan.tier === "FREE" ? "Bloqueado" : "Ativo"}</p>
            <p className="mt-2 text-sm text-slate-300">Ative Pro ou Elite para expandir comparativos e liga social.</p>
          </CardContent>
        </Card>
      </section>
      <AchievementGrid achievements={data.achievements.map((item) => ({ ...item, icon: item.icon as never }))} />
    </div>
  );
}
