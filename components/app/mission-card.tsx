import { CheckCircle2, Clock3, History, PlayCircle } from "lucide-react";
import { completeMissionAction, toggleMissionProgressAction } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { iconMap } from "@/lib/constants";

export function MissionCard({
  mission
}: {
  mission: {
    id: string;
    missionId: string;
    pillarName: string;
    pillarKey: string;
    title: string;
    description: string;
    xpReward: number;
    status: string;
    progress: number;
    history: Array<{ date: Date; status: string; progress: number }>;
  };
}) {
  const Icon = iconMap.Target;
  const complete = mission.status === "COMPLETED";

  return (
    <Card className="border-white/10">
      <CardContent className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{mission.pillarName}</p>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <Icon className="size-5 text-cyan-200" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-[-0.04em] text-white">{mission.title}</h3>
                <p className="text-sm text-slate-400">{mission.description}</p>
              </div>
            </div>
          </div>
          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
            +{mission.xpReward} XP
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>Progresso</span>
            <span>{complete ? "Concluída" : `${mission.progress}%`}</span>
          </div>
          <Progress value={complete ? 100 : mission.progress} />
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <form action={toggleMissionProgressAction}>
            <input type="hidden" name="dailyMissionId" value={mission.id.startsWith("virtual-") ? "" : mission.id} />
            <input type="hidden" name="progress" value={Math.max(mission.progress, 60)} />
            <Button type="submit" variant="outline" className="w-full justify-center gap-2" disabled={complete || mission.id.startsWith("virtual-")}>
              <PlayCircle className="size-4" />
              Marcar em progresso
            </Button>
          </form>
          <form action={completeMissionAction}>
            <input type="hidden" name="missionId" value={mission.missionId} />
            <Button type="submit" className="w-full justify-center gap-2" disabled={complete}>
              <CheckCircle2 className="size-4" />
              {complete ? "Concluída" : "Concluir"}
            </Button>
          </form>
        </div>

        <div className="grid gap-2 text-xs text-slate-400">
          <p className="flex items-center gap-2">
            <Clock3 className="size-4" />
            Status atual: {complete ? "entrega fechada" : mission.status.toLowerCase().replace("_", " ")}
          </p>
          <p className="flex items-center gap-2">
            <History className="size-4" />
            Histórico recente: {mission.history.length ? `${mission.history.length} registros` : "nenhum registro ainda"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
