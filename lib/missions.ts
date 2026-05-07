import { GoalCategory, GoalPriority, GoalStatus, MissionPriority, MissionStatus, StreakType, XpSource } from "@prisma/client";
import { endOfDay, isSameDay, startOfDay, startOfWeek, subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { calculateBestStreak, calculateStreak } from "@/lib/utils";

export const missionCategories = ["estudo", "treino", "vendas", "conteudo", "saude", "foco", "pessoal"] as const;
export type DailyMissionCategory = (typeof missionCategories)[number];

export function getTodayRange(baseDate = new Date()) {
  const start = startOfDay(baseDate);
  const end = endOfDay(baseDate);
  return { start, end };
}

function mapGoalCategory(category: GoalCategory): DailyMissionCategory {
  switch (category) {
    case GoalCategory.STUDIES:
      return "estudo";
    case GoalCategory.HEALTH:
      return "saude";
    case GoalCategory.FINANCIAL:
      return "vendas";
    case GoalCategory.PERSONAL:
    case GoalCategory.RELATIONSHIPS:
      return "pessoal";
    case GoalCategory.PROFESSIONAL:
    default:
      return "foco";
  }
}

function mapGoalPriority(priority: GoalPriority): MissionPriority {
  switch (priority) {
    case GoalPriority.HIGH:
      return MissionPriority.HIGH;
    case GoalPriority.LOW:
      return MissionPriority.LOW;
    default:
      return MissionPriority.MEDIUM;
  }
}

function buildFallbackMissions() {
  return [
    {
      title: "Revisar metas",
      description: "Abra suas metas ativas e alinhe a frente principal antes de executar o restante do dia.",
      category: "foco" as const,
      priority: MissionPriority.HIGH,
      xpReward: 20
    },
    {
      title: "Escrever diário",
      description: "Registrar rapidamente contexto, intenção do dia e o que precisa ser protegido até a noite.",
      category: "pessoal" as const,
      priority: MissionPriority.MEDIUM,
      xpReward: 15
    },
    {
      title: "Executar tarefa principal",
      description: "Fechar um bloco de trabalho real na entrega mais importante do dia.",
      category: "foco" as const,
      priority: MissionPriority.HIGH,
      xpReward: 40
    },
    {
      title: "Cuidar da energia",
      description: "Mover o corpo, hidratar e preservar energia suficiente para manter clareza até o fim do dia.",
      category: "saude" as const,
      priority: MissionPriority.MEDIUM,
      xpReward: 20
    },
    {
      title: "Revisar progresso",
      description: "Fechar o dia conferindo o que foi concluído, o que travou e qual será a prioridade de amanhã.",
      category: "pessoal" as const,
      priority: MissionPriority.LOW,
      xpReward: 20
    }
  ];
}

function dedupeByTitle<T extends { title: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.title.trim().toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

async function buildMissionBlueprints(userId: string) {
  const [goals, latestJournalEntry, latestCheckIn] = await Promise.all([
    prisma.goal.findMany({
      where: { userId, status: GoalStatus.ACTIVE },
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
      take: 3
    }),
    prisma.journalEntry.findFirst({
      where: { userId },
      orderBy: { date: "desc" }
    }),
    prisma.checkIn.findFirst({
      where: { userId },
      orderBy: { date: "desc" }
    })
  ]);

  const primaryGoal = goals[0] ?? null;
  const blueprints = [
    primaryGoal
      ? {
          title: "Executar tarefa principal",
          description: `Avance a meta "${primaryGoal.title}" com uma entrega concreta ainda hoje.`,
          category: mapGoalCategory(primaryGoal.category),
          priority: mapGoalPriority(primaryGoal.priority),
          xpReward: primaryGoal.priority === GoalPriority.HIGH ? 45 : 35
        }
      : null,
    {
      title: "Revisar metas",
      description: primaryGoal
        ? `Revisar suas metas ativas e garantir que "${primaryGoal.title}" continua sendo a frente principal.`
        : "Abra suas metas ativas e defina com clareza o que precisa avançar hoje.",
      category: "foco" as const,
      priority: MissionPriority.HIGH,
      xpReward: 20
    },
    {
      title: "Escrever diário",
      description: latestJournalEntry?.tomorrowPriority
        ? `Retome a prioridade registrada: "${latestJournalEntry.tomorrowPriority}".`
        : "Registrar o contexto do dia para reduzir ruído e manter intenção clara.",
      category: "pessoal" as const,
      priority: MissionPriority.MEDIUM,
      xpReward: 15
    },
    latestCheckIn
      ? {
          title: "Cuidar da energia",
          description: `Corrigir a energia do sistema após o último check-in: ${latestCheckIn.improveTomorrow || "proteger sono, água e movimento"}.`,
          category: "saude" as const,
          priority: MissionPriority.MEDIUM,
          xpReward: 20
        }
      : {
          title: "Cuidar da energia",
          description: "Mover o corpo, hidratar e criar margem de energia antes que a tarde perca tração.",
          category: "saude" as const,
          priority: MissionPriority.MEDIUM,
          xpReward: 20
        },
    {
      title: "Revisar progresso",
      description: goals[1]
        ? `Fechar o dia conferindo avanço em "${goals[1].title}" e ajustando o próximo passo.`
        : "Fechar o dia revisando progresso, bloqueios e a prioridade que vai abrir amanhã.",
      category: "pessoal" as const,
      priority: MissionPriority.LOW,
      xpReward: 20
    }
  ].filter(Boolean);

  const withFallbacks = dedupeByTitle([...(blueprints as NonNullable<(typeof blueprints)[number]>[]), ...buildFallbackMissions()]);
  return withFallbacks.slice(0, 5);
}

export async function getTodayMissions(userId: string) {
  const { start, end } = getTodayRange();
  return prisma.userMission.findMany({
    where: {
      userId,
      dueDate: {
        gte: start,
        lte: end
      }
    },
    orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "asc" }]
  });
}

export async function prepareTodayMissions(userId: string) {
  const { start, end } = getTodayRange();

  return prisma.$transaction(async (tx) => {
    const existing = await tx.userMission.findMany({
      where: {
        userId,
        dueDate: {
          gte: start,
          lte: end
        }
      },
      orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "asc" }]
    });

    if (existing.length) {
      return { created: false, missions: existing };
    }

    const blueprints = await buildMissionBlueprints(userId);

    for (const mission of blueprints) {
      await tx.userMission.create({
        data: {
          userId,
          title: mission.title,
          description: mission.description,
          category: mission.category,
          status: MissionStatus.PENDING,
          priority: mission.priority,
          xpReward: mission.xpReward,
          progress: 0,
          dueDate: start
        }
      });
    }

    const missions = await tx.userMission.findMany({
      where: {
        userId,
        dueDate: {
          gte: start,
          lte: end
        }
      },
      orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "asc" }]
    });

    return { created: true, missions };
  });
}

export async function toggleTodayMission(userId: string, missionId: string) {
  return prisma.$transaction(async (tx) => {
    const mission = await tx.userMission.findFirst({
      where: { id: missionId, userId }
    });

    if (!mission) {
      throw new Error("Missão não encontrada.");
    }

    const isCompleting = mission.status !== MissionStatus.COMPLETED;
    const updated = await tx.userMission.update({
      where: { id: mission.id },
      data: {
        status: isCompleting ? MissionStatus.COMPLETED : MissionStatus.PENDING,
        progress: isCompleting ? 100 : 0,
        completedAt: isCompleting ? new Date() : null
      }
    });

    await tx.userMissionHistory.create({
      data: {
        userId,
        userMissionId: updated.id,
        status: updated.status,
        progress: updated.progress,
        note: isCompleting ? "Missão concluída no plano diário." : "Conclusão desfeita no plano diário."
      }
    });

    if (isCompleting) {
      const awarded = await tx.xpEvent.findFirst({
        where: {
          userId,
          source: XpSource.GOAL,
          referenceId: updated.id
        }
      });

      if (!awarded) {
        await tx.xpEvent.create({
          data: {
            userId,
            amount: updated.xpReward,
            source: XpSource.GOAL,
            description: `Missão concluída: ${updated.title}`,
            referenceId: updated.id
          }
        });
      }
    } else {
      await tx.xpEvent.deleteMany({
        where: {
          userId,
          source: XpSource.GOAL,
          referenceId: updated.id
        }
      });
    }

    return updated;
  });
}

export async function getTodayPlanData(userId: string) {
  const { start, end } = getTodayRange();
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const recentStart = subDays(start, 30);

  const [missions, streak, goalsInProgress, latestWeeklyReview, latestJournalEntry, xpEvents, checkIns] = await Promise.all([
    getTodayMissions(userId),
    prisma.streak.findUnique({
      where: {
        userId_type: {
          userId,
          type: StreakType.DAILY
        }
      }
    }),
    prisma.goal.count({
      where: {
        userId,
        status: GoalStatus.ACTIVE
      }
    }),
    prisma.weeklyReview.findFirst({
      where: { userId },
      orderBy: { weekStart: "desc" }
    }),
    prisma.journalEntry.findFirst({
      where: { userId },
      orderBy: { date: "desc" }
    }),
    prisma.xpEvent.findMany({
      where: {
        userId,
        occurredAt: {
          gte: start,
          lte: end
        }
      }
    }),
    prisma.checkIn.findMany({
      where: {
        userId,
        date: {
          gte: recentStart,
          lte: end
        }
      },
      orderBy: { date: "asc" }
    })
  ]);

  const completedCount = missions.filter((mission) => mission.status === MissionStatus.COMPLETED).length;
  const totalCount = missions.length;
  const progressPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  const topMission =
    missions.find((mission) => mission.status !== MissionStatus.COMPLETED && mission.priority === MissionPriority.HIGH) ??
    missions.find((mission) => mission.status !== MissionStatus.COMPLETED) ??
    missions[0] ??
    null;
  const pendingMissions = missions.filter((mission) => mission.status !== MissionStatus.COMPLETED);
  const xpToday = xpEvents.reduce((sum, item) => sum + item.amount, 0);
  const reviewPending = !latestWeeklyReview || latestWeeklyReview.weekStart < weekStart;
  const missionDates = missions
    .map((mission) => mission.completedAt)
    .filter((value): value is Date => Boolean(value));
  const streakDates = [...checkIns.map((item) => item.date), ...missionDates];
  const currentStreak = streak?.currentValue ?? calculateStreak(streakDates, new Date());
  const bestStreak = streak?.bestValue ?? calculateBestStreak(streakDates);

  return {
    missions,
    completedCount,
    totalCount,
    progressPercent,
    topMission,
    pendingMissions,
    xpToday,
    currentStreak,
    bestStreak,
    goalsInProgress,
    reviewPending,
    latestJournalEntry: latestJournalEntry
      ? {
          id: latestJournalEntry.id,
          date: latestJournalEntry.date,
          tomorrowPriority: latestJournalEntry.tomorrowPriority,
          mood: latestJournalEntry.mood,
          isToday: isSameDay(latestJournalEntry.date, start)
        }
      : null
  };
}
