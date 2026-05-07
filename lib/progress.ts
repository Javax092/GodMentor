import { StreakType, XpSource } from "@prisma/client";
import { startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { calculateBestStreak, calculateStreak } from "@/lib/utils";

export async function awardXp(userId: string, amount: number, source: XpSource, description: string, referenceId?: string) {
  if (amount <= 0) {
    return null;
  }

  return prisma.xpEvent.create({
    data: {
      userId,
      amount,
      source,
      description,
      referenceId
    }
  });
}

export async function updateDailyStreak(userId: string) {
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

export async function unlockAchievement(userId: string, key: string) {
  const achievement = await prisma.achievement.findUnique({ where: { key } });
  if (!achievement) {
    return null;
  }

  const existing = await prisma.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId: achievement.id } }
  });

  if (existing) {
    return existing;
  }

  const userAchievement = await prisma.userAchievement.create({
    data: {
      userId,
      achievementId: achievement.id
    }
  });

  if (achievement.xpBonus > 0) {
    await awardXp(userId, achievement.xpBonus, XpSource.GOAL, `Conquista desbloqueada: ${achievement.title}`, achievement.id);
  }

  return userAchievement;
}
