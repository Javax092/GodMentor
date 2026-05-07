"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Goal, GoalCategory, GoalPeriod, GoalPriority, GoalStatus } from "@prisma/client";
import { useToast } from "@/components/app/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormSection } from "@/components/app/form-section";
import { goalCategoryLabels, goalPeriodLabels, goalPriorityLabels, goalStatusLabels } from "@/lib/constants";

export function GoalForm({ goal, onSuccess }: { goal?: Goal; onSuccess?: () => void }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<GoalCategory>(goal?.category ?? GoalCategory.PERSONAL);
  const [period, setPeriod] = useState<GoalPeriod>(goal?.period ?? GoalPeriod.WEEKLY);
  const [status, setStatus] = useState<GoalStatus>(goal?.status ?? GoalStatus.ACTIVE);
  const [priority, setPriority] = useState<GoalPriority>(goal?.priority ?? GoalPriority.MEDIUM);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const body = {
      ...Object.fromEntries(formData.entries()),
      category,
      period,
      status,
      priority
    };

    const response = await fetch(goal ? `/api/goals/${goal.id}` : "/api/goals", {
      method: goal ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Não foi possível salvar.");
      showToast({
        tone: "error",
        title: "Não foi possível salvar a meta",
        description: data.error ?? "Revise os dados e tente novamente."
      });
      return;
    }

    showToast({
      tone: "success",
      title: goal ? "Meta atualizada" : "Meta criada",
      description: goal ? "As alterações foram salvas." : "Sua nova meta já está disponível no painel."
    });
    router.refresh();
    if (!goal) {
      form.reset();
    }
    onSuccess?.();
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <FormSection
        title={goal ? "Editar meta" : "Nova meta"}
        description="Defina um objetivo claro, com prioridade e progresso mensurável. O sistema funciona melhor quando a meta nasce simples."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Título</Label>
            <Input defaultValue={goal?.title} id="title" name="title" required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea defaultValue={goal?.description} id="description" name="description" required />
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select onValueChange={(value) => setCategory(value as GoalCategory)} value={category}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(goalCategoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Período</Label>
            <Select onValueChange={(value) => setPeriod(value as GoalPeriod)} value={period}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(goalPeriodLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">Prazo</Label>
            <Input
              defaultValue={goal?.deadline ? new Date(goal.deadline).toISOString().slice(0, 10) : ""}
              id="deadline"
              name="deadline"
              type="date"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="progress">Progresso (%)</Label>
            <Input defaultValue={goal?.progress ?? 0} id="progress" max={100} min={0} name="progress" type="number" />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select onValueChange={(value) => setStatus(value as GoalStatus)} value={status}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(goalStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Prioridade</Label>
            <Select onValueChange={(value) => setPriority(value as GoalPriority)} value={priority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(goalPriorityLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {error && <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
        <Button className="w-full sm:w-auto" disabled={loading} type="submit">
          {loading ? "Salvando..." : goal ? "Salvar alterações" : "Criar nova meta"}
        </Button>
      </FormSection>
    </form>
  );
}
