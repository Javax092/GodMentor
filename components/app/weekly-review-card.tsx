import { saveWeeklyReviewAction } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function WeeklyReviewCard({
  defaultValues
}: {
  defaultValues?: {
    worked?: string;
    didntWork?: string;
    lesson?: string;
    obstacle?: string;
    nextFocus?: string;
    wins?: string | null;
    failures?: string | null;
    patterns?: string | null;
    aiSummary?: string | null;
  } | null;
}) {
  return (
    <Card className="border-white/10">
      <CardContent className="space-y-5 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Review semanal</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">Aprender antes da próxima semana</h2>
        </div>
        <form action={saveWeeklyReviewAction} className="grid gap-4">
          <Textarea name="wins" placeholder="Vitórias da semana" defaultValue={defaultValues?.wins ?? ""} className="min-h-24" />
          <Textarea name="failures" placeholder="Falhas da semana" defaultValue={defaultValues?.failures ?? ""} className="min-h-24" />
          <Textarea name="patterns" placeholder="Padrões identificados" defaultValue={defaultValues?.patterns ?? ""} className="min-h-24" />
          <Textarea name="worked" placeholder="O que funcionou?" defaultValue={defaultValues?.worked} className="min-h-24" />
          <Textarea name="didntWork" placeholder="O que não funcionou?" defaultValue={defaultValues?.didntWork} className="min-h-24" />
          <Textarea name="lesson" placeholder="Principal aprendizado" defaultValue={defaultValues?.lesson} className="min-h-24" />
          <Textarea name="obstacle" placeholder="Maior obstáculo" defaultValue={defaultValues?.obstacle} className="min-h-24" />
          <Textarea name="nextFocus" placeholder="Plano da próxima semana" defaultValue={defaultValues?.nextFocus} className="min-h-24" />
          <Button type="submit" size="lg" className="w-full sm:w-fit">
            Salvar review semanal
          </Button>
        </form>
        {defaultValues?.aiSummary ? (
          <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/8 p-4 text-sm text-slate-200">
            Síntese da IA: {defaultValues.aiSummary}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
