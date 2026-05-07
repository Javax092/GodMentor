import Link from "next/link";
import { Flame, NotebookPen, Radar, Sparkles, Target, Trophy } from "lucide-react";
import { PrepareMissionsButton } from "@/components/app/prepare-missions-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireSession } from "@/lib/auth";
import { dailyMissionCategoryLabels, missionPriorityLabels } from "@/lib/constants";
import { getTodayPlanData } from "@/lib/missions";

const secondaryCards = [
  { key: "streak", label: "Streak atual", icon: Flame },
  { key: "xp", label: "XP do dia", icon: Trophy },
  { key: "goals", label: "Metas em andamento", icon: Target },
  { key: "review", label: "Revisão pendente", icon: Radar },
  { key: "journal", label: "Último diário", icon: NotebookPen }
] as const;

export default async function DashboardPage() {
  const session = await requireSession();
  const plan = await getTodayPlanData(session.userId);

  const cta = plan.missions.length ? (
    <Button asChild size="lg" className="gap-2">
      <Link href="/missoes">Ver missões de hoje</Link>
    </Button>
  ) : (
    <PrepareMissionsButton className="gap-2" size="lg" />
  );

  const secondaryValues = {
    streak: `${plan.currentStreak} dias`,
    xp: `${plan.xpToday} XP`,
    goals: `${plan.goalsInProgress} ativas`,
    review: plan.reviewPending ? "Sim" : "Em dia",
    journal: plan.latestJournalEntry?.isToday ? "Hoje" : plan.latestJournalEntry ? "Registrado" : "Sem registro"
  } as const;

  const secondaryDescriptions = {
    streak: `Melhor sequência: ${plan.bestStreak} dias.`,
    xp: "XP acumulado apenas pelas entregas e rituais de hoje.",
    goals: "Quantidade de metas ativas ainda puxando seu sistema.",
    review: plan.reviewPending ? "Sua revisão semanal ainda não foi fechada." : "Sua revisão principal já foi registrada.",
    journal: plan.latestJournalEntry?.tomorrowPriority ?? "Use o diário para travar a intenção do dia."
  } as const;
  const weeklyFocusValue = plan.latestJournalEntry?.tomorrowPriority ?? plan.topMission?.title ?? "Definir a frente principal";

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="surface panel-grid hero-glow relative overflow-hidden border-white/10 p-5 md:p-7">
        <div className="absolute inset-x-16 top-0 h-40 rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="relative grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.26em] text-cyan-100/80">Plano de Hoje</p>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.06em] text-white md:text-5xl">
                {plan.missions.length
                  ? "Seu cockpit de evolução pessoal já mostra o que precisa acontecer hoje."
                  : "Prepare o dia uma vez e deixe o sistema dizer o que fechar agora."}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                {plan.missions.length
                  ? "Hoje é dia de execução. Abra o dashboard, veja a missão principal e avance sem negociar com ruído."
                  : "Sem missões geradas, o cockpit ainda não tem uma trilha operacional clara para hoje."}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {cta}
              <Button asChild size="lg" variant="outline">
                <Link href="/diario">Registrar diário</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SignalCard label="Streak" value={`${plan.currentStreak} dias`} description="Sua consistência está sendo construída em blocos pequenos." />
              <SignalCard label="XP hoje" value={`${plan.xpToday} XP`} description="Toda entrega registrada aumenta o peso do sistema." />
              <SignalCard label="Missões" value={`${plan.completedCount}/${plan.totalCount || 0}`} description="O dashboard precisa deixar claro o que fazer hoje." />
              <SignalCard label="Foco semanal" value={weeklyFocusValue} description="Escolha poucas batalhas e vença com consistência." />
            </div>
          </div>

          <Card className="border-white/10 bg-white/[0.03]">
            <CardContent className="space-y-5 p-5 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Leitura do dia</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-white">{plan.progressPercent}%</h2>
                  <p className="mt-2 text-sm font-medium leading-6 text-cyan-50">
                    {plan.pendingMissions.length ? "Você ainda tem missões abertas." : "Dia fechado. Amanhã você volta mais forte."}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {plan.completedCount} de {plan.totalCount} missões concluídas hoje.
                  </p>
                </div>
                <div className="premium-badge rounded-[24px] border border-cyan-400/20 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">Missão-chave</p>
                  <p className="mt-1 text-sm font-medium text-cyan-50">{plan.topMission?.title ?? "Preparar primeiro"}</p>
                </div>
              </div>
              <Progress value={plan.progressPercent} className="h-3" />
              <div className="flex flex-wrap gap-2">
                {(plan.pendingMissions.length ? plan.pendingMissions : plan.missions).slice(0, 4).map((mission) => (
                  <Badge key={mission.id} className="border border-white/10 bg-white/5 text-slate-100">
                    {mission.title}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-white/10">
          <CardContent className="space-y-5 p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Centro de execução</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">O que precisa acontecer hoje</h2>
                <p className="mt-2 text-sm text-slate-300">A próxima missão importa mais que a motivação.</p>
              </div>
              <Sparkles className="size-5 text-cyan-300" />
            </div>

            {plan.topMission ? (
              <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5">
                <div className="flex flex-wrap gap-2">
                  <Badge className="border border-white/10 bg-white/5 text-slate-100">
                    {dailyMissionCategoryLabels[plan.topMission.category as keyof typeof dailyMissionCategoryLabels]}
                  </Badge>
                  <Badge className="border border-rose-400/25 bg-rose-500/10 text-rose-100">
                    {missionPriorityLabels[plan.topMission.priority]}
                  </Badge>
                  <Badge className="border border-emerald-400/20 bg-emerald-400/10 text-emerald-100">+{plan.topMission.xpReward} XP</Badge>
                </div>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-white">{plan.topMission.title}</h3>
                <p className="mt-2 text-sm font-medium text-cyan-50">Concluir agora.</p>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{plan.topMission.description}</p>
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] p-6">
                <p className="text-sm leading-7 text-slate-300">
                  Nenhuma missão preparada ainda. Gere o plano para transformar o dashboard em uma fila objetiva de execução.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Próximas missões pendentes</p>
              {plan.pendingMissions.length ? (
                <div className="grid gap-3">
                  {plan.pendingMissions.slice(0, 4).map((mission) => (
                    <div key={mission.id} className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">{mission.title}</p>
                          <p className="mt-1 text-sm text-slate-400">{mission.description}</p>
                        </div>
                        <Badge className="border border-white/10 bg-white/5 text-slate-100">+{mission.xpReward} XP</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-300">Tudo que estava planejado para hoje já foi concluído.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          {secondaryCards.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.key} className="border-white/10">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                    <div className="premium-badge rounded-2xl border border-white/10 p-2.5">
                      <Icon className="size-4 text-cyan-200" />
                    </div>
                  </div>
                  <p className="text-2xl font-semibold tracking-[-0.05em] text-white">{secondaryValues[item.key]}</p>
                  <p className="text-sm leading-6 text-slate-300">{secondaryDescriptions[item.key]}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SignalCard({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-2 line-clamp-2 text-lg font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}
