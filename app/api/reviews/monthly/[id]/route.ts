import { NextResponse } from "next/server";
import { startOfMonth } from "date-fns";
import { apiError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { monthlyReviewSchema } from "@/lib/validations";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const existing = await prisma.monthlyReview.findFirst({ where: { id, userId: session.userId } });
    if (!existing) {
      throw new Error("Review mensal não encontrada.");
    }

    const body = monthlyReviewSchema.parse(await request.json());
    const review = await prisma.monthlyReview.update({
      where: { id },
      data: {
        month: startOfMonth(new Date(body.month)),
        biggestGrowth: body.biggestGrowth,
        completedGoals: body.completedGoals,
        helpfulHabits: body.helpfulHabits,
        harmfulHabits: body.harmfulHabits,
        nextMonthFocus: body.nextMonthFocus
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
    const existing = await prisma.monthlyReview.findFirst({ where: { id, userId: session.userId } });
    if (!existing) {
      throw new Error("Review mensal não encontrada.");
    }

    await prisma.monthlyReview.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
