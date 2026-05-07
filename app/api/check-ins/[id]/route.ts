import { NextResponse } from "next/server";
import { startOfDay } from "date-fns";
import { apiError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const existing = await prisma.checkIn.findFirst({ where: { id, userId: session.userId } });

    if (!existing) {
      throw new Error("Check-in não encontrado.");
    }

    const body = checkInSchema.parse(await request.json());
    const checkIn = await prisma.checkIn.update({
      where: { id },
      data: {
        date: startOfDay(new Date(body.date)),
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

    return NextResponse.json(checkIn);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const existing = await prisma.checkIn.findFirst({ where: { id, userId: session.userId } });

    if (!existing) {
      throw new Error("Check-in não encontrado.");
    }

    await prisma.checkIn.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
