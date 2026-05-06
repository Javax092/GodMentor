import Link from "next/link";
import { ArrowRight, Flag, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

type WeeklyBar = {
  label: string;
  date: string;
  active: boolean;
  score: number;
};

type GoalProgress = {
  id: string;
  title: string;
  progress: number;
};

export function ProgressOverview({
  weeklyBars,
  monthlyProgress,
  weeklyExecutionRate,
  completedWeeklyGoalsRate,
  topGoals
}: {
  weeklyBars: WeeklyBar[];
  monthlyProgress: number;
  weeklyExecutionRate: number;
  completedWeeklyGoalsRate: number;
  topGoals: GoalProgress[];
}) {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">Progresso visual</p>
        <CardTitle className="text-xl tracking-[-0.04em] md:text-2xl">Ritmo da semana</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">Leitura curta do ritmo recente para ajustar a proxima acao.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Barra semanal</span>
            <span className="text-foreground">{weeklyBars.filter((day) => day.active).length}/7 dias com check-in</span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weeklyBars.map((day) => (
              <div className="space-y-2" key={day.date}>
                <div
                  className="h-16 rounded-2xl border border-white/8 bg-white/[0.03] p-1.5 md:h-24 md:p-2"
                  style={{
                    background: day.active
                      ? `linear-gradient(180deg, rgba(96,165,250,${Math.max(day.score / 14, 0.22)}), rgba(96,165,250,0.08))`
                      : undefined
                  }}
                >
                  <div className="flex h-full items-end justify-center rounded-xl border border-white/6 bg-black/10 pb-2 text-xs text-foreground/90">
                    {day.active ? `${day.score}` : ""}
                  </div>
                </div>
                <p className="text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{day.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Flag className="size-4 text-primary" />
                Execucao semanal
              </span>
              <span className="text-foreground">{weeklyExecutionRate}%</span>
            </div>
            <Progress value={weeklyExecutionRate} />
          </div>
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Target className="size-4 text-primary" />
                Progresso das metas
              </span>
              <span className="text-foreground">{monthlyProgress}%</span>
            </div>
            <Progress value={monthlyProgress} />
          </div>
        </div>

        <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Avanco das metas prioritarias</span>
            <span className="text-foreground">{completedWeeklyGoalsRate}%</span>
          </div>
          <div className="space-y-3">
            {topGoals.length ? (
              topGoals.slice(0, 3).map((goal) => (
                <div className="space-y-2" key={goal.id}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-foreground">{goal.title}</span>
                    <span className="text-muted-foreground">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} />
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">Sem metas ativas. Defina uma frente principal para o painel voltar a ter referencia operacional.</p>
            )}
          </div>
        </div>

        <Button asChild className="w-full justify-between" variant="outline">
          <Link href="/metas">
            Atualizar metas agora
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
