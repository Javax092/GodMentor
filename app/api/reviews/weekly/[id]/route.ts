import { NextResponse } from "next/server";
import { startOfWeek } from "date-fns";
import { apiError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { weeklyReviewSchema } from "@/lib/validations";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const existing = await prisma.weeklyReview.findFirst({ where: { id, userId: session.userId } });
    if (!existing) {
      throw new Error("Review semanal não encontrada.");
    }

    const body = weeklyReviewSchema.parse(await request.json());
    const review = await prisma.weeklyReview.update({
      where: { id },
      data: {
        weekStart: startOfWeek(new Date(body.weekStart), { weekStartsOn: 1 }),
        worked: body.worked,
        didntWork: body.didntWork,
        lesson: body.lesson,
        obstacle: body.obstacle,
        nextFocus: body.nextFocus,
        wins: body.wins ?? null,
        failures: body.failures ?? null,
        patterns: body.patterns ?? null,
        score: body.score ?? null
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const existing = await prisma.weeklyReview.findFirst({ where: { id, userId: session.userId } });
    if (!existing) {
      throw new Error("Review semanal não encontrada.");
    }

    await prisma.weeklyReview.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
