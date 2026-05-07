import { NextResponse } from "next/server";
import { XpSource } from "@prisma/client";
import { startOfDay } from "date-fns";
import { apiError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { awardXp, unlockAchievement, updateDailyStreak } from "@/lib/progress";
import { prisma } from "@/lib/prisma";
import { checkInSchema } from "@/lib/validations";

function buildAiSummary(score: number, executedPriority: boolean) {
  if (executedPriority && score >= 8) {
    return "Você sustentou a prioridade principal. Repita a mesma estrutura amanhã.";
  }

  if (executedPriority) {
    return "A prioridade foi executada, mas ainda há atrito. Simplifique o primeiro passo de amanhã.";
  }

  return "Hoje ainda ficou aquém da prioridade central. Amanhã precisa começar pelo ponto de maior impacto.";
}

export async function GET() {
  try {
    const session = await requireSession();
    const checkIns = await prisma.checkIn.findMany({
      where: { userId: session.userId },
      orderBy: { date: "desc" }
    });

    return NextResponse.json(checkIns);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = checkInSchema.parse(await request.json());
    const date = startOfDay(new Date(body.date));

    const checkIn = await prisma.checkIn.upsert({
      where: {
        userId_date: {
          userId: session.userId,
          date
        }
      },
      update: {
        advanced: body.progressNote,
        failed: body.blocker,
        improveTomorrow: body.tomorrowPriority,
        executedPriority: body.executedPriority,
        progressNote: body.progressNote,
        blocker: body.blocker,
        tomorrowPriority: body.tomorrowPriority,
        gratitude: body.gratitude,
        energy: body.energy ?? body.score,
        mood: body.mood,
        dayScore: body.score,
        sleepHours: body.sleepHours ?? null,
        aiSummary: buildAiSummary(body.score, body.executedPriority)
      },
      create: {
        userId: session.userId,
        date,
        advanced: body.progressNote,
        failed: body.blocker,
        improveTomorrow: body.tomorrowPriority,
        executedPriority: body.executedPriority,
        progressNote: body.progressNote,
        blocker: body.blocker,
        tomorrowPriority: body.tomorrowPriority,
        gratitude: body.gratitude,
        energy: body.energy ?? body.score,
        mood: body.mood,
        dayScore: body.score,
        sleepHours: body.sleepHours ?? null,
        aiSummary: buildAiSummary(body.score, body.executedPriority)
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
      await awardXp(session.userId, 35, XpSource.NIGHT_CHECKIN, "Check-in diário concluído", checkIn.id);
    }

    const { current } = await updateDailyStreak(session.userId);
    if (current >= 1) {
      await unlockAchievement(session.userId, "first-checkin");
    }
    if (current >= 3) {
      await unlockAchievement(session.userId, "three-day-streak");
    }

    return NextResponse.json(checkIn, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
