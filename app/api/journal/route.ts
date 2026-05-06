import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { journalEntrySchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await requireSession();
    const entries = await prisma.journalEntry.findMany({
      where: { userId: session.userId },
      orderBy: { date: "desc" }
    });
    return NextResponse.json(entries);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = journalEntrySchema.parse(await request.json());
    const entry = await prisma.journalEntry.upsert({
      where: {
        userId_date: {
          userId: session.userId,
          date: new Date(body.date)
        }
      },
      update: {
        score: body.score,
        mood: body.mood,
        content: body.content,
        win: body.win,
        challenge: body.challenge,
        tomorrowPriority: body.tomorrowPriority,
        gratitude: body.gratitude
      },
      create: {
        userId: session.userId,
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
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
