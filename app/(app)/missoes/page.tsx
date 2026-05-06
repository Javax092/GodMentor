import { seedUserWorkspaceAction } from "@/app/(app)/actions";
import { MissionCard } from "@/components/app/mission-card";
import { PillarProgressCard } from "@/components/app/pillar-progress-card";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth";
import { getAppOverview } from "@/lib/queries";

export default async function MissionsPage() {
  const session = await requireSession();
  const data = await getAppOverview(session.userId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">7 desafios do dia</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-white">Missões que mantêm sua evolução em movimento</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Execução, vendas, corpo, aprendizado, reputação, disciplina e reflexão estão organizados para você abrir o app e agir.
          </p>
        </div>
        <form action={seedUserWorkspaceAction}>
          <Button type="submit" size="lg">Preparar missões de hoje</Button>
        </form>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.pillarsProgress.map((pillar) => (
          <PillarProgressCard key={pillar.id} pillar={{ ...pillar, icon: pillar.icon as never }} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {data.missionsToday.map((mission) => (
          <MissionCard key={mission.missionId} mission={mission} />
        ))}
      </section>
    </div>
  );
}
