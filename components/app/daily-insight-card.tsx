import { Card, CardContent } from "@/components/ui/card";

export function DailyInsightCard({ title, content }: { title: string; content: string }) {
  return (
    <Card className="hero-glow border-white/10">
      <CardContent className="space-y-3 p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{title}</p>
        <p className="text-sm leading-7 text-slate-200">{content}</p>
      </CardContent>
    </Card>
  );
}
