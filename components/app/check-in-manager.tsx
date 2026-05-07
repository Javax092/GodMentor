"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/app/toast-provider";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CheckInRecord = {
  id: string;
  date: string | Date;
  mood: string;
  dayScore: number;
  energy: number;
  sleepHours: number | null;
  executedPriority: boolean;
  progressNote: string;
  blocker: string;
  tomorrowPriority: string;
  gratitude: string;
  aiSummary: string | null;
};

export function CheckInManager({ initialCheckIns }: { initialCheckIns: CheckInRecord[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [checkIns, setCheckIns] = useState(initialCheckIns);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const todayCheckIn = useMemo(
    () => checkIns.find((entry) => isSameDay(new Date(entry.date), new Date())) ?? null,
    [checkIns]
  );

  const editingRecord = checkIns.find((entry) => entry.id === editingId) ?? todayCheckIn;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const body = {
      date: String(formData.get("date") ?? format(new Date(), "yyyy-MM-dd")),
      score: Number(formData.get("score") ?? 7),
      mood: String(formData.get("mood") ?? "Focado"),
      executedPriority: String(formData.get("executedPriority") ?? "false") === "true",
      progressNote: String(formData.get("progressNote") ?? ""),
      blocker: String(formData.get("blocker") ?? ""),
      tomorrowPriority: String(formData.get("tomorrowPriority") ?? ""),
      gratitude: String(formData.get("gratitude") ?? ""),
      energy: Number(formData.get("energy") ?? formData.get("score") ?? 7),
      sleepHours: formData.get("sleepHours") ? Number(formData.get("sleepHours")) : null
    };

    const response = await fetch(editingRecord ? `/api/check-ins/${editingRecord.id}` : "/api/check-ins", {
      method: editingRecord ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => null);
    setLoading(false);

    if (!response.ok) {
      showToast({
        tone: "error",
        title: "Não foi possível salvar o check-in",
        description: data?.error ?? "Revise os campos e tente novamente."
      });
      return;
    }

    showToast({
      tone: "success",
      title: editingRecord ? "Check-in atualizado" : "Check-in registrado",
      description: editingRecord ? "O registro do dia foi atualizado." : "Seu dia foi registrado com sucesso."
    });
    setEditingId(null);
    router.refresh();
    const refreshed = await fetch("/api/check-ins");
    const refreshedData = await refreshed.json();
    setCheckIns(refreshedData);
  }

  async function deleteCheckIn(id: string) {
    if (!window.confirm("Excluir este check-in? Essa ação não pode ser desfeita.")) {
      return;
    }

    setLoading(true);
    const response = await fetch(`/api/check-ins/${id}`, { method: "DELETE" });
    const data = await response.json().catch(() => null);
    setLoading(false);

    if (!response.ok) {
      showToast({
        tone: "error",
        title: "Não foi possível excluir o check-in",
        description: data?.error ?? "Tente novamente."
      });
      return;
    }

    showToast({
      tone: "success",
      title: "Check-in excluído",
      description: "O registro foi removido."
    });
    setEditingId(null);
    setCheckIns((current) => current.filter((entry) => entry.id !== id));
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card className="border-white/10">
        <CardContent className="space-y-5 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Banco de dados da sua evolução</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">
                {todayCheckIn ? "Seu dia já foi registrado" : "Feche o dia com clareza"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">O diário é o banco de dados da sua evolução. Registre o que aconteceu sem tentar parecer melhor.</p>
            </div>
            {todayCheckIn ? (
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                Hoje registrado
              </div>
            ) : null}
          </div>

          <form className="grid gap-4" onSubmit={onSubmit}>
            <input
              type="hidden"
              name="date"
              value={editingRecord ? format(new Date(editingRecord.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="score">Nota do dia</Label>
                <Input defaultValue={editingRecord?.dayScore ?? 7} id="score" min={1} max={10} name="score" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mood">Humor</Label>
                <Input defaultValue={editingRecord?.mood ?? "Focado"} id="mood" name="mood" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="energy">Energia</Label>
                <Input defaultValue={editingRecord?.energy ?? 7} id="energy" min={1} max={10} name="energy" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sleepHours">Sono</Label>
                <Input
                  defaultValue={editingRecord?.sleepHours ?? 7.5}
                  id="sleepHours"
                  name="sleepHours"
                  step="0.1"
                  type="number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Prioridade principal executada?</Label>
              <select
                defaultValue={editingRecord?.executedPriority ? "true" : "false"}
                name="executedPriority"
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white"
              >
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>

            <Field
              label="O que você executou"
              name="progressNote"
              defaultValue={editingRecord?.progressNote ?? ""}
              placeholder="O que aconteceu de verdade hoje?"
            />
            <Field
              label="Bloqueio"
              name="blocker"
              defaultValue={editingRecord?.blocker ?? ""}
              placeholder="O que travou sua execução?"
            />
            <Field
              label="Prioridade de amanhã"
              name="tomorrowPriority"
              defaultValue={editingRecord?.tomorrowPriority ?? ""}
              placeholder="Qual é a próxima ação que abre amanhã?"
            />
            <Field
              label="Gratidão"
              name="gratitude"
              defaultValue={editingRecord?.gratitude ?? ""}
              placeholder="Feche o dia lembrando o que valeu."
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <div className="flex gap-3">
                {todayCheckIn ? (
                  <Button type="button" variant="outline" onClick={() => setEditingId(todayCheckIn.id)}>
                    <Pencil className="mr-2 size-4" />
                    Editar check-in
                  </Button>
                ) : null}
                {todayCheckIn ? (
                  <Button type="button" variant="ghost" disabled={loading} onClick={() => deleteCheckIn(todayCheckIn.id)}>
                    <Trash2 className="mr-2 size-4" />
                    Excluir check-in
                  </Button>
                ) : null}
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : editingRecord ? "Salvar diário" : "Registrar diário"}
              </Button>
            </div>
          </form>

          {todayCheckIn?.aiSummary ? (
            <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/8 p-4 text-sm text-slate-200">
              Resumo da IA: {todayCheckIn.aiSummary}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {checkIns.length ? (
          <Card className="border-white/10">
            <CardContent className="space-y-3 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Histórico real</p>
              {checkIns.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                  <div className="flex items-center justify-between gap-3">
                    <span>{format(new Date(entry.date), "dd 'de' MMMM", { locale: ptBR })}</span>
                    <span className="text-slate-500">{entry.dayScore}/10</span>
                  </div>
                  <p className="mt-2 text-slate-400">{entry.progressNote}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={<span className="text-lg text-cyan-200">04</span>}
            title="Nenhum registro ainda"
            description="Seu padrão aparece quando você escreve com frequência. Comece pelo primeiro fechamento honesto."
          />
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Textarea defaultValue={defaultValue} id={name} name={name} placeholder={placeholder} required />
    </div>
  );
}
