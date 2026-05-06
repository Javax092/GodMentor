import { format } from "date-fns";
import { Goal, JournalEntry, MonthlyReview, WeeklyReview } from "@prisma/client";

type AiContext = {
  entries: JournalEntry[];
  goals: Goal[];
  weeklyReview: WeeklyReview | null;
  monthlyReview: MonthlyReview | null;
};

export function buildLocalInsight(context: AiContext, type: "insight" | "weekly" | "monthly") {
  const averageScore = context.entries.length
    ? context.entries.reduce((acc, entry) => acc + entry.score, 0) / context.entries.length
    : 0;
  const activeGoals = context.goals.filter((goal) => goal.status === "ACTIVE");
  const completedGoals = context.goals.filter((goal) => goal.status === "COMPLETED");
  const latestMood = context.entries[0]?.mood ?? "sem registro recente";

  if (type === "weekly") {
    return {
      summary: `Sua semana mostrou nota média de ${averageScore.toFixed(1)} e ${completedGoals.length} metas concluídas.`,
      focus: activeGoals[0]?.title ?? "Definir uma meta principal para a semana.",
      negativePattern:
        averageScore < 7
          ? "A nota média caiu. Revise energia, carga e constância dos seus dias."
          : "Nenhum padrão crítico apareceu, mas vale proteger as rotinas que já funcionam.",
      recommendation:
        context.weeklyReview?.nextFocus ??
        "Escolha um objetivo de alto impacto e reserve um bloco fixo no início do dia para avançar."
    };
  }

  if (type === "monthly") {
    return {
      summary: `No mês, você trabalhou ${context.goals.length} metas e manteve humor recente em ${latestMood}.`,
      focus: context.monthlyReview?.nextMonthFocus ?? "Consolidar uma meta mensal com indicador claro.",
      negativePattern:
        activeGoals.filter((goal) => goal.progress < 30).length > 2
          ? "Há metas demais avançando pouco ao mesmo tempo. Corte dispersão."
          : "Seu portfólio de metas parece saudável, desde que a prioridade principal continue explícita.",
      recommendation:
        "Mantenha no máximo três metas estratégicas ativas e faça revisões semanais para corrigir o curso antes do fim do mês."
    };
  }

  return {
    summary: `Seu histórico recente indica humor ${latestMood} e média ${averageScore.toFixed(1)} nos últimos registros.`,
    focus: context.entries[0]?.tomorrowPriority ?? activeGoals[0]?.title ?? "Definir foco para amanhã.",
    negativePattern:
      averageScore < 6.5
        ? "A energia parece em queda. Vale observar sobrecarga, sono e metas concorrentes."
        : "Seu padrão está estável. O risco maior agora é perder clareza de prioridade.",
    recommendation:
      "Feche hoje anotando uma única prioridade para amanhã e a primeira ação concreta para iniciá-la."
  };
}

export function buildOpenAiPrompt(context: AiContext, type: "insight" | "weekly" | "monthly") {
  return `
Você é um mentor de performance pessoal e profissional.
Tipo de análise: ${type}
Data: ${format(new Date(), "yyyy-MM-dd")}

Entradas recentes:
${context.entries
  .slice(0, 7)
  .map((entry) => `- ${format(entry.date, "yyyy-MM-dd")}: nota ${entry.score}, humor ${entry.mood}, foco ${entry.tomorrowPriority}`)
  .join("\n")}

Metas:
${context.goals
  .slice(0, 8)
  .map((goal) => `- ${goal.title}: ${goal.status}, progresso ${goal.progress}%`)
  .join("\n")}

Revisão semanal:
${context.weeklyReview ? JSON.stringify(context.weeklyReview) : "Sem revisão"}

Revisão mensal:
${context.monthlyReview ? JSON.stringify(context.monthlyReview) : "Sem revisão"}

Retorne JSON com:
summary, focus, negativePattern, recommendation
`.trim();
}
