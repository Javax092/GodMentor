import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { journalEntrySchema } from "@/lib/validations";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const body = journalEntrySchema.parse(await request.json());
    const existing = await prisma.journalEntry.findFirst({ where: { id, userId: session.userId } });
    if (!existing) {
      throw new Error("Registro não encontrado.");
    }

    const entry = await prisma.journalEntry.update({
      where: { id },
      data: {
        date: new Date(body.date),
        score: body.score,
        mood: body.mood,
        content: body.content,
        win: body.win,
        challenge: body.challenge,
        tomorrowPriority: body.tomorrowPriority,
        gratitude: body.gratitude
      }
    });
    return NextResponse.json(entry);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const existing = await prisma.journalEntry.findFirst({ where: { id, userId: session.userId } });
    if (!existing) {
      throw new Error("Registro não encontrado.");
    }
    await prisma.journalEntry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
