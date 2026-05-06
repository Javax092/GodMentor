import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LevelBadge } from "@/components/app/level-badge";

export function DashboardHero({
  hero,
  level,
  primaryHref = "/missoes"
}: {
  hero: {
    consistencyPercent: number;
    streakDays: number;
    pillarsDoneToday: number;
    pillarsTotalToday: number;
    bestStreak: number;
    headline: string;
    subheadline: string;
  };
  level: {
    current: { name: string; rank: number };
    next: { name: string };
    xpToNext: number;
  };
  primaryHref?: string;
}) {
  const messages = [
    `Você está ${hero.consistencyPercent}% consistente esta semana.`,
    `${hero.streakDays} ${hero.streakDays === 1 ? "dia seguido" : "dias seguidos"} em evolução.`,
    `Você completou ${hero.pillarsDoneToday}/${hero.pillarsTotalToday} pilares hoje.`,
    `Sua melhor sequência foi de ${hero.bestStreak} dias.`
  ];

  return (
    <section className="surface panel-grid relative overflow-hidden border-white/10 p-5 md:p-7">
      <div className="absolute inset-x-10 top-0 h-40 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <LevelBadge levelName={level.current.name} rank={level.current.rank} />
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/80">Progresso diário</p>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.06em] text-white md:text-5xl">{hero.headline}</h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{hero.subheadline}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="justify-between gap-2">
              <Link href={primaryHref}>
                Ver missões de hoje
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/ia">Ler mentor IA</Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-3">
          {messages.map((message) => (
            <div key={message} className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl">
              <p className="flex items-center gap-2 text-sm font-medium text-slate-100">
                <Sparkles className="size-4 text-cyan-300" />
                {message}
              </p>
            </div>
          ))}
          <div className="rounded-[24px] border border-cyan-400/15 bg-cyan-400/8 p-4 text-sm text-slate-200">
            <span className="text-cyan-200">{level.xpToNext} XP</span> para desbloquear {level.next.name}.
          </div>
        </div>
      </div>
    </section>
  );
}
