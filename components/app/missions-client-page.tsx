"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MissionPriority, MissionStatus, PillarKey } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, CheckCircle2, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useToast } from "@/components/app/toast-provider";
import { EmptyState } from "@/components/app/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { missionPriorityLabels, missionStatusLabels, pillarCatalog } from "@/lib/constants";
import { cn } from "@/lib/utils";

type MissionHistoryEntry = {
  id: string;
  status: MissionStatus;
  progress: number;
  note: string | null;
  createdAt: string | Date;
};

type MissionRecord = {
  id: string;
  title: string;
  description: string;
  status: MissionStatus;
  priority: MissionPriority;
  xpReward: number;
  progress: number;
  dueDate: string | Date | null;
  completedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  pillar: {
    key: PillarKey;
    name: string;
  } | null;
  history: MissionHistoryEntry[];
};

type FilterValue = "ALL";

const initialFormState = {
  title: "",
  description: "",
  pillar: "NONE",
  status: MissionStatus.PENDING,
  priority: MissionPriority.MEDIUM,
  xpReward: 10,
  progress: 0,
  dueDate: ""
};

export function MissionsClientPage({ initialMissions }: { initialMissions: MissionRecord[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [missions, setMissions] = useState(initialMissions);
  const [statusFilter, setStatusFilter] = useState<MissionStatus | FilterValue>("ALL");
  const [pillarFilter, setPillarFilter] = useState<PillarKey | FilterValue>("ALL");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MissionRecord | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredMissions = useMemo(
    () =>
      missions.filter((mission) => {
        if (statusFilter !== "ALL" && mission.status !== statusFilter) {
          return false;
        }
        if (pillarFilter !== "ALL" && mission.pillar?.key !== pillarFilter) {
          return false;
        }
        return true;
      }),
    [missions, pillarFilter, statusFilter]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const body = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      pillar: String(formData.get("pillar") ?? "NONE") === "NONE" ? null : String(formData.get("pillar")),
      status: String(formData.get("status") ?? MissionStatus.PENDING),
      priority: String(formData.get("priority") ?? MissionPriority.MEDIUM),
      xpReward: Number(formData.get("xpReward") ?? 50),
      progress: Number(formData.get("progress") ?? 0),
      dueDate: String(formData.get("dueDate") ?? "") || null
    };

    const response = await fetch(editing ? `/api/missions/${editing.id}` : "/api/missions", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => null);
    setLoading(false);

    if (!response.ok) {
      showToast({
        tone: "error",
        title: "Não foi possível salvar a missão",
        description: data?.error ?? "Revise os dados e tente novamente."
      });
      return;
    }

    showToast({
      tone: "success",
      title: editing ? "Missão atualizada" : "Missão criada",
      description: editing ? "As alterações já estão valendo." : "A missão entrou na sua fila de execução."
    });
    setOpen(false);
    setEditing(null);
    form.reset();
    router.refresh();
    const refreshed = await fetch("/api/missions");
    const refreshedData = await refreshed.json();
    setMissions(refreshedData);
  }

  async function mutateMission(id: string, body: Partial<MissionRecord> & { pillar?: PillarKey | null }) {
    setLoading(true);
    const target = missions.find((mission) => mission.id === id);
    const response = await fetch(`/api/missions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: body.title ?? target?.title,
        description: body.description ?? target?.description,
        pillar: body.pillar ?? target?.pillar?.key ?? null,
        status: body.status ?? target?.status,
        priority: body.priority ?? target?.priority,
        xpReward: body.xpReward ?? target?.xpReward,
        progress: body.progress ?? target?.progress,
        dueDate:
          body.dueDate === undefined
            ? target?.dueDate
              ? format(new Date(target.dueDate), "yyyy-MM-dd")
              : null
            : body.dueDate
      })
    });
    const data = await response.json().catch(() => null);
    setLoading(false);

    if (!response.ok) {
      showToast({
        tone: "error",
        title: "Não foi possível atualizar a missão",
        description: data?.error ?? "Tente novamente."
      });
      return;
    }

    showToast({
      tone: "success",
      title: "Missão atualizada",
      description: "O status da missão foi salvo."
    });
    router.refresh();
    setMissions((current) => current.map((mission) => (mission.id === id ? data : mission)));
  }

  async function deleteMission(id: string) {
    if (!window.confirm("Excluir esta missão? Essa ação não pode ser desfeita.")) {
      return;
    }

    setLoading(true);
    const response = await fetch(`/api/missions/${id}`, { method: "DELETE" });
    const data = await response.json().catch(() => null);
    setLoading(false);

    if (!response.ok) {
      showToast({
        tone: "error",
        title: "Não foi possível excluir a missão",
        description: data?.error ?? "Tente novamente."
      });
      return;
    }

    showToast({
      tone: "success",
      title: "Missão excluída",
      description: "A missão foi removida com sucesso."
    });
    setMissions((current) => current.filter((mission) => mission.id !== id));
    router.refresh();
  }

  function openCreateDialog() {
    setEditing(null);
    setOpen(true);
  }

  function openEditDialog(mission: MissionRecord) {
    setEditing(mission);
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-3 sm:grid-cols-2">
          <FilterSelect
            label="Status"
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as MissionStatus | FilterValue)}
            items={missionStatusLabels}
          />
          <FilterSelect
            label="Pilar"
            value={pillarFilter}
            onValueChange={(value) => setPillarFilter(value as PillarKey | FilterValue)}
            items={Object.fromEntries(pillarCatalog.map((pillar) => [pillar.key, pillar.name]))}
          />
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
            <Button size="lg" className="gap-2" onClick={openCreateDialog}>
              <Plus className="size-4" />
              Nova missão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar missão" : "Nova missão"}</DialogTitle>
              <DialogDescription>Crie missões reais do usuário sem depender apenas do catálogo diário.</DialogDescription>
            </DialogHeader>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input defaultValue={editing?.title ?? initialFormState.title} id="title" name="title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  defaultValue={editing?.description ?? initialFormState.description}
                  id="description"
                  name="description"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  defaultValue={editing?.pillar?.key ?? initialFormState.pillar}
                  items={{ NONE: "Sem pilar", ...Object.fromEntries(pillarCatalog.map((pillar) => [pillar.key, pillar.name])) }}
                  label="Pilar"
                  name="pillar"
                />
                <SelectField
                  defaultValue={editing?.status ?? initialFormState.status}
                  items={missionStatusLabels}
                  label="Status"
                  name="status"
                />
                <SelectField
                  defaultValue={editing?.priority ?? initialFormState.priority}
                  items={missionPriorityLabels}
                  label="Prioridade"
                  name="priority"
                />
                <div className="space-y-2">
                  <Label htmlFor="xpReward">XP</Label>
                  <Input
                    defaultValue={editing?.xpReward ?? initialFormState.xpReward}
                    id="xpReward"
                    min={0}
                    max={500}
                    name="xpReward"
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="progress">Progresso</Label>
                  <Input
                    defaultValue={editing?.progress ?? initialFormState.progress}
                    id="progress"
                    min={0}
                    max={100}
                    name="progress"
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Data da missão</Label>
                  <Input
                    defaultValue={editing?.dueDate ? format(new Date(editing.dueDate), "yyyy-MM-dd") : initialFormState.dueDate}
                    id="dueDate"
                    name="dueDate"
                    type="date"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : editing ? "Salvar alterações" : "Criar missão"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {filteredMissions.length ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {filteredMissions.map((mission) => {
            const statusVariant =
              mission.status === MissionStatus.COMPLETED
                ? "success"
                : mission.status === MissionStatus.IN_PROGRESS
                  ? "default"
                  : "secondary";
            const priorityVariant =
              mission.priority === MissionPriority.HIGH
                ? "warning"
                : mission.priority === MissionPriority.LOW
                  ? "secondary"
                  : "default";

            return (
              <Card key={mission.id} className="border-white/10">
                <CardContent className="space-y-5 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={statusVariant}>{missionStatusLabels[mission.status]}</Badge>
                        <Badge variant={priorityVariant}>{missionPriorityLabels[mission.priority]}</Badge>
                        {mission.pillar ? <Badge>{mission.pillar.name}</Badge> : null}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight text-white">{mission.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{mission.description}</p>
                      </div>
                    </div>
                    <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                      +{mission.xpReward} XP
                    </div>
                  </div>

                  <div className="grid gap-3 text-sm text-slate-400 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">{mission.progress}% concluído</div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                      {mission.completedAt ? "Concluída" : "Aberta"}
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                      <Calendar className="size-4" />
                      {mission.dueDate ? format(new Date(mission.dueDate), "dd MMM", { locale: ptBR }) : "Sem data"}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    {mission.status !== MissionStatus.IN_PROGRESS && mission.status !== MissionStatus.COMPLETED ? (
                      <Button
                        variant="outline"
                        disabled={loading}
                        onClick={() => mutateMission(mission.id, { status: MissionStatus.IN_PROGRESS, progress: Math.max(mission.progress, 20) })}
                      >
                        Marcar em progresso
                      </Button>
                    ) : null}
                    {mission.status !== MissionStatus.COMPLETED ? (
                      <Button
                        disabled={loading}
                        onClick={() => mutateMission(mission.id, { status: MissionStatus.COMPLETED, progress: 100 })}
                      >
                        <CheckCircle2 className="mr-2 size-4" />
                        Concluir
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        disabled={loading}
                        onClick={() => mutateMission(mission.id, { status: MissionStatus.PENDING, progress: 0 })}
                      >
                        <RotateCcw className="mr-2 size-4" />
                        Reabrir
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => openEditDialog(mission)}>
                      <Pencil className="mr-2 size-4" />
                      Editar
                    </Button>
                    <Button variant="ghost" disabled={loading} onClick={() => deleteMission(mission.id)}>
                      <Trash2 className="mr-2 size-4" />
                      Excluir
                    </Button>
                  </div>

                  <div className="space-y-2 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Histórico recente</p>
                    {mission.history.length ? (
                      mission.history.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-black/10 px-3 py-3 text-sm text-slate-300"
                        >
                          <span className="truncate">
                            {missionStatusLabels[entry.status]} • {entry.progress}%
                            {entry.note ? ` • ${entry.note}` : ""}
                          </span>
                          <span className="shrink-0 text-xs text-slate-500">
                            {format(new Date(entry.createdAt), "dd/MM HH:mm")}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">Nenhuma atualização registrada ainda.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      ) : (
        <EmptyState
          icon={<span className="text-lg text-cyan-200">03</span>}
          title="Nenhuma missão encontrada"
          description="Crie a primeira missão real do cliente, com XP, prioridade, data e histórico."
          action={
            <Button onClick={openCreateDialog} size="lg">
              Criar missão
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

function SelectField({
  defaultValue,
  items,
  label,
  name
}: {
  defaultValue: string;
  items: Record<string, string>;
  label: string;
  name: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <input type="hidden" name={name} value={value} />
      <Select name={name} value={value} onValueChange={setValue}>
        <SelectTrigger id={name}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
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
