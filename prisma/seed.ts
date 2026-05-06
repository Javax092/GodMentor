import { MissionStatus, PrismaClient, SubscriptionTier, XpSource } from "@prisma/client";
import bcrypt from "bcryptjs";
import { subDays } from "date-fns";
import { ensureDefaultGoals, ensureSystemCatalog, seedStarterEvents } from "@/lib/system";

const prisma = new PrismaClient();

async function main() {
  await ensureSystemCatalog();

  const email = "demo@evolua.ai";
  const passwordHash = await bcrypt.hash("12345678", 10);
  const plan = await prisma.subscriptionPlan.findUnique({ where: { tier: SubscriptionTier.PRO } });

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      subscriptionTier: SubscriptionTier.PRO,
      subscriptionPlanId: plan?.id
    },
    create: {
      name: "Usuário Demo",
      email,
      passwordHash,
      subscriptionTier: SubscriptionTier.PRO,
      subscriptionPlanId: plan?.id
    }
  });

  await ensureDefaultGoals(user.id);
  await seedStarterEvents(user.id);

  const missions = await prisma.mission.findMany();
  for (const [index, mission] of missions.entries()) {
    await prisma.dailyMission.upsert({
      where: {
        userId_missionId_date: {
          userId: user.id,
          missionId: mission.id,
          date: subDays(new Date(), 0)
        }
      },
      update: {},
      create: {
        userId: user.id,
        missionId: mission.id,
        pillarId: mission.pillarId,
        date: subDays(new Date(), 0),
        status: index < 5 ? MissionStatus.COMPLETED : MissionStatus.PENDING,
        progress: index < 5 ? 100 : 35,
        xpEarned: index < 5 ? mission.xpReward : 0
      }
    });
  }

  for (let offset = 0; offset < 5; offset += 1) {
    const date = subDays(new Date(), offset);
    await prisma.checkIn.upsert({
      where: { userId_date: { userId: user.id, date } },
      update: {},
      create: {
        userId: user.id,
        date,
        advanced: "Fechei a frente principal e mantive o sistema leve.",
        failed: "Perdi tempo com distrações no meio da tarde.",
        improveTomorrow: "Proteger a manhã e encerrar o dia com revisão simples.",
        energy: 7 + (offset % 2),
        mood: "Focado",
        dayScore: 7 + (offset % 2),
        sleepHours: 7.5,
        aiSummary: "Seu foco responde melhor quando você protege a primeira metade do dia."
      }
    });
  }

  await prisma.focusSession.createMany({
    data: [
      {
        userId: user.id,
        startedAt: subDays(new Date(), 0),
        endedAt: new Date(),
        durationMinutes: 50,
        category: "Deep work",
        xpEarned: 75,
        isCompleted: true
      },
      {
        userId: user.id,
        startedAt: subDays(new Date(), 1),
        endedAt: subDays(new Date(), 1),
        durationMinutes: 40,
        category: "Estudo",
        xpEarned: 60,
        isCompleted: true
      }
    ],
    skipDuplicates: true
  });

  await prisma.xpEvent.createMany({
    data: [
      {
        userId: user.id,
        amount: 55,
        source: XpSource.CONTENT,
        description: "Post publicado"
      },
      {
        userId: user.id,
        amount: 35,
        source: XpSource.NIGHT_CHECKIN,
        description: "Check-in noturno"
      }
    ],
    skipDuplicates: true
  });

  await prisma.aiInsight.createMany({
    data: [
      {
        userId: user.id,
        type: "PATTERN",
        title: "Padrão identificado",
        content: "Seu melhor horário de produtividade é entre 8h e 11h.",
        strength: 82
      },
      {
        userId: user.id,
        type: "ALERT",
        title: "Alerta",
        content: "Hoje sua execução caiu 23% após as 15h.",
        strength: 74
      }
    ],
    skipDuplicates: true
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
