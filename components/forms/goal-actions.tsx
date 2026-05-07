"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Goal } from "@prisma/client";
import { Check, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/app/toast-provider";
import { GoalForm } from "@/components/forms/goal-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function GoalActions({ goal }: { goal: Goal }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function updateGoal(method: "DELETE" | "PATCH", body?: Record<string, unknown>) {
    if (method === "DELETE" && !window.confirm("Excluir esta meta? Essa ação não pode ser desfeita.")) {
      return;
    }

    setLoading(true);
    const response = await fetch(`/api/goals/${goal.id}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json().catch(() => null);
    setLoading(false);

    if (!response.ok) {
      showToast({
        tone: "error",
        title: "Ação não concluída",
        description: data?.error ?? "Tente novamente."
      });
      return;
    }

    showToast({
      tone: "success",
      title: method === "DELETE" ? "Meta excluída" : "Meta atualizada",
      description: method === "DELETE" ? "A meta foi removida com sucesso." : "O status da meta foi atualizado."
    });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {goal.status !== "COMPLETED" && (
        <Button
          disabled={loading}
          onClick={() => updateGoal("PATCH", { ...goal, status: "COMPLETED", progress: 100, deadline: goal.deadline })}
          size="icon"
          variant="ghost"
        >
          <Check className="size-4" />
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="icon" variant="outline">
            <Pencil className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar meta</DialogTitle>
          </DialogHeader>
          <GoalForm goal={goal} onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
      <Button disabled={loading} onClick={() => updateGoal("DELETE")} size="icon" variant="ghost">
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
