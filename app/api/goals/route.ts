import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { goalSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const period = searchParams.get("period") || undefined;

    const goals = await prisma.goal.findMany({
      where: {
        userId: session.userId,
        ...(category ? { category: category as never } : {}),
        ...(period ? { period: period as never } : {})
      },
      orderBy: [{ priority: "desc" }, { deadline: "asc" }]
    });

    return NextResponse.json(goals);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = goalSchema.parse(await request.json());
    const goal = await prisma.goal.create({
      data: {
        userId: session.userId,
        title: body.title,
        description: body.description,
        category: body.category,
        period: body.period,
        deadline: body.deadline ? new Date(body.deadline) : null,
        progress: body.progress,
        status: body.status,
        priority: body.priority
      }
    });
    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
