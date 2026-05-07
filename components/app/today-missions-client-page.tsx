"use client";

import { useMemo, useState } from "react";
import { MissionPriority, MissionStatus } from "@prisma/client";
import { CheckCircle2, Clock3, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PrepareMissionsButton } from "@/components/app/prepare-missions-button";
import { useToast } from "@/components/app/toast-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { dailyMissionCategoryLabels, missionPriorityLabels } from "@/lib/constants";
import { cn } from "@/lib/utils";

type TodayMission = {
  id: string;
  title: string;
  description: string;
  category: keyof typeof dailyMissionCategoryLabels;
  priority: MissionPriority;
  status: MissionStatus;
  xpReward: number;
  completedAt: string | Date | null;
};

const priorityTone = {
  HIGH: "border-rose-400/30 bg-rose-500/10 text-rose-100",
  MEDIUM: "border-amber-300/25 bg-amber-400/10 text-amber-100",
  LOW: "border-cyan-400/25 bg-cyan-400/10 text-cyan-100"
} as const;

const categoryTone: Record<keyof typeof dailyMissionCategoryLabels, string> = {
  estudo: "border-sky-400/20 bg-sky-400/10 text-sky-100",
  treino: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
  vendas: "border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-100",
  conteudo: "border-violet-400/20 bg-violet-400/10 text-violet-100",
  saude: "border-teal-400/20 bg-teal-400/10 text-teal-100",
  foco: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
  pessoal: "border-slate-200/15 bg-white/5 text-slate-100"
};

export function TodayMissionsClientPage({ initialMissions }: { initialMissions: TodayMission[] }) {
  const { showToast } = useToast();
  const [missions, setMissions] = useState(initialMissions);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  const completedCount = useMemo(
    () => missions.filter((mission) => mission.status === MissionStatus.COMPLETED).length,
    [missions]
  );
  const sortedMissions = useMemo(
    () =>
      [...missions].sort((left, right) => {
        const completionDelta =
          Number(left.status === MissionStatus.COMPLETED) - Number(right.status === MissionStatus.COMPLETED);
        if (completionDelta !== 0) {
          return completionDelta;
        }

        const priorityRank = {
          [MissionPriority.HIGH]: 0,
          [MissionPriority.MEDIUM]: 1,
          [MissionPriority.LOW]: 2
        };

        return priorityRank[left.priority] - priorityRank[right.priority];
      }),
    [missions]
  );
  const totalCount = missions.length;
  const progressPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  const topMission = missions.find((mission) => mission.status !== MissionStatus.COMPLETED);
  const pendingMissions = missions.filter((mission) => mission.status !== MissionStatus.COMPLETED);
  const progressMessage = !missions.length
    ? "Seu sistema ainda não definiu o dia."
    : progressPercent === 100
      ? "Dia fechado. Amanhã você volta mais forte."
      : progressPercent >= 75
        ? "Ainda falta pouco para fechar o dia."
        : progressPercent >= 40
          ? "Sua consistência está sendo construída em blocos pequenos."
          : "Hoje é um dia de execução.";

  async function toggleMission(id: string) {
    const current = missions.find((mission) => mission.id === id);
    if (!current) {
      return;
    }

    setPendingIds((state) => [...state, id]);
    setMissions((state) =>
      state.map((mission) =>
        mission.id === id
          ? {
              ...mission,
              status: mission.status === MissionStatus.COMPLETED ? MissionStatus.PENDING : MissionStatus.COMPLETED,
              completedAt: mission.status === MissionStatus.COMPLETED ? null : new Date().toISOString()
            }
          : mission
      )
    );

    const response = await fetch(`/api/missions/${id}/toggle`, { method: "PATCH" });
    const data = await response.json().catch(() => null);
    setPendingIds((state) => state.filter((value) => value !== id));

    if (!response.ok) {
      setMissions((state) => state.map((mission) => (mission.id === id ? current : mission)));
      showToast({
        tone: "error",
        title: "Não foi possível atualizar a missão",
        description: data?.error ?? "Tente novamente."
      });
      return;
    }

    setMissions((state) => state.map((mission) => (mission.id === id ? data.mission : mission)));
    showToast({
      tone: "success",
      title: data?.mission?.status === MissionStatus.COMPLETED ? "Missão concluída" : "Conclusão desfeita",
      description: data?.message ?? "Seu plano de hoje foi atualizado."
    });
  }

  if (!missions.length) {
    return (
      <EmptyState
        icon={<Sparkles className="size-7 text-cyan-200" />}
        title="Seu plano de hoje ainda não foi preparado"
        description="Sem plano, o dia abre espaço para distração. Gere missões claras e comece pela frente que mais move sua semana."
        action={<PrepareMissionsButton className="gap-2" size="lg" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="hero-glow border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]">
          <CardContent className="space-y-5 p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.26em] text-cyan-100/80">Centro de execução</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-white">{progressPercent}% concluído</h2>
                <p className="mt-2 text-sm font-medium leading-6 text-cyan-50">{progressMessage}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {completedCount} de {totalCount} missões fechadas. Feche o dia antes de abrir novas distrações.
                </p>
              </div>
              <div className="premium-badge rounded-[24px] border border-cyan-400/20 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">XP em jogo</p>
                <p className="mt-1 text-xl font-semibold text-cyan-50">+{missions.reduce((sum, mission) => sum + mission.xpReward, 0)}</p>
              </div>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Abertas</p>
                <p className="mt-1 text-lg font-semibold text-white">{pendingMissions.length}</p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Concluídas</p>
                <p className="mt-1 text-lg font-semibold text-white">{completedCount}</p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Sinal do dia</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {pendingMissions.length ? "A próxima missão importa mais que a motivação." : "Plano fechado com consistência."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10">
          <CardContent className="space-y-4 p-5 md:p-6">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Missão principal</p>
            {topMission ? (
              <>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold tracking-[-0.04em] text-white">{topMission.title}</h3>
                  <p className="text-sm leading-6 text-cyan-50">Concluir agora.</p>
                  <p className="text-sm leading-6 text-slate-300">{topMission.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={cn("border", priorityTone[topMission.priority])}>{missionPriorityLabels[topMission.priority]}</Badge>
                  <Badge className={cn("border", categoryTone[topMission.category])}>{dailyMissionCategoryLabels[topMission.category]}</Badge>
                  <Badge className="border border-emerald-400/20 bg-emerald-400/10 text-emerald-100">+{topMission.xpReward} XP</Badge>
                </div>
              </>
            ) : (
              <p className="text-sm leading-6 text-slate-300">Todas as missões do dia já foram concluídas. Dia fechado. Amanhã você volta mais forte.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4">
        {sortedMissions.map((mission) => {
          const busy = pendingIds.includes(mission.id);
          const completed = mission.status === MissionStatus.COMPLETED;

          return (
            <Card
              key={mission.id}
              className={cn(
                "border-white/10 transition-colors",
                completed ? "bg-emerald-500/10" : "bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))]"
              )}
            >
              <CardContent className="space-y-4 p-5 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={cn("border", categoryTone[mission.category])}>{dailyMissionCategoryLabels[mission.category]}</Badge>
                      <Badge className={cn("border", priorityTone[mission.priority])}>{missionPriorityLabels[mission.priority]}</Badge>
                      <Badge className="border border-white/10 bg-white/5 text-slate-100">+{mission.xpReward} XP</Badge>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold tracking-[-0.04em] text-white">{mission.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{mission.description}</p>
                      <p className="mt-2 text-sm font-medium text-cyan-100/90">
                        {completed ? "Missão concluída. Seu plano avançou." : "Missões que movem sua semana."}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    className="gap-2"
                    variant={completed ? "outline" : "default"}
                    disabled={busy}
                    onClick={() => toggleMission(mission.id)}
                  >
                    {busy ? (
                      <Spinner />
                    ) : completed ? (
                      <RotateCcw className="size-4" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    {completed ? "Desfazer" : "Concluir agora"}
                  </Button>
                </div>

                <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-3">
                  <div className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3">
                    <p className="flex items-center gap-2 text-slate-400">
                      <Clock3 className="size-4" />
                      Status
                    </p>
                    <p className="mt-1 font-medium text-white">{completed ? "Missão concluída" : "Você ainda tem missões abertas"}</p>
                  </div>
                  <div className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3">
                    <p className="flex items-center gap-2 text-slate-400">
                      <Trophy className="size-4" />
                      Recompensa
                    </p>
                    <p className="mt-1 font-medium text-white">+{mission.xpReward} XP ao concluir</p>
                  </div>
                  <div className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3">
                    <p className="flex items-center gap-2 text-slate-400">
                      <Sparkles className="size-4" />
                      Resultado
                    </p>
                    <p className="mt-1 font-medium text-white">{completed ? "Fechada e registrada" : "Aguardando execução real"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {pendingMissions.length ? (
        <Card className="border-white/10">
          <CardContent className="p-5 md:p-6">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Próximas pendências</p>
            <p className="mt-2 text-sm text-slate-300">Você ainda tem missões abertas. Feche as pendências antes de abrir novas frentes.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {pendingMissions.map((mission) => (
                <Badge key={mission.id} className="border border-white/10 bg-white/5 text-slate-100">
                  {mission.title}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
