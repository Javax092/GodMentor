"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Pause, Play, Save, Square } from "lucide-react";
import { saveFocusSessionAction } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function FocusTimer({ suggestedMinutes = 50 }: { suggestedMinutes?: number }) {
  const [seconds, setSeconds] = useState(suggestedMinutes * 60);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!running) {
      return;
    }

    const interval = window.setInterval(() => {
      setSeconds((value) => Math.max(value - 1, 0));
      setElapsed((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (seconds === 0) {
      setRunning(false);
    }
  }, [seconds]);

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  const elapsedMinutes = Math.max(1, Math.round(elapsed / 60));

  return (
    <Card className="border-white/10">
      <CardContent className="space-y-6 p-5">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Deep Work</p>
          <p className="text-5xl font-semibold tracking-[-0.08em] text-white">
            {minutes}:{secs}
          </p>
          <p className="text-sm text-slate-400">Timer Pomodoro com registro de XP ao concluir.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Button type="button" onClick={() => setRunning(true)} className="gap-2">
            <Play className="size-4" />
            Iniciar
          </Button>
          <Button type="button" variant="outline" onClick={() => setRunning(false)} className="gap-2">
            <Pause className="size-4" />
            Pausar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setRunning(false);
              setSeconds(suggestedMinutes * 60);
              setElapsed(0);
            }}
            className="gap-2"
          >
            <Square className="size-4" />
            Resetar
          </Button>
          <form
            ref={formRef}
            action={(formData) =>
              startTransition(async () => {
                await saveFocusSessionAction(formData);
              })
            }
          >
            <input type="hidden" name="durationMinutes" value={elapsedMinutes} />
            <input type="hidden" name="category" value="Deep work" />
            <Button type="submit" disabled={elapsedMinutes < 5 || isPending} className="w-full gap-2">
              <Save className="size-4" />
              Concluir
            </Button>
          </form>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
          Duração acumulada: {elapsedMinutes} min. Ao concluir, a sessão vira XP e histórico real.
        </div>
      </CardContent>
    </Card>
  );
}
