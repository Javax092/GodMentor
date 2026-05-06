"use client";

import { startTransition, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, ChevronLeft, ChevronRight, CircleAlert, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type CheckInCardProps = {
  defaultScore: number;
  defaultTomorrowPriority: string;
  hasEntryToday: boolean;
};

type CheckInStep = 1 | 2 | 3;

function getCurrentDate() {
  return new Date().toLocaleDateString("en-CA");
}

function deriveMood(score: number, priorityExecuted: string) {
  if (priorityExecuted === "yes" && score >= 8) return "Focado";
  if (priorityExecuted === "yes") return "Equilibrado";
  if (score <= 4) return "Cansado";
  if (score <= 6) return "Ansioso";
  return "Inspirado";
}

const scoreOptions = Array.from({ length: 10 }, (_, index) => index + 1);
const steps = [
  { id: 1, label: "Base" },
  { id: 2, label: "Leitura" },
  { id: 3, label: "Amanhã" }
] as const;

export function CheckInCard({ defaultScore, defaultTomorrowPriority, hasEntryToday }: CheckInCardProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [score, setScore] = useState(String(defaultScore));
  const [priorityExecuted, setPriorityExecuted] = useState("yes");
  const [advance, setAdvance] = useState("");
  const [blocker, setBlocker] = useState("");
  const [tomorrowPriority, setTomorrowPriority] = useState(defaultTomorrowPriority);
  const [step, setStep] = useState<CheckInStep>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [entryRecorded, setEntryRecorded] = useState(hasEntryToday);

  useEffect(() => {
    setEntryRecorded(hasEntryToday);
  }, [hasEntryToday]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const numericScore = Number(score);
    const safeAdvance = advance.trim();
    const safeBlocker = blocker.trim() || "Sem bloqueio crítico.";
    const safeTomorrowPriority = tomorrowPriority.trim();
    const executedLabel = priorityExecuted === "yes" ? "sim" : "nao";

    const response = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: getCurrentDate(),
        score: numericScore,
        mood: deriveMood(numericScore, priorityExecuted),
        content: `Prioridade executada: ${executedLabel}. Avanco principal: ${safeAdvance}. Bloqueio: ${safeBlocker}.`,
        win: safeAdvance,
        challenge: safeBlocker,
        tomorrowPriority: safeTomorrowPriority,
        gratitude: "Continuidade e clareza para o proximo passo."
      })
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Nao foi possivel salvar o check-in.");
      return;
    }

    setEntryRecorded(true);
    setSuccess(hasEntryToday ? "Registro de hoje atualizado." : "Registro de hoje concluido.");
    startTransition(() => router.refresh());
  }

  function moveStep(direction: "next" | "prev") {
    setError("");
    setSuccess("");
    setStep((current) => {
      if (direction === "prev") {
        return Math.max(1, current - 1) as CheckInStep;
      }
      return Math.min(3, current + 1) as CheckInStep;
    });
  }

  const canAdvanceFromStepOne = Number(score) >= 1 && Number(score) <= 10;
  const canAdvanceFromStepTwo = advance.trim().length > 0;
  const canSubmit = canAdvanceFromStepOne && canAdvanceFromStepTwo && tomorrowPriority.trim().length > 0;

  return (
    <Card id="check-in-diario" className="overflow-hidden border-white/10">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">Check-in diario</p>
            <CardTitle className="mt-2 text-xl tracking-[-0.04em] md:text-2xl">Fluxo rapido para fechar hoje</CardTitle>
          </div>
          <div
            className={cn(
              "w-fit rounded-full border px-3 py-1 text-xs",
              entryRecorded
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
                : "border-amber-500/20 bg-amber-500/10 text-amber-100"
            )}
          >
            {entryRecorded ? "Voce ja registrou hoje" : "Registrar hoje"}
          </div>
        </div>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">Tres etapas, poucos campos e uma decisao clara para amanha.</p>
        <div className="grid grid-cols-3 gap-2">
          {steps.map((item) => {
            const active = item.id === step;
            const done = item.id < step;

            return (
              <div
                className={cn(
                  "rounded-2xl border px-3 py-3 text-left transition-all",
                  active ? "border-primary/25 bg-primary/[0.12]" : "border-white/8 bg-white/[0.03]"
                )}
                key={item.id}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full border text-xs font-semibold",
                      done || active
                        ? "border-primary/25 bg-primary/[0.14] text-primary"
                        : "border-white/10 text-muted-foreground"
                    )}
                  >
                    {done ? <CheckCircle2 className="size-3.5" /> : item.id}
                  </div>
                  <span className={cn("text-xs font-medium", active ? "text-foreground" : "text-muted-foreground")}>{item.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit}>
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -8 }}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 8 }}
              key={step}
              transition={{ duration: reduceMotion ? 0.1 : 0.2, ease: "easeOut" }}
            >
              {step === 1 ? (
                <>
                  <div className="space-y-3">
                    <Label>Nota de hoje</Label>
                    <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                      {scoreOptions.map((value) => {
                        const active = Number(score) === value;

                        return (
                          <button
                            key={value}
                            className={cn(
                              "flex h-12 items-center justify-center rounded-2xl border text-sm font-semibold transition",
                              active
                                ? "border-primary/35 bg-primary/14 text-foreground shadow-[0_0_0_1px_rgba(96,165,250,0.08)]"
                                : "border-white/8 bg-white/[0.03] text-muted-foreground"
                            )}
                            type="button"
                            onClick={() => setScore(String(value))}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Prioridade principal executada?</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className={cn(
                          "rounded-2xl border px-4 py-4 text-sm font-medium transition",
                          priorityExecuted === "yes"
                            ? "border-primary/35 bg-primary/12 text-foreground"
                            : "border-white/8 bg-white/[0.03] text-muted-foreground"
                        )}
                        type="button"
                        onClick={() => setPriorityExecuted("yes")}
                      >
                        Sim, avancei
                      </button>
                      <button
                        className={cn(
                          "rounded-2xl border px-4 py-4 text-sm font-medium transition",
                          priorityExecuted === "no"
                            ? "border-primary/35 bg-primary/12 text-foreground"
                            : "border-white/8 bg-white/[0.03] text-muted-foreground"
                        )}
                        type="button"
                        onClick={() => setPriorityExecuted("no")}
                      >
                        Ainda nao
                      </button>
                    </div>
                  </div>
                </>
              ) : null}

              {step === 2 ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="advance">Avanco principal</Label>
                    <Textarea
                      id="advance"
                      placeholder="O que realmente andou hoje?"
                      className="min-h-28"
                      value={advance}
                      onChange={(event) => setAdvance(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blocker">Bloqueio atual</Label>
                    <Textarea
                      id="blocker"
                      placeholder="Se algo travou, qual foi a friccao principal?"
                      className="min-h-24"
                      value={blocker}
                      onChange={(event) => setBlocker(event.target.value)}
                    />
                  </div>
                </>
              ) : null}

              {step === 3 ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="tomorrowPriority">Prioridade de amanha</Label>
                    <Textarea
                      id="tomorrowPriority"
                      placeholder="Qual e o movimento que voce quer iniciar sem hesitar?"
                      className="min-h-24"
                      value={tomorrowPriority}
                      onChange={(event) => setTomorrowPriority(event.target.value)}
                    />
                  </div>
                  <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-sm font-medium text-foreground">Resumo de hoje</p>
                    <div className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                      <p>
                        Nota: <span className="text-foreground">{score}/10</span>
                      </p>
                      <p>
                        Prioridade executada: <span className="text-foreground">{priorityExecuted === "yes" ? "Sim" : "Nao"}</span>
                      </p>
                      <p>
                        Avanco: <span className="text-foreground">{advance.trim() || "Pendente"}</span>
                      </p>
                    </div>
                  </div>
                </>
              ) : null}
            </motion.div>
          </AnimatePresence>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>
                {entryRecorded
                  ? "Seu registro de hoje ja existe. Se quiser, ajuste e mantenha o historico mais preciso."
                  : "O objetivo aqui e clareza operacional. Feche o dia com sinal util, nao com texto longo."}
              </p>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
          ) : null}

          {success ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-100"
              initial={{ opacity: 0, y: 8 }}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 p-2">
                  <CheckCircle2 className="size-4 text-emerald-300" />
                </div>
                <div>
                  <p className="font-medium">{success}</p>
                  <p className="mt-1 text-emerald-100/80">
                    {priorityExecuted === "yes"
                      ? "O sistema agora pode usar esse sinal para sugerir o proximo passo com mais precisao."
                      : "Registro salvo. Mantenha a proxima prioridade simples o bastante para recomecar rapido."}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-white/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <CircleAlert className="mt-0.5 size-4 text-primary" />
              A prioridade de amanha deve ser especifica o bastante para iniciar sem negociação.
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <Button className="flex-1 sm:flex-none" disabled={step === 1 || loading} type="button" variant="ghost" onClick={() => moveStep("prev")}>
                <ChevronLeft className="size-4" />
                Voltar
              </Button>
              {step < 3 ? (
                <Button
                  className="flex-1 sm:flex-none"
                  disabled={loading || (step === 1 ? !canAdvanceFromStepOne : !canAdvanceFromStepTwo)}
                  type="button"
                  onClick={() => moveStep("next")}
                >
                  Continuar
                  <ChevronRight className="size-4" />
                </Button>
              ) : (
                <Button className="flex-1 sm:flex-none" disabled={loading || !canSubmit} type="submit">
                  {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                  {loading ? "Salvando" : entryRecorded ? "Atualizar hoje" : "Salvar hoje"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
