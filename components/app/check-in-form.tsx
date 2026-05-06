import { saveCheckInAction } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CheckInForm({
  defaultValues
}: {
  defaultValues?: {
    advanced?: string;
    failed?: string;
    improveTomorrow?: string;
    energy?: number;
    mood?: string;
    dayScore?: number;
    sleepHours?: number | null;
    aiSummary?: string | null;
  } | null;
}) {
  return (
    <Card className="border-white/10">
      <CardContent className="space-y-5 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Check-in noturno</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">Feche o dia com clareza</h2>
        </div>
        <form action={saveCheckInAction} className="grid gap-4">
          <Textarea name="advanced" placeholder="O que avancei hoje?" defaultValue={defaultValues?.advanced} className="min-h-28" />
          <Textarea name="failed" placeholder="Onde falhei?" defaultValue={defaultValues?.failed} className="min-h-24" />
          <Textarea
            name="improveTomorrow"
            placeholder="O que melhorar amanhã?"
            defaultValue={defaultValues?.improveTomorrow}
            className="min-h-24"
          />
          <div className="grid gap-4 sm:grid-cols-4">
            <Input name="energy" type="number" min={1} max={10} placeholder="Energia" defaultValue={defaultValues?.energy ?? 7} />
            <Input name="dayScore" type="number" min={1} max={10} placeholder="Nota do dia" defaultValue={defaultValues?.dayScore ?? 7} />
            <Input name="mood" placeholder="Humor" defaultValue={defaultValues?.mood ?? "Focado"} />
            <Input name="sleepHours" type="number" step="0.1" min={0} max={12} placeholder="Sono" defaultValue={defaultValues?.sleepHours ?? 7.5} />
          </div>
          <Button type="submit" size="lg" className="w-full sm:w-fit">
            Salvar check-in e ganhar XP
          </Button>
        </form>
        {defaultValues?.aiSummary ? (
          <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/8 p-4 text-sm text-slate-200">
            Resumo da IA: {defaultValues.aiSummary}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
