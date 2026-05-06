import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { weeklyReviewSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await requireSession();
    const reviews = await prisma.weeklyReview.findMany({
      where: { userId: session.userId },
      orderBy: { weekStart: "desc" }
    });
    return NextResponse.json(reviews);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = weeklyReviewSchema.parse(await request.json());
    const review = await prisma.weeklyReview.upsert({
      where: {
        userId_weekStart: {
          userId: session.userId,
          weekStart: new Date(body.weekStart)
        }
      },
      update: {
        worked: body.worked,
        didntWork: body.didntWork,
        lesson: body.lesson,
        obstacle: body.obstacle,
        nextFocus: body.nextFocus
      },
      create: {
        userId: session.userId,
        weekStart: new Date(body.weekStart),
        worked: body.worked,
        didntWork: body.didntWork,
        lesson: body.lesson,
        obstacle: body.obstacle,
        nextFocus: body.nextFocus
      }
    });
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
