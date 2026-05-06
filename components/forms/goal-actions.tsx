"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Goal } from "@prisma/client";
import { Check, Pencil, Trash2 } from "lucide-react";
import { GoalForm } from "@/components/forms/goal-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function GoalActions({ goal }: { goal: Goal }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateGoal(method: "DELETE" | "PATCH", body?: Record<string, unknown>) {
    setLoading(true);
    await fetch(`/api/goals/${goal.id}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    });
    setLoading(false);
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
      <Dialog>
        <DialogTrigger asChild>
          <Button size="icon" variant="outline">
            <Pencil className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar meta</DialogTitle>
          </DialogHeader>
          <GoalForm goal={goal} />
        </DialogContent>
      </Dialog>
      <Button disabled={loading} onClick={() => updateGoal("DELETE")} size="icon" variant="ghost">
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
