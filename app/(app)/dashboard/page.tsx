import { seedUserWorkspaceAction } from "@/app/(app)/actions";
import { AchievementGrid } from "@/components/app/achievement-grid";
import { AiMentorCard } from "@/components/app/ai-mentor-card";
import { DashboardHero } from "@/components/app/dashboard-hero";
import { EmptyState } from "@/components/app/empty-state";
import { KpiCard } from "@/components/app/kpi-card";
import { MissionCard } from "@/components/app/mission-card";
import { PillarProgressCard } from "@/components/app/pillar-progress-card";
import { StreakCard } from "@/components/app/streak-card";
import { XpProgressCard } from "@/components/app/xp-progress-card";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth";
import { getAppOverview } from "@/lib/queries";

export default async function DashboardPage() {
  const session = await requireSession();
  const data = await getAppOverview(session.userId);

  return (
    <div className="space-y-6 md:space-y-8">
      <DashboardHero hero={data.hero} level={data.level} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((kpi) => (
          <KpiCard key={kpi.id} {...kpi} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <XpProgressCard xp={{ ...data.xp, level: data.level }} />
          <StreakCard current={data.streak.current} best={data.streak.best} />
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Próximas missões</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">O que fecha seu dia</h2>
              </div>
              <form action={seedUserWorkspaceAction}>
                <Button type="submit" variant="outline">
                  Preparar meu dia
                </Button>
              </form>
            </div>
            {data.missionsToday.length ? (
              <div className="grid gap-4">
                {data.missionsToday.slice(0, 3).map((mission) => (
                  <MissionCard key={mission.missionId} mission={mission} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<span className="text-lg text-cyan-200">01</span>}
                title="Sem missões ativas"
                description="Ative seu workspace diário para gerar os 7 desafios do dia com XP e tracking."
                action={
                  <form action={seedUserWorkspaceAction}>
                    <Button type="submit">Gerar missões do dia</Button>
                  </form>
                }
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <AiMentorCard title={data.aiCards[0]?.title ?? "Mentor IA"} content={data.aiCards[0]?.content ?? "Sem leitura suficiente ainda."} />
          <div className="grid gap-4">
            {data.pillarsProgress.slice(0, 4).map((pillar) => (
              <PillarProgressCard
                key={pillar.id}
                pillar={{ ...pillar, icon: pillar.icon as never }}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Conquistas</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">Micro-vitórias que aumentam retenção</h2>
        </div>
        <AchievementGrid achievements={data.achievements.map((item) => ({ ...item, icon: item.icon as never }))} />
      </section>
    </div>
  );
}
