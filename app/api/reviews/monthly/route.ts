import { NextResponse } from "next/server";
import { startOfMonth } from "date-fns";
import { apiError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { monthlyReviewSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await requireSession();
    const reviews = await prisma.monthlyReview.findMany({
      where: { userId: session.userId },
      orderBy: { month: "desc" }
    });
    return NextResponse.json(reviews);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = monthlyReviewSchema.parse(await request.json());
    const month = startOfMonth(new Date(body.month));
    const review = await prisma.monthlyReview.upsert({
      where: {
        userId_month: {
          userId: session.userId,
          month
        }
      },
      update: {
        biggestGrowth: body.biggestGrowth,
        completedGoals: body.completedGoals,
        helpfulHabits: body.helpfulHabits,
        harmfulHabits: body.harmfulHabits,
        nextMonthFocus: body.nextMonthFocus
      },
      create: {
        userId: session.userId,
        month,
        biggestGrowth: body.biggestGrowth,
        completedGoals: body.completedGoals,
        helpfulHabits: body.helpfulHabits,
        harmfulHabits: body.harmfulHabits,
        nextMonthFocus: body.nextMonthFocus
      }
    });
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
