"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MonthlyReview, WeeklyReview } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/app/toast-provider";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ReviewsManager({
  initialWeeklyReviews,
  initialMonthlyReviews
}: {
  initialWeeklyReviews: WeeklyReview[];
  initialMonthlyReviews: MonthlyReview[];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ReviewSection type="weekly" initialReviews={initialWeeklyReviews} />
      <ReviewSection type="monthly" initialReviews={initialMonthlyReviews} />
    </div>
  );
}

function ReviewSection({
  type,
  initialReviews
}: {
  type: "weekly" | "monthly";
  initialReviews: WeeklyReview[] | MonthlyReview[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Array<WeeklyReview | MonthlyReview>>(initialReviews as Array<WeeklyReview | MonthlyReview>);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WeeklyReview | MonthlyReview | null>(null);
  const [loading, setLoading] = useState(false);

  const isWeekly = type === "weekly";
  const route = isWeekly ? "/api/reviews/weekly" : "/api/reviews/monthly";
  const title = isWeekly ? "Revisão semanal" : "Revisão mensal";

  async function refreshReviews() {
    const response = await fetch(route);
    const data = await response.json();
    setReviews(data);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const body = Object.fromEntries(formData.entries());
    const response = await fetch(editing ? `${route}/${editing.id}` : route, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => null);
    setLoading(false);

    if (!response.ok) {
      showToast({
        tone: "error",
        title: `Não foi possível salvar a ${title.toLowerCase()}`,
        description: data?.error ?? "Tente novamente."
      });
      return;
    }

    showToast({
      tone: "success",
      title: editing ? `${title} atualizada` : `${title} criada`,
      description: "Seu histórico foi salvo com sucesso."
    });
    setOpen(false);
    setEditing(null);
    router.refresh();
    await refreshReviews();
  }

  async function removeReview(id: string) {
    if (!window.confirm("Excluir esta review? Essa ação não pode ser desfeita.")) {
      return;
    }

    setLoading(true);
    const response = await fetch(`${route}/${id}`, { method: "DELETE" });
    const data = await response.json().catch(() => null);
    setLoading(false);

    if (!response.ok) {
      showToast({
        tone: "error",
        title: "Não foi possível excluir a review",
        description: data?.error ?? "Tente novamente."
      });
      return;
    }

    showToast({
      tone: "success",
      title: "Review excluída",
      description: "O registro foi removido."
    });
    setReviews((current) => current.filter((review) => review.id !== id));
    router.refresh();
  }

  const currentDateValue = editing
    ? isWeekly
      ? format(new Date((editing as WeeklyReview).weekStart), "yyyy-MM-dd")
      : format(new Date((editing as MonthlyReview).month), "yyyy-MM-dd")
    : format(new Date(), "yyyy-MM-dd");

  return (
    <Card className="border-white/10">
      <CardContent className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{title}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">
              {isWeekly ? "Veja o que funcionou, o que travou e o que precisa mudar" : "Capture a evolução do mês sem perder contexto"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {isWeekly ? "Não é sobre culpa. É sobre ajuste." : "Uma boa revisão evita repetir esforço sem direção."}
            </p>
          </div>

          <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
              setOpen(nextOpen);
              if (!nextOpen) {
                setEditing(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="gap-2"
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
              >
                <Plus className="size-4" />
                Nova revisão
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? `Editar ${title.toLowerCase()}` : `Nova ${title.toLowerCase()}`}</DialogTitle>
                <DialogDescription>Registre leitura real da execução. Clareza antes de autoproteção.</DialogDescription>
              </DialogHeader>
              <form className="grid gap-4" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label htmlFor={`${type}-date`}>{isWeekly ? "Início da semana" : "Mês de referência"}</Label>
                  <Input id={`${type}-date`} name={isWeekly ? "weekStart" : "month"} type="date" defaultValue={currentDateValue} />
                </div>

                {isWeekly ? (
                  <>
                    <Field label="Vitórias" name="wins" defaultValue={(editing as WeeklyReview | null)?.wins ?? ""} />
                    <Field label="Falhas" name="failures" defaultValue={(editing as WeeklyReview | null)?.failures ?? ""} />
                    <Field label="Padrões" name="patterns" defaultValue={(editing as WeeklyReview | null)?.patterns ?? ""} />
                    <Field label="O que funcionou" name="worked" defaultValue={(editing as WeeklyReview | null)?.worked ?? ""} />
                    <Field label="O que não funcionou" name="didntWork" defaultValue={(editing as WeeklyReview | null)?.didntWork ?? ""} />
                    <Field label="Aprendizado" name="lesson" defaultValue={(editing as WeeklyReview | null)?.lesson ?? ""} />
                    <Field label="Obstáculo" name="obstacle" defaultValue={(editing as WeeklyReview | null)?.obstacle ?? ""} />
                    <Field label="Foco da próxima semana" name="nextFocus" defaultValue={(editing as WeeklyReview | null)?.nextFocus ?? ""} />
                    <div className="space-y-2">
                      <Label htmlFor="score">Nota da semana</Label>
                      <Input defaultValue={(editing as WeeklyReview | null)?.score ?? 0} id="score" name="score" max={10} min={0} type="number" />
                    </div>
                  </>
                ) : (
                  <>
                    <Field
                      label="Maior evolução"
                      name="biggestGrowth"
                      defaultValue={(editing as MonthlyReview | null)?.biggestGrowth ?? ""}
                    />
                    <Field
                      label="Metas concluídas"
                      name="completedGoals"
                      defaultValue={(editing as MonthlyReview | null)?.completedGoals ?? ""}
                    />
                    <Field
                      label="Hábitos que ajudaram"
                      name="helpfulHabits"
                      defaultValue={(editing as MonthlyReview | null)?.helpfulHabits ?? ""}
                    />
                    <Field
                      label="Hábitos que atrapalharam"
                      name="harmfulHabits"
                      defaultValue={(editing as MonthlyReview | null)?.harmfulHabits ?? ""}
                    />
                    <Field
                      label="Foco do próximo mês"
                      name="nextMonthFocus"
                      defaultValue={(editing as MonthlyReview | null)?.nextMonthFocus ?? ""}
                    />
                  </>
                )}

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                    <Button type="submit" disabled={loading}>
                    {loading ? "Salvando..." : "Salvar revisão"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {reviews.length ? (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {isWeekly
                        ? format(new Date((review as WeeklyReview).weekStart), "dd 'de' MMMM", { locale: ptBR })
                        : format(new Date((review as MonthlyReview).month), "MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {isWeekly ? (review as WeeklyReview).worked : (review as MonthlyReview).biggestGrowth}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        setEditing(review);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button size="icon" variant="ghost" disabled={loading} onClick={() => removeReview(review.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<span className="text-lg text-cyan-200">05</span>}
            title={`Nenhuma ${title.toLowerCase()} registrada`}
            description="Sem revisão, a execução vira repetição. Comece a registrar seu ajuste por período."
            action={
              <Button
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
              >
                Nova revisão
              </Button>
            }
          />
        )}
      </CardContent>
    </Card>
  );
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} name={name} defaultValue={defaultValue} required />
    </div>
  );
}
