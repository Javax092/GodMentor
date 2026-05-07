import { DailyInsightCard } from "@/components/app/daily-insight-card";

export function WeeklyReviewAiSummary({ content }: { content: string }) {
  return <DailyInsightCard title="Revisão semanal" content={content} />;
}
