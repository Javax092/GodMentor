import { LockKeyhole, Unlock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { iconMap } from "@/lib/constants";
import { formatShortDate } from "@/lib/utils";

export function AchievementGrid({
  achievements
}: {
  achievements: Array<{
    key: string;
    title: string;
    description: string;
    icon: string;
    requirement: string;
    isUnlocked: boolean;
    unlockedAt: Date | null;
  }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {achievements.map((achievement) => {
        const Icon = iconMap[achievement.icon as keyof typeof iconMap] ?? iconMap.Sparkles;
        return (
          <Card key={achievement.key} className={achievement.isUnlocked ? "border-cyan-400/15" : "border-white/10 opacity-90"}>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <Icon className="size-5 text-cyan-200" />
                </div>
                {achievement.isUnlocked ? <Unlock className="size-4 text-emerald-300" /> : <LockKeyhole className="size-4 text-slate-500" />}
              </div>
              <div>
                <p className="text-lg font-semibold tracking-[-0.04em] text-white">{achievement.title}</p>
                <p className="mt-1 text-sm text-slate-400">{achievement.description}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-slate-400">
                {achievement.isUnlocked && achievement.unlockedAt
                  ? `Desbloqueada em ${formatShortDate(achievement.unlockedAt)}`
                  : achievement.requirement}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
