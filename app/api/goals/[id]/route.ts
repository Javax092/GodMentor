import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { goalSchema } from "@/lib/validations";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const existing = await prisma.goal.findFirst({ where: { id, userId: session.userId } });
    if (!existing) {
      throw new Error("Meta não encontrada.");
    }

    const raw = await request.json();
    const body = goalSchema.parse({
      ...raw,
      deadline: raw.deadline ? new Date(raw.deadline).toISOString().slice(0, 10) : null
    });

    const goal = await prisma.goal.update({
      where: { id },
      data: {
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
    return NextResponse.json(goal);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const existing = await prisma.goal.findFirst({ where: { id, userId: session.userId } });
    if (!existing) {
      throw new Error("Meta não encontrada.");
    }
    await prisma.goal.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
