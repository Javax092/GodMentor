import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function LevelBadge({
  levelName,
  rank,
  className
}: {
  levelName: string;
  rank: number;
  className?: string;
}) {
  return (
    <Badge
      className={cn(
        "rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-cyan-100",
        className
      )}
    >
      <Crown className="mr-1.5 size-3.5" />
      Nível {rank} • {levelName}
    </Badge>
  );
}
