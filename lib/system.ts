import { GoalPeriod, GoalPriority, GoalStatus, Prisma, SubscriptionTier, XpSource } from "@prisma/client";
import { achievementCatalog, levelConfig, pillarCatalog, planConfig } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export async function ensureSystemCatalog() {
  await Promise.all(
    (Object.entries(planConfig) as Array<[SubscriptionTier, (typeof planConfig)[SubscriptionTier]]>).map(([tier, plan]) =>
      prisma.subscriptionPlan.upsert({
        where: { tier },
        update: plan,
        create: { tier, ...plan }
      })
    )
  );

  const pillarRecords = await Promise.all(
    pillarCatalog.map((pillar, index) =>
      prisma.pillar.upsert({
        where: { key: pillar.key },
        update: {
          name: pillar.name,
          description: pillar.description,
          icon: pillar.icon,
          color: pillar.color,
          order: index + 1
        },
        create: {
          key: pillar.key,
          name: pillar.name,
          description: pillar.description,
          icon: pillar.icon,
          color: pillar.color,
          order: index + 1
        }
      })
    )
  );

  await Promise.all(
    pillarCatalog.map((pillar) => {
      const pillarRecord = pillarRecords.find((item) => item.key === pillar.key);
      if (!pillarRecord) {
        return Promise.resolve();
      }

      return prisma.mission.upsert({
        where: { slug: pillar.key.toLowerCase().replace(/_/g, "-") },
        update: {
          pillarId: pillarRecord.id,
          title: pillar.missionTitle,
          description: pillar.missionDescription,
          xpReward: pillar.xpReward,
          isActive: true,
          order: pillarRecord.order
        },
        create: {
          pillarId: pillarRecord.id,
          slug: pillar.key.toLowerCase().replace(/_/g, "-"),
          title: pillar.missionTitle,
          description: pillar.missionDescription,
          xpReward: pillar.xpReward,
          isActive: true,
          order: pillarRecord.order
        }
      });
    })
  );

  await Promise.all(
    levelConfig.map((level) =>
      prisma.level.upsert({
        where: { rank: level.rank },
        update: { name: level.name, minXp: level.minXp },
        create: level
      })
    )
  );

  await Promise.all(
    achievementCatalog.map((achievement) =>
      prisma.achievement.upsert({
        where: { key: achievement.key },
        update: {
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          xpBonus: achievement.xpBonus,
          requirement: achievement.requirement
        },
        create: achievement
      })
    )
  );
}

export async function ensureDefaultGoals(userId: string) {
  const goalsCount = await prisma.goal.count({ where: { userId } });
  if (goalsCount > 0) {
    return;
  }

  const executionPillar = await prisma.pillar.findUnique({ where: { key: "EXECUTION" } });
  const bodyPillar = await prisma.pillar.findUnique({ where: { key: "BODY" } });

  const goals: Prisma.GoalCreateManyInput[] = [
    {
      userId,
      pillarId: executionPillar?.id,
      title: "Fechar entrega principal da semana",
      description: "Remover o maior gargalo e concluir a frente com maior impacto.",
      category: "PROFESSIONAL",
      period: GoalPeriod.WEEKLY,
      progress: 42,
      status: GoalStatus.ACTIVE,
      priority: GoalPriority.HIGH
    },
    {
      userId,
      pillarId: bodyPillar?.id,
      title: "Treinar 4x com sono acima de 7h",
      description: "Sustentar energia e recuperação para manter constância.",
      category: "HEALTH",
      period: GoalPeriod.WEEKLY,
      progress: 50,
      status: GoalStatus.ACTIVE,
      priority: GoalPriority.MEDIUM
    }
  ];

  await prisma.goal.createMany({ data: goals });
}

export async function seedStarterEvents(userId: string) {
  const count = await prisma.xpEvent.count({ where: { userId } });
  if (count > 0) {
    return;
  }

  await prisma.xpEvent.createMany({
    data: [
      {
        userId,
        amount: 80,
        source: XpSource.FOCUS,
        description: "Sessão de foco inicial"
      },
      {
        userId,
        amount: 60,
        source: XpSource.CHALLENGE,
        description: "Primeira missão concluída"
      }
    ]
  });
}
