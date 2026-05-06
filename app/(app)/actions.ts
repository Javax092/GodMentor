"use server";

import { MissionStatus, PillarKey, StreakType, XpSource } from "@prisma/client";
import { endOfDay, startOfDay, startOfWeek } from "date-fns";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { achievementCatalog, pillarCatalog } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { calculateBestStreak, calculateStreak } from "@/lib/utils";
import { ensureDefaultGoals, ensureSystemCatalog } from "@/lib/system";

const trackedPaths = ["/dashboard", "/missoes", "/foco", "/diario", "/evolucao", "/ia", "/ranking", "/metas", "/review"];

async function refreshApp() {
  trackedPaths.forEach((path) => revalidatePath(path));
}

async function awardXp(userId: string, amount: number, source: XpSource, description: string, referenceId?: string) {
  if (amount <= 0) {
    return;
  }

  await prisma.xpEvent.create({
    data: {
      userId,
      amount,
      source,
      description,
      referenceId
    }
  });
}

async function updateStreak(userId: string) {
  const checkIns = await prisma.checkIn.findMany({
    where: { userId },
    select: { date: true },
    orderBy: { date: "asc" }
  });
  const dates = checkIns.map((item) => item.date);
  const current = calculateStreak(dates, new Date());
  const best = calculateBestStreak(dates);

  await prisma.streak.upsert({
    where: { userId_type: { userId, type: StreakType.DAILY } },
    update: {
      currentValue: current,
      bestValue: best,
      lastActiveAt: startOfDay(new Date())
    },
    create: {
      userId,
      type: StreakType.DAILY,
      currentValue: current,
      bestValue: best,
      lastActiveAt: startOfDay(new Date())
    }
  });

  return { current, best };
}

async function unlockAchievement(userId: string, key: string) {
  const achievement = await prisma.achievement.findUnique({ where: { key } });
  if (!achievement) {
    return;
  }

  const existing = await prisma.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId: achievement.id } }
  });

  if (existing) {
    return;
  }

  await prisma.userAchievement.create({
    data: {
      userId,
      achievementId: achievement.id
    }
  });

  if (achievement.xpBonus > 0) {
    await awardXp(userId, achievement.xpBonus, XpSource.GOAL, `Conquista desbloqueada: ${achievement.title}`, achievement.id);
  }
}

export async function completeMissionAction(formData: FormData) {
  const session = await requireSession();
  await ensureSystemCatalog();
  await ensureDefaultGoals(session.userId);

  const missionId = String(formData.get("missionId") ?? "");
  if (!missionId) {
    return;
  }

  const mission = await prisma.mission.findUnique({ where: { id: missionId }, include: { pillar: true } });
  if (!mission) {
    return;
  }

  const today = startOfDay(new Date());
  const dailyMission = await prisma.dailyMission.upsert({
    where: {
      userId_missionId_date: {
        userId: session.userId,
        missionId,
        date: today
      }
    },
    update: {
      pillarId: mission.pillarId,
      status: MissionStatus.COMPLETED,
      progress: 100,
      xpEarned: mission.xpReward,
      completedAt: new Date()
    },
    create: {
      userId: session.userId,
      pillarId: mission.pillarId,
      missionId,
      date: today,
      status: MissionStatus.COMPLETED,
      progress: 100,
      xpEarned: mission.xpReward,
      completedAt: new Date()
    }
  });

  const alreadyAwarded = await prisma.xpEvent.findFirst({
    where: {
      userId: session.userId,
      source: XpSource.CHALLENGE,
      referenceId: dailyMission.id
    }
  });

  if (!alreadyAwarded) {
    await awardXp(session.userId, mission.xpReward, XpSource.CHALLENGE, mission.title, dailyMission.id);
  }

  const completedToday = await prisma.dailyMission.count({
    where: {
      userId: session.userId,
      date: today,
      status: MissionStatus.COMPLETED
    }
  });

  if (completedToday >= 7) {
    await unlockAchievement(session.userId, "all-pillars");
  }

  await refreshApp();
}

export async function saveCheckInAction(formData: FormData) {
  const session = await requireSession();
  await ensureSystemCatalog();

  const date = startOfDay(new Date());
  const advanced = String(formData.get("advanced") ?? "");
  const failed = String(formData.get("failed") ?? "");
  const improveTomorrow = String(formData.get("improveTomorrow") ?? "");
  const mood = String(formData.get("mood") ?? "Equilibrado");
  const energy = Number(formData.get("energy") ?? 7);
  const dayScore = Number(formData.get("dayScore") ?? 7);
  const sleepHoursRaw = formData.get("sleepHours");
  const sleepHours = sleepHoursRaw ? Number(sleepHoursRaw) : null;

  const checkIn = await prisma.checkIn.upsert({
    where: { userId_date: { userId: session.userId, date } },
    update: {
      advanced,
      failed,
      improveTomorrow,
      mood,
      energy,
      dayScore,
      sleepHours,
      aiSummary:
        energy >= 8
          ? "Seu sistema respondeu bem hoje. Preserve a clareza do fechamento."
          : "Feche o dia sem culpa, mas com uma única correção objetiva para amanhã."
    },
    create: {
      userId: session.userId,
      date,
      advanced,
      failed,
      improveTomorrow,
      mood,
      energy,
      dayScore,
      sleepHours,
      aiSummary:
        energy >= 8
          ? "Seu sistema respondeu bem hoje. Preserve a clareza do fechamento."
          : "Feche o dia sem culpa, mas com uma única correção objetiva para amanhã."
    }
  });

  const existingXp = await prisma.xpEvent.findFirst({
    where: {
      userId: session.userId,
      source: XpSource.NIGHT_CHECKIN,
      referenceId: checkIn.id
    }
  });

  if (!existingXp) {
    await awardXp(session.userId, 35, XpSource.NIGHT_CHECKIN, "Check-in noturno concluído", checkIn.id);
  }

  const { current } = await updateStreak(session.userId);
  if (current >= 1) {
    await unlockAchievement(session.userId, "first-checkin");
  }
  if (current >= 3) {
    await unlockAchievement(session.userId, "three-day-streak");
  }

  await refreshApp();
}

export async function saveWeeklyReviewAction(formData: FormData) {
  const session = await requireSession();
  await ensureSystemCatalog();

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const worked = String(formData.get("worked") ?? "");
  const didntWork = String(formData.get("didntWork") ?? "");
  const lesson = String(formData.get("lesson") ?? "");
  const obstacle = String(formData.get("obstacle") ?? "");
  const nextFocus = String(formData.get("nextFocus") ?? "");
  const wins = String(formData.get("wins") ?? "");
  const failures = String(formData.get("failures") ?? "");
  const patterns = String(formData.get("patterns") ?? "");

  const review = await prisma.weeklyReview.upsert({
    where: { userId_weekStart: { userId: session.userId, weekStart } },
    update: {
      worked,
      didntWork,
      lesson,
      obstacle,
      nextFocus,
      wins,
      failures,
      patterns,
      aiSummary: "Sua próxima semana precisa preservar o que já funciona e remover um único gargalo central."
    },
    create: {
      userId: session.userId,
      weekStart,
      worked,
      didntWork,
      lesson,
      obstacle,
      nextFocus,
      wins,
      failures,
      patterns,
      aiSummary: "Sua próxima semana precisa preservar o que já funciona e remover um único gargalo central."
    }
  });

  const existingXp = await prisma.xpEvent.findFirst({
    where: { userId: session.userId, source: XpSource.WEEKLY_REVIEW, referenceId: review.id }
  });
  if (!existingXp) {
    await awardXp(session.userId, 90, XpSource.WEEKLY_REVIEW, "Review semanal concluída", review.id);
  }

  await unlockAchievement(session.userId, "weekly-review");
  await refreshApp();
}

export async function saveFocusSessionAction(formData: FormData) {
  const session = await requireSession();
  await ensureSystemCatalog();

  const durationMinutes = Math.max(1, Number(formData.get("durationMinutes") ?? 0));
  const category = String(formData.get("category") ?? "Deep work");
  const notes = String(formData.get("notes") ?? "");
  const xpEarned = Math.min(120, Math.max(20, Math.round(durationMinutes * 1.5)));

  const focusSession = await prisma.focusSession.create({
    data: {
      userId: session.userId,
      startedAt: new Date(Date.now() - durationMinutes * 60000),
      endedAt: new Date(),
      durationMinutes,
      category,
      notes,
      xpEarned,
      isCompleted: true
    }
  });

  await awardXp(session.userId, xpEarned, XpSource.FOCUS, `${category} por ${durationMinutes} min`, focusSession.id);

  if (category.toLowerCase().includes("estudo")) {
    await awardXp(session.userId, 25, XpSource.STUDY, "Sessão de estudo registrada", focusSession.id);
  }

  if (category.toLowerCase().includes("treino")) {
    await awardXp(session.userId, 25, XpSource.TRAINING, "Treino registrado", focusSession.id);
  }

  await refreshApp();
}

export async function seedUserWorkspaceAction() {
  const session = await requireSession();
  await ensureSystemCatalog();
  await ensureDefaultGoals(session.userId);

  const missions = await prisma.mission.findMany({ include: { pillar: true } });
  const today = startOfDay(new Date());

  await Promise.all(
    missions.map((mission) =>
      prisma.dailyMission.upsert({
        where: {
          userId_missionId_date: {
            userId: session.userId,
            missionId: mission.id,
            date: today
          }
        },
        update: {},
        create: {
          userId: session.userId,
          missionId: mission.id,
          pillarId: mission.pillarId,
          date: today,
          status: MissionStatus.PENDING,
          progress: 0
        }
      })
    )
  );

  const hasInsight = await prisma.aiInsight.count({ where: { userId: session.userId, createdAt: { gte: startOfDay(new Date()) } } });
  if (!hasInsight) {
    await prisma.aiInsight.createMany({
      data: [
        {
          userId: session.userId,
          type: "DAILY_SUMMARY",
          title: "Resumo diário",
          content: "Hoje sua execução pede um bloco de foco antes que o restante do dia capture sua atenção.",
          strength: 73
        },
        {
          userId: session.userId,
          type: "POSITIVE_PRESSURE",
          title: "Pressão positiva",
          content: "Se você fechar os pilares de execução e reflexão hoje, amanhã começa mais leve.",
          strength: 68
        }
      ]
    });
  }

  const unlockedCount = await prisma.userAchievement.count({ where: { userId: session.userId } });
  if (!unlockedCount) {
    const firstAchievement = achievementCatalog[0];
    if (firstAchievement) {
      await unlockAchievement(session.userId, firstAchievement.key);
    }
  }

  const streakCheck = await prisma.checkIn.count({
    where: {
      userId: session.userId,
      date: {
        gte: startOfDay(new Date(Date.now() - 3 * 86400000)),
        lte: endOfDay(new Date())
      }
    }
  });

  if (!streakCheck) {
    for (let offset = 2; offset >= 0; offset -= 1) {
      const date = startOfDay(new Date(Date.now() - offset * 86400000));
      await prisma.checkIn.upsert({
        where: { userId_date: { userId: session.userId, date } },
        update: {},
        create: {
          userId: session.userId,
          date,
          advanced: "Cumpri o bloco principal e mantive o foco sob controle.",
          failed: "Abri distrações desnecessárias no meio da tarde.",
          improveTomorrow: "Proteger a primeira hora do dia antes de responder o mundo.",
          energy: 7 + (offset % 2),
          mood: "Focado",
          dayScore: 7 + (offset % 2),
          sleepHours: 7.2
        }
      });
    }
    await updateStreak(session.userId);
  }

  await refreshApp();
}

export async function trackExtraXpAction(formData: FormData) {
  const session = await requireSession();
  const source = String(formData.get("source") ?? XpSource.CONTENT) as XpSource;
  const amount = Number(formData.get("amount") ?? 25);
  const description = String(formData.get("description") ?? "XP manual registrada");

  await awardXp(session.userId, amount, source, description);
  await refreshApp();
}

export async function toggleMissionProgressAction(formData: FormData) {
  const session = await requireSession();
  const dailyMissionId = String(formData.get("dailyMissionId") ?? "");
  const progress = Math.min(95, Math.max(15, Number(formData.get("progress") ?? 50)));
  if (!dailyMissionId) {
    return;
  }

  await prisma.dailyMission.update({
    where: { id: dailyMissionId },
    data: {
      userId: session.userId,
      progress,
      status: MissionStatus.IN_PROGRESS
    }
  });

  await refreshApp();
}

export async function getPillarByKey(key: PillarKey) {
  return prisma.pillar.findUnique({ where: { key } });
}
