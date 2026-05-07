"use client";

import { useMemo, useState } from "react";
import { Goal, GoalCategory, GoalPeriod, GoalStatus } from "@prisma/client";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { GoalCard } from "@/components/app/goal-card";
import { GoalForm } from "@/components/forms/goal-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { goalCategoryLabels, goalPeriodLabels, goalStatusLabels } from "@/lib/constants";

type FilterValue = "ALL";

export function GoalsClientPage({ goals }: { goals: Goal[] }) {
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<GoalStatus | FilterValue>("ALL");
  const [periodFilter, setPeriodFilter] = useState<GoalPeriod | FilterValue>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<GoalCategory | FilterValue>("ALL");

  const filteredGoals = useMemo(
    () =>
      goals.filter((goal) => {
        if (statusFilter !== "ALL" && goal.status !== statusFilter) {
          return false;
        }
        if (periodFilter !== "ALL" && goal.period !== periodFilter) {
          return false;
        }
        if (categoryFilter !== "ALL" && goal.category !== categoryFilter) {
          return false;
        }
        return true;
      }),
    [categoryFilter, goals, periodFilter, statusFilter]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-3 sm:grid-cols-3">
          <FilterSelect
            label="Status"
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as GoalStatus | FilterValue)}
            items={goalStatusLabels}
          />
          <FilterSelect
            label="Período"
            value={periodFilter}
            onValueChange={(value) => setPeriodFilter(value as GoalPeriod | FilterValue)}
            items={goalPeriodLabels}
          />
          <FilterSelect
            label="Categoria"
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value as GoalCategory | FilterValue)}
            items={goalCategoryLabels}
          />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="size-4" />
              Nova meta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova meta</DialogTitle>
              <DialogDescription>Defina uma meta clara, com progresso mensurável e a próxima ação que sustenta a execução.</DialogDescription>
            </DialogHeader>
            <GoalForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {filteredGoals.length ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {filteredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </section>
      ) : (
        <EmptyState
          icon={<span className="text-lg text-cyan-200">02</span>}
          title="Nenhuma meta nesse filtro"
          description="Sem próxima ação, a meta vira desejo. Crie uma frente objetiva ou ajuste os filtros."
          action={
            <Button onClick={() => setOpen(true)} size="lg">
              Criar meta agora
            </Button>
          }
        />
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onValueChange,
  items
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  items: Record<string, string>;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="min-w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos</SelectItem>
          {Object.entries(items).map(([itemValue, itemLabel]) => (
            <SelectItem key={itemValue} value={itemValue}>
              {itemLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
