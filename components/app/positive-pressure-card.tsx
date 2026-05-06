import { DailyInsightCard } from "@/components/app/daily-insight-card";

export function PositivePressureCard({ content }: { content: string }) {
  return <DailyInsightCard title="Pressão positiva" content={content} />;
}
