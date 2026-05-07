import {
  GoalStatus,
  InsightType,
  MissionStatus,
  PillarKey,
  Prisma,
  StreakType,
  SubscriptionTier,
  XpSource
} from "@prisma/client";
import {
  addDays,
  eachDayOfInterval,
  endOfDay,
  endOfWeek,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subWeeks
} from "date-fns";
import { achievementCatalog, levelConfig, pillarCatalog, planConfig, xpSourceLabels } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { ensureDefaultGoals, ensureSystemCatalog, seedStarterEvents } from "@/lib/system";
import { calculateBestStreak, calculateStreak, clamp, compareWeekVariation, formatWeekday, percent, todayKey } from "@/lib/utils";

const dayMs = 86400000;

export async function getDashboardData(userId: string) {
  return getAppOverview(userId);
}

export async function getAiContext(userId: string) {
  const overview = await getAppOverview(userId);

  return {
    entries: overview.journalEntries,
    goals: overview.goals,
    weeklyReview: overview.latestWeeklyReview,
    monthlyReview: overview.latestMonthlyReview
  };
}

export async function getAppOverview(userId: string) {
  await ensureSystemCatalog();
  await ensureDefaultGoals(userId);
  await seedStarterEvents(userId);

  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const previousWeekStart = subWeeks(weekStart, 1);
  const previousWeekEnd = subDays(weekStart, 1);
  const monthStart = startOfMonth(today);
  const recentStart = subDays(today, 29);

  const [
    user,
    pillars,
    missions,
    dailyMissions,
    recentDailyMissions,
    checkIns,
    focusSessions,
    xpEvents,
    goals,
    userMissions,
    aiInsights,
    weeklyReviews,
    monthlyReviews,
    unlockedAchievements
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { subscriptionPlan: true }
    }),
    prisma.pillar.findMany({ orderBy: { order: "asc" } }),
    prisma.mission.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { title: "asc" }],
      include: { pillar: true }
    }),
    prisma.dailyMission.findMany({
      where: { userId, date: { gte: today, lt: tomorrow } },
      include: { mission: true, pillar: true },
      orderBy: [{ pillar: { order: "asc" } }, { mission: { order: "asc" } }]
    }),
    prisma.dailyMission.findMany({
      where: { userId, date: { gte: previousWeekStart, lte: endOfDay(today) } },
      include: { mission: true, pillar: true },
      orderBy: { date: "asc" }
    }),
    prisma.checkIn.findMany({
      where: { userId, date: { gte: recentStart, lte: endOfDay(today) } },
      orderBy: { date: "asc" }
    }),
    prisma.focusSession.findMany({
      where: { userId, startedAt: { gte: recentStart, lte: endOfDay(today) } },
      orderBy: { startedAt: "asc" }
    }),
    prisma.xpEvent.findMany({
      where: { userId, occurredAt: { gte: recentStart, lte: endOfDay(today) } },
      orderBy: { occurredAt: "asc" }
    }),
    prisma.goal.findMany({
      where: { userId },
      orderBy: [{ status: "asc" }, { priority: "desc" }, { updatedAt: "desc" }],
      include: { pillar: true }
    }),
    prisma.userMission.findMany({
      where: { userId },
      include: { pillar: true, history: { orderBy: { createdAt: "desc" }, take: 5 } },
      orderBy: [{ status: "asc" }, { priority: "desc" }, { dueDate: "asc" }, { updatedAt: "desc" }]
    }),
    prisma.aiInsight.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 24
    }),
    prisma.weeklyReview.findMany({
      where: { userId },
      orderBy: { weekStart: "desc" },
      take: 8
    }),
    prisma.monthlyReview.findMany({
      where: { userId },
      orderBy: { month: "desc" },
      take: 4
    }),
    prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" }
    })
  ]);

  const planTier = user?.subscriptionTier ?? SubscriptionTier.FREE;
  const plan = planConfig[planTier];
  const fallbackPillars = pillarCatalog.map((pillar, index) => ({
    id: pillar.key,
    key: pillar.key,
    name: pillar.name,
    description: pillar.description,
    icon: pillar.icon,
    color: pillar.color,
    order: index + 1
  }));
  const sourcePillars = pillars.length ? pillars : fallbackPillars;
  const activePillars = plan.pillarsLimit ? sourcePillars.slice(0, plan.pillarsLimit) : sourcePillars;
  const activePillarIds = new Set(activePillars.map((pillar) => pillar.id));
  const activePillarKeys = new Set(activePillars.map((pillar) => pillar.key));

  const fallbackMissions = activePillars.map((pillar, index) => {
    const template = pillarCatalog.find((item) => item.key === pillar.key) ?? pillarCatalog[index];
    return {
      id: `${pillar.key}-default`,
      pillarId: pillar.id,
      title: template.missionTitle,
      description: template.missionDescription,
      xpReward: template.xpReward,
      isActive: true,
      order: index + 1,
      pillar
    };
  });

  const sourceMissions = missions.filter((mission) => activePillarIds.has(mission.pillarId));
  const todaysMissionSource = sourceMissions.length ? sourceMissions : fallbackMissions;
  const dailyByMissionId = new Map(dailyMissions.map((item) => [item.missionId, item]));
  const missionsToday = todaysMissionSource.map((mission) => {
    const existing = dailyByMissionId.get(mission.id);
    const status = existing?.status ?? MissionStatus.PENDING;
    return {
      id: existing?.id ?? `virtual-${mission.id}`,
      missionId: mission.id,
      pillarId: mission.pillarId,
      pillarName: mission.pillar.name,
      pillarKey: mission.pillar.key,
      pillarColor: mission.pillar.color,
      title: mission.title,
      description: mission.description,
      xpReward: mission.xpReward,
      status,
      progress: existing?.progress ?? 0,
      xpEarned: existing?.xpEarned ?? 0,
      completedAt: existing?.completedAt ?? null,
      history: recentDailyMissions
        .filter((item) => item.missionId === mission.id)
        .slice(-5)
        .map((item) => ({
          date: item.date,
          status: item.status,
          progress: item.progress
        }))
    };
  });

  const userMissionsCompletedToday = userMissions.filter(
    (mission) => mission.completedAt && isSameDay(mission.completedAt, today)
  ).length;
  const missionsCompletedToday = missionsToday.filter((mission) => mission.status === MissionStatus.COMPLETED).length + userMissionsCompletedToday;
  const activeMissionCount = missionsToday.length;
  const checkInsThisWeek = checkIns.filter((checkIn) => checkIn.date >= weekStart && checkIn.date <= weekEnd);
  const previousWeekCheckIns = checkIns.filter((checkIn) => checkIn.date >= previousWeekStart && checkIn.date <= previousWeekEnd);
  const weekMissionItems = recentDailyMissions.filter((item) => item.date >= weekStart);
  const previousWeekMissionItems = recentDailyMissions.filter((item) => item.date >= previousWeekStart && item.date <= previousWeekEnd);
  const weekCompletedMissions = weekMissionItems.filter((item) => item.status === MissionStatus.COMPLETED).length;
  const previousWeekCompletedMissions = previousWeekMissionItems.filter((item) => item.status === MissionStatus.COMPLETED).length;
  const todayCheckIn = checkIns.find((checkIn) => isSameDay(checkIn.date, today)) ?? null;
  const streakDates = [
    ...checkIns.map((checkIn) => checkIn.date),
    ...recentDailyMissions.filter((item) => item.status === MissionStatus.COMPLETED).map((item) => item.date),
    ...userMissions.filter((mission) => mission.completedAt).map((mission) => mission.completedAt as Date)
  ];
  const currentStreak = calculateStreak(streakDates, today);
  const bestStreak = Math.max(
    calculateBestStreak(streakDates),
    ...unlockedAchievements
      .filter((entry) => entry.achievement.key === "three-day-streak")
      .map(() => 3),
    0
  );

  const totalXp = xpEvents.reduce((sum, event) => sum + event.amount, 0);
  const xpToday = xpEvents.filter((event) => isSameDay(event.occurredAt, today)).reduce((sum, event) => sum + event.amount, 0);
  const weekXp = xpEvents.filter((event) => event.occurredAt >= weekStart).reduce((sum, event) => sum + event.amount, 0);
  const previousWeekXp = xpEvents
    .filter((event) => event.occurredAt >= previousWeekStart && event.occurredAt <= previousWeekEnd)
    .reduce((sum, event) => sum + event.amount, 0);
  const weeklyVariation = compareWeekVariation(weekXp, previousWeekXp);
  const level = getLevelData(totalXp);

  const energyAverage = checkInsThisWeek.length
    ? Math.round(checkInsThisWeek.reduce((sum, item) => sum + item.energy, 0) / checkInsThisWeek.length)
    : 0;
  const previousEnergyAverage = previousWeekCheckIns.length
    ? Math.round(previousWeekCheckIns.reduce((sum, item) => sum + item.energy, 0) / previousWeekCheckIns.length)
    : 0;
  const focusSessionsThisWeek = focusSessions.filter((session) => session.startedAt >= weekStart);
  const previousFocusSessions = focusSessions.filter(
    (session) => session.startedAt >= previousWeekStart && session.startedAt <= previousWeekEnd
  );
  const focusMinutesThisWeek = focusSessionsThisWeek.reduce((sum, session) => sum + session.durationMinutes, 0);
  const previousFocusMinutes = previousFocusSessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  const focusWeeklyVariation = compareWeekVariation(focusMinutesThisWeek, previousFocusMinutes);
  const executionRate = percent(
    weekMissionItems.filter((item) => item.status === MissionStatus.COMPLETED).length,
    Math.max(activeMissionCount * 7, 1)
  );
  const weeklyConsistency = percent(weekCompletedMissions, Math.max(activeMissionCount * 7, 1));
  const accessiblePillarsDone = new Set(
    missionsToday.filter((mission) => mission.status === MissionStatus.COMPLETED).map((mission) => mission.pillarKey)
  ).size;

  const goalsActive = goals.filter((goal) => goal.status === GoalStatus.ACTIVE);
  const topGoal = goalsActive[0] ?? null;
  const activeGoalWithPillar = goalsActive.find((goal) => goal.pillar && activePillarKeys.has(goal.pillar.key));
  const focusWeeklyLabel = activeGoalWithPillar?.title ?? todayCheckIn?.improveTomorrow ?? "Definir a frente principal";
  const recommendedMission =
    userMissions.find((mission) => mission.status !== MissionStatus.COMPLETED) ??
    missionsToday.find((mission) => mission.status !== MissionStatus.COMPLETED) ??
    null;
  const pillarsProgress = activePillars.map((pillar) => {
    const missionTemplate = missionsToday.find((mission) => mission.pillarId === pillar.id);
    const pillarCheckins = recentDailyMissions.filter((item) => item.pillarId === pillar.id);
    const completed = pillarCheckins.filter((item) => item.status === MissionStatus.COMPLETED).length;
    const total = pillarCheckins.length || 1;
    const progress = missionTemplate?.status === MissionStatus.COMPLETED ? 100 : missionTemplate?.progress ?? 0;

    return {
      id: pillar.id,
      key: pillar.key,
      name: pillar.name,
      description: pillar.description,
      icon: pillar.icon,
      color: pillar.color,
      todayProgress: progress,
      completionRate: percent(completed, total),
      metricLabel: pillarCatalog.find((item) => item.key === pillar.key)?.metricLabel ?? "Progresso"
    };
  });

  const focusPattern = getBestFocusWindow(focusSessions);
  const inferredInsights = buildInferredInsights({
    accessiblePillarsDone,
    activeMissionCount,
    checkInsThisWeek,
    currentStreak,
    energyAverage,
    focusPattern,
    focusWeeklyLabel,
    focusSessionsThisWeek,
    missionsToday,
    postsGapDays: getPostsGapDays(xpEvents),
    totalXp,
    weekXp
  });

  const storedInsights = aiInsights.map((insight) => ({
    id: insight.id,
    type: insight.type,
    title: insight.title ?? mapInsightTitle(insight.type),
    content: insight.content,
    strength: insight.strength ?? 70,
    createdAt: insight.createdAt
  }));

  const aiCards = [...storedInsights, ...inferredInsights]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, plan.hasFullAiMentor ? 8 : 3);

  const achievements = achievementCatalog.map((item) => {
    const unlocked = unlockedAchievements.find((entry) => entry.achievement.key === item.key);
    return {
      ...item,
      unlockedAt: unlocked?.unlockedAt ?? null,
      isUnlocked: Boolean(unlocked)
    };
  });

  const xpHistory = eachDayOfInterval({ start: recentStart, end: today }).map((date) => ({
    date,
    key: todayKey(date),
    label: formatWeekday(date),
    xp: xpEvents.filter((event) => isSameDay(event.occurredAt, date)).reduce((sum, event) => sum + event.amount, 0),
    focusMinutes: focusSessions.filter((session) => isSameDay(session.startedAt, date)).reduce((sum, session) => sum + session.durationMinutes, 0),
    missions: recentDailyMissions.filter((mission) => isSameDay(mission.date, date) && mission.status === MissionStatus.COMPLETED).length
  }));

  const dailyCompletionTimeline = eachDayOfInterval({ start: subDays(today, 6), end: today }).map((date) => {
    const completed = recentDailyMissions.filter(
      (mission) => isSameDay(mission.date, date) && mission.status === MissionStatus.COMPLETED
    ).length;
    const checkIn = checkIns.find((item) => isSameDay(item.date, date));

    return {
      date,
      label: formatWeekday(date),
      completed,
      score: checkIn?.dayScore ?? 0
    };
  });

  const planPermissions = {
    tier: planTier,
    ...plan
  };

  const focusSessionSummary = {
    totalToday: focusSessions
      .filter((session) => isSameDay(session.startedAt, today))
      .reduce((sum, session) => sum + session.durationMinutes, 0),
    totalWeek: focusMinutesThisWeek,
    variation: focusWeeklyVariation,
    recent: focusSessions.slice(-8).reverse()
  };

  const dashboardHero = {
    consistencyPercent: weeklyConsistency,
    streakDays: currentStreak,
    pillarsDoneToday: accessiblePillarsDone,
    pillarsTotalToday: activeMissionCount,
    bestStreak,
    headline:
      weeklyConsistency >= 70
        ? "Seu sistema está ganhando inércia."
        : weeklyConsistency >= 40
          ? "Sua semana ainda está aberta para recuperação."
          : "Você precisa de um dia forte para virar a curva.",
    subheadline:
      missionsCompletedToday > 0
        ? "Proteja o que já foi concluído e feche os pilares pendentes antes da noite."
        : "Abra o dia pela missão mais crítica. Clareza antes de volume."
  };

  const kpis = [
    {
      id: "streak",
      label: "Streak atual",
      value: `${currentStreak} dias`,
      icon: "Flame",
      microcopy: currentStreak >= 3 ? "Disciplina visível. Não negocie o hoje." : "A sequência ainda está frágil. Feche o dia.",
      progress: clamp(percent(currentStreak, Math.max(bestStreak || 7, 7))),
      variation: compareWeekVariation(currentStreak, Math.max(currentStreak - 1, 0)),
      empty: currentStreak === 0 ? "Nenhuma sequência ativa. O primeiro fechamento vale mais que motivação." : null
    },
    {
      id: "missions",
      label: "Missões completas",
      value: `${missionsCompletedToday}/${activeMissionCount}`,
      icon: "Target",
      microcopy: "Cada pilar fechado reduz atrito para amanhã.",
      progress: percent(missionsCompletedToday, Math.max(activeMissionCount, 1)),
      variation: compareWeekVariation(weekCompletedMissions, previousWeekCompletedMissions),
      empty: activeMissionCount === 0 ? "Nenhuma missão definida para hoje. Ative seus pilares." : null
    },
    {
      id: "level",
      label: "Nível pessoal",
      value: level.current.name,
      icon: "Gem",
      microcopy: `${level.xpToNext} XP para ${level.next.name}.`,
      progress: level.progressPercent,
      variation: weeklyVariation,
      empty: totalXp === 0 ? "Seu progresso ainda não gerou XP. Conclua a primeira missão." : null
    },
    {
      id: "weekly-focus",
      label: "Foco semanal",
      value: focusWeeklyLabel,
      icon: "Radar",
      microcopy: "Uma frente clara evita dias lotados e vazios.",
      progress: topGoal?.progress ?? 0,
      variation: compareWeekVariation(topGoal?.progress ?? 0, Math.max((topGoal?.progress ?? 0) - 12, 0)),
      empty: !topGoal ? "Sem meta ativa ligada à semana. Defina o alvo que realmente importa." : null
    },
    {
      id: "energy",
      label: "Energia",
      value: energyAverage ? `${energyAverage}/10` : "Sem leitura",
      icon: "Activity",
      microcopy: "Energia consistente sustenta execução sem heroicidade.",
      progress: energyAverage * 10,
      variation: compareWeekVariation(energyAverage, previousEnergyAverage),
      empty: !energyAverage ? "Sem check-ins suficientes para ler sua energia." : null
    },
    {
      id: "execution",
      label: "Execução",
      value: `${executionRate}%`,
      icon: "Zap",
      microcopy: "Execução semanal mede fricção, não intenção.",
      progress: executionRate,
      variation: compareWeekVariation(executionRate, Math.max(executionRate - 9, 0)),
      empty: weekMissionItems.length === 0 ? "Sua semana ainda não gerou entregas mensuráveis." : null
    },
    {
      id: "ranking",
      label: "Ranking",
      value: planTier === SubscriptionTier.FREE ? "Bloqueado" : weeklyVariation > 0 ? `+${weeklyVariation}%` : `${weeklyVariation}%`,
      icon: "Trophy",
      microcopy: planTier === SubscriptionTier.FREE ? "Ranking comparativo disponível no Pro." : "Compare sua semana com seu histórico recente.",
      progress: planTier === SubscriptionTier.FREE ? 0 : clamp(50 + weeklyVariation),
      variation: weeklyVariation,
      empty: planTier === SubscriptionTier.FREE ? "Ative Pro para abrir ranking e comparação expandida." : null
    }
  ];

  return {
    user,
    plan: planPermissions,
    hero: dashboardHero,
    kpis,
    missionsToday,
    userMissions,
    recommendedMission,
    goals,
    pillarsProgress,
    focus: focusSessionSummary,
    aiCards,
    achievements,
    level,
    streak: {
      current: currentStreak,
      best: bestStreak,
      type: StreakType.DAILY
    },
    xp: {
      total: totalXp,
      today: xpToday,
      week: weekXp,
      variation: weeklyVariation,
      history: xpHistory,
      recentEvents: xpEvents.slice(-8).reverse().map((event) => ({
        id: event.id,
        amount: event.amount,
        source: event.source,
        label: xpSourceLabels[event.source],
        description: event.description,
        occurredAt: event.occurredAt
      }))
    },
    checkIn: {
      today: todayCheckIn,
      averageEnergy: energyAverage,
      recent: checkIns.slice(-7).reverse()
    },
    reviews: weeklyReviews,
    latestWeeklyReview: weeklyReviews[0] ?? null,
    latestMonthlyReview: monthlyReviews[0] ?? null,
    journalEntries: [],
    analytics: {
      weeklyConsistency,
      executionRate,
      focusPattern,
      dailyCompletionTimeline,
      strongestPillar: [...pillarsProgress].sort((a, b) => b.completionRate - a.completionRate)[0] ?? null,
      weakestPillar: [...pillarsProgress].sort((a, b) => a.completionRate - b.completionRate)[0] ?? null,
      monthlyXp: xpEvents.filter((event) => event.occurredAt >= monthStart).reduce((sum, event) => sum + event.amount, 0)
    }
  };
}

function getLevelData(totalXp: number) {
  const current =
    [...levelConfig].reverse().find((level) => totalXp >= level.minXp) ??
    levelConfig[0];
  const next = levelConfig.find((level) => level.rank === current.rank + 1) ?? current;
  const span = Math.max(next.minXp - current.minXp, 1);
  const progressPercent = current.rank === next.rank ? 100 : clamp(Math.round(((totalXp - current.minXp) / span) * 100));

  return {
    current,
    next,
    totalXp,
    progressPercent,
    xpIntoLevel: totalXp - current.minXp,
    xpToNext: Math.max(next.minXp - totalXp, 0)
  };
}

function buildInferredInsights(input: {
  accessiblePillarsDone: number;
  activeMissionCount: number;
  checkInsThisWeek: Array<{ createdAt: Date; energy: number; sleepHours: number | null }>;
  currentStreak: number;
  energyAverage: number;
  focusPattern: string;
  focusWeeklyLabel: string;
  focusSessionsThisWeek: Array<{ durationMinutes: number }>;
  missionsToday: Array<{ status: MissionStatus; title: string }>;
  postsGapDays: number | null;
  totalXp: number;
  weekXp: number;
}) {
  const now = new Date();
  const completedToday = input.missionsToday.filter((mission) => mission.status === MissionStatus.COMPLETED).length;
  const avgSleep = input.checkInsThisWeek.length
    ? input.checkInsThisWeek.reduce((sum, item) => sum + (item.sleepHours ?? 0), 0) / input.checkInsThisWeek.length
    : 0;
  const focusHours = Math.round((input.focusSessionsThisWeek.reduce((sum, item) => sum + item.durationMinutes, 0) / 60) * 10) / 10;

  return [
    {
      id: "daily-summary",
      type: InsightType.DAILY_SUMMARY,
      title: "Resumo diário",
      content: `Você completou ${completedToday}/${input.activeMissionCount} pilares hoje. Sua frente principal continua sendo ${input.focusWeeklyLabel.toLowerCase()}.`,
      strength: clamp(55 + completedToday * 8),
      createdAt: now
    },
    {
      id: "pattern-detected",
      type: InsightType.PATTERN,
      title: "Padrão identificado",
      content:
        avgSleep >= 7
          ? "Seu foco melhora quando você dorme antes da meia-noite e preserva a manhã para execução."
          : `Seu melhor horário de produtividade continua entre ${input.focusPattern}. O sono recente ainda está encurtando sua tração.`,
      strength: 78,
      createdAt: new Date(now.getTime() - dayMs)
    },
    {
      id: "positive-pressure",
      type: InsightType.POSITIVE_PRESSURE,
      title: "Pressão positiva",
      content:
        input.currentStreak >= 3
          ? `Você está há ${input.currentStreak} dias em evolução. Um dia forte agora aproxima o próximo nível com menos esforço.`
          : "Sua sequência ainda não está protegida. Fechar hoje muda o tom da semana inteira.",
      strength: 72,
      createdAt: new Date(now.getTime() - 2 * dayMs)
    },
    {
      id: "recommendation",
      type: InsightType.RECOMMENDATION,
      title: "Recomendação prática",
      content: `Priorize 1 bloco de foco e 1 missão de alto atrito. Isso deve gerar cerca de ${Math.max(60, Math.round(input.weekXp / 4) || 80)} XP ainda hoje.`,
      strength: 74,
      createdAt: new Date(now.getTime() - 3 * dayMs)
    },
    {
      id: "alert",
      type: InsightType.ALERT,
      title: "Alerta",
      content:
        input.postsGapDays && input.postsGapDays >= 4
          ? `Você está há ${input.postsGapDays} dias sem postar conteúdo. Sua reputação perdeu cadência.`
          : `Seu volume de foco nesta semana está em ${focusHours}h. Se cair mais, sua execução deve desacelerar após as 15h.`,
      strength: 69,
      createdAt: new Date(now.getTime() - 4 * dayMs)
    },
    {
      id: "weekly-review-ai",
      type: InsightType.WEEKLY_REVIEW,
      title: "Leitura semanal",
      content:
        input.totalXp >= 1000
          ? "Sua identidade de execução está ficando clara. O próximo salto vem de consistência, não de mais volume."
          : "Seu sistema já gerou sinal suficiente para aprender. Agora falta reduzir dispersão e repetir o básico.",
      strength: 80,
      createdAt: new Date(now.getTime() - 5 * dayMs)
    }
  ];
}

function getBestFocusWindow(sessions: Array<{ startedAt: Date; durationMinutes: number }>) {
  const buckets = new Map<string, number>();

  for (const session of sessions) {
    const hour = session.startedAt.getHours();
    const label = hour < 8 ? "6h e 8h" : hour < 11 ? "8h e 11h" : hour < 15 ? "11h e 15h" : "15h e 19h";
    buckets.set(label, (buckets.get(label) ?? 0) + session.durationMinutes);
  }

  return [...buckets.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "8h e 11h";
}

function getPostsGapDays(events: Array<{ source: XpSource; occurredAt: Date }>) {
  const lastContent = [...events].reverse().find((event) => event.source === XpSource.CONTENT);
  if (!lastContent) {
    return null;
  }

  return Math.floor((Date.now() - lastContent.occurredAt.getTime()) / dayMs);
}

function mapInsightTitle(type: InsightType) {
  switch (type) {
    case InsightType.ALERT:
      return "Alerta";
    case InsightType.PATTERN:
      return "Padrão identificado";
    case InsightType.POSITIVE_PRESSURE:
      return "Pressão positiva";
    case InsightType.RECOMMENDATION:
      return "Recomendação prática";
    case InsightType.WEEKLY_REVIEW:
    case InsightType.WEEKLY:
      return "Revisão semanal";
    case InsightType.MONTHLY:
      return "Resumo mensal";
    default:
      return "Resumo diário";
  }
}

export type GoalWithDates = Prisma.GoalGetPayload<{ include: { pillar: true } }>;
