import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InsightCard({ content }: { content: string }) {
  return (
    <Card className="border-primary/18 bg-[linear-gradient(180deg,rgba(96,165,250,0.12),rgba(255,255,255,0.02))]">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <div className="rounded-2xl border border-primary/20 bg-primary/12 p-3">
          <Sparkles className="size-5 text-primary" />
        </div>
        <div>
          <CardTitle>Camada de inteligência</CardTitle>
          <p className="text-sm text-muted-foreground">Leitura contextual da sua evolução.</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-7 text-foreground/92">{content}</p>
      </CardContent>
    </Card>
  );
}
