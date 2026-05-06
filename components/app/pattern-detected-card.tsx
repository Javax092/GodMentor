import { DailyInsightCard } from "@/components/app/daily-insight-card";

export function PatternDetectedCard({ content }: { content: string }) {
  return <DailyInsightCard title="Padrão identificado" content={content} />;
}
