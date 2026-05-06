"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JournalEntry } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormSection } from "@/components/app/form-section";
import { moodOptions } from "@/lib/constants";

export function JournalForm({ entry }: { entry?: JournalEntry }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState(entry?.mood ?? moodOptions[0]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const body = {
      ...Object.fromEntries(formData.entries()),
      mood
    };

    const response = await fetch(entry ? `/api/journal/${entry.id}` : "/api/journal", {
      method: entry ? "PATCH" : "POST",
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
    if (!entry) {
      form.reset();
      setMood(moodOptions[0]);
    }
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <FormSection
        title={entry ? "Editar registro" : "Check-in diário"}
        description="Registre o essencial do dia com clareza operacional. Menos narrativa, mais sinal útil para revisão."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              defaultValue={entry ? new Date(entry.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}
              id="date"
              name="date"
              type="date"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="score">Nota do dia</Label>
            <Input defaultValue={entry?.score ?? 8} id="score" max={10} min={1} name="score" type="number" required />
          </div>
          <div className="space-y-2">
            <Label>Humor</Label>
            <Select onValueChange={setMood} value={mood}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o humor" />
              </SelectTrigger>
              <SelectContent>
                {moodOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="content">Como foi seu dia?</Label>
            <Textarea
              defaultValue={entry?.content}
              id="content"
              name="content"
              required
              className="min-h-32 md:min-h-40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="win">Maior vitória</Label>
            <Textarea defaultValue={entry?.win} id="win" name="win" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="challenge">Maior dificuldade</Label>
            <Textarea defaultValue={entry?.challenge} id="challenge" name="challenge" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tomorrowPriority">Prioridade para amanhã</Label>
            <Textarea defaultValue={entry?.tomorrowPriority} id="tomorrowPriority" name="tomorrowPriority" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gratitude">Gratidão do dia</Label>
            <Textarea defaultValue={entry?.gratitude} id="gratitude" name="gratitude" required />
          </div>
        </div>
        {error && <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
        <Button className="w-full sm:w-auto" disabled={loading} type="submit">
          {loading ? "Salvando..." : entry ? "Salvar alterações" : "Registrar meu dia"}
        </Button>
      </FormSection>
    </form>
  );
}
