import { JournalEntry } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { JournalEntryActions } from "@/components/forms/journal-entry-actions";

export function JournalEntryCard({ entry }: { entry: JournalEntry }) {
  return (
    <Card>
      <CardContent className="space-y-5 p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
              {format(entry.date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Badge>{entry.mood}</Badge>
              <Badge variant="secondary">Nota {entry.score}/10</Badge>
            </div>
          </div>
          <div className="self-start">
            <JournalEntryActions entry={entry} />
          </div>
        </div>
        <div className="grid gap-4 text-sm leading-7 text-muted-foreground md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">Como foi o dia?</p>
            <p>{entry.content}</p>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">Maior vitória</p>
            <p>{entry.win}</p>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">Maior dificuldade</p>
            <p>{entry.challenge}</p>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">Prioridade para amanhã</p>
            <p>{entry.tomorrowPriority}</p>
          </div>
        </div>
        <div className="rounded-[22px] border border-white/[0.06] bg-white/[0.03] p-4 text-sm leading-7 text-muted-foreground">
          <span className="font-semibold text-foreground">Gratidão do dia:</span> {entry.gratitude}
        </div>
      </CardContent>
    </Card>
  );
}
