"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MonthlyReview, WeeklyReview } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSection } from "@/components/app/form-section";

export function WeeklyReviewForm({ review }: { review?: WeeklyReview | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    const response = await fetch("/api/reviews/weekly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? "Não foi possível salvar.");
      return;
    }
    router.refresh();
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <FormSection title="Revisão semanal" description="Feche a semana entendendo o que gerou avanço real e o que drenou sua execução.">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weekStart">Início da semana</Label>
            <Input
              defaultValue={review ? new Date(review.weekStart).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}
              id="weekStart"
              name="weekStart"
              type="date"
            />
          </div>
          <Field label="O que funcionou?" name="worked" value={review?.worked} />
          <Field label="O que não funcionou?" name="didntWork" value={review?.didntWork} />
          <Field label="Maior aprendizado" name="lesson" value={review?.lesson} />
          <Field label="Principal obstáculo" name="obstacle" value={review?.obstacle} />
          <Field label="Foco da próxima semana" name="nextFocus" value={review?.nextFocus} />
        </div>
        {error && <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
        <Button disabled={loading} type="submit">
          {loading ? "Salvando..." : "Salvar revisão semanal"}
        </Button>
      </FormSection>
    </form>
  );
}

export function MonthlyReviewForm({ review }: { review?: MonthlyReview | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    const response = await fetch("/api/reviews/monthly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? "Não foi possível salvar.");
      return;
    }
    router.refresh();
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <FormSection title="Revisão mensal" description="Capture a evolução do mês, os hábitos que sustentaram resultado e o ajuste do próximo ciclo.">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="month">Mês de referência</Label>
            <Input
              defaultValue={review ? new Date(review.month).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}
              id="month"
              name="month"
              type="date"
            />
          </div>
          <Field label="Maior evolução do mês" name="biggestGrowth" value={review?.biggestGrowth} />
          <Field label="Metas concluídas" name="completedGoals" value={review?.completedGoals} />
          <Field label="Hábitos que ajudaram" name="helpfulHabits" value={review?.helpfulHabits} />
          <Field label="Hábitos que atrapalharam" name="harmfulHabits" value={review?.harmfulHabits} />
          <Field label="Foco do próximo mês" name="nextMonthFocus" value={review?.nextMonthFocus} />
        </div>
        {error && <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
        <Button disabled={loading} type="submit">
          {loading ? "Salvando..." : "Salvar revisão mensal"}
        </Button>
      </FormSection>
    </form>
  );
}

function Field({ label, name, value }: { label: string; name: string; value?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Textarea defaultValue={value} id={name} name={name} required />
    </div>
  );
}
