import { BrainCircuit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function AiMentorCard({ title, content, tone = "default" }: { title: string; content: string; tone?: "default" | "alert" }) {
  return (
    <Card className={tone === "alert" ? "border-rose-400/15 bg-rose-400/[0.05]" : "border-cyan-400/15"}>
      <CardContent className="space-y-3 p-5">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-cyan-100/70">
          <BrainCircuit className="size-4" />
          Mentor IA
        </p>
        <h3 className="text-lg font-semibold tracking-[-0.04em] text-white">{title}</h3>
        <p className="text-sm leading-7 text-slate-300">{content}</p>
      </CardContent>
    </Card>
  );
}
