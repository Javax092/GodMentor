import { Goal } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Flag, Target } from "lucide-react";
import { goalCategoryLabels, goalPriorityLabels, goalStatusLabels } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GoalActions } from "@/components/forms/goal-actions";

export function GoalCard({ goal }: { goal: Goal }) {
  const statusVariant = goal.status === "COMPLETED" ? "success" : goal.status === "PAUSED" ? "warning" : "secondary";
  const priorityVariant = goal.priority === "HIGH" ? "warning" : goal.priority === "LOW" ? "secondary" : "default";

  return (
    <Card className="border-white/10">
      <CardContent className="space-y-5 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge>{goalCategoryLabels[goal.category]}</Badge>
              <Badge variant={statusVariant}>{goalStatusLabels[goal.status]}</Badge>
              <Badge variant={priorityVariant}>{goalPriorityLabels[goal.priority]}</Badge>
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground">{goal.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{goal.description}</p>
              <p className="mt-2 text-sm font-medium text-cyan-100/90">
                {goal.progress > 0 ? "Toda meta precisa de uma próxima ação." : "Sem próxima ação, a meta vira desejo."}
              </p>
            </div>
          </div>
          <div className="self-start">
            <GoalActions goal={goal} />
          </div>
        </div>
        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
            <Target className="size-4 text-primary" />
            {goal.period.toLowerCase()}
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
            <Flag className="size-4 text-primary" />
            {goal.progress}% concluído
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
            <Calendar className="size-4 text-primary" />
            {goal.deadline ? format(goal.deadline, "dd MMM yyyy", { locale: ptBR }) : "Sem prazo"}
          </div>
        </div>
        <Progress value={goal.progress} />
      </CardContent>
    </Card>
  );
}
