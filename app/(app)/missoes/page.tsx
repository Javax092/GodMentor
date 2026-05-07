import { PrepareMissionsButton } from "@/components/app/prepare-missions-button";
import { TodayMissionsClientPage } from "@/components/app/today-missions-client-page";
import { PageHeader } from "@/components/app/page-header";
import { requireSession } from "@/lib/auth";
import { getTodayMissions } from "@/lib/missions";

export default async function MissionsPage() {
  const session = await requireSession();
  const missions = await getTodayMissions(session.userId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Centro de Execução"
        title="Plano de Hoje"
        description="Missões que movem sua semana. Abra, execute e feche o dia sem negociar com distrações."
        action={<PrepareMissionsButton className="gap-2" size="lg" />}
      />
      <TodayMissionsClientPage initialMissions={missions as never} />
    </div>
  );
}
