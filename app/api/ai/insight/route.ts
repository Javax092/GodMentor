import { NextResponse } from "next/server";
import { InsightType } from "@prisma/client";
import { apiError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { buildLocalInsight } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { getAiContext } from "@/lib/queries";

export async function POST() {
  try {
    const session = await requireSession();
    const context = await getAiContext(session.userId);
    const payload = buildLocalInsight(context, "insight");
    await prisma.aiInsight.create({
      data: {
        userId: session.userId,
        type: InsightType.DAILY,
        content: JSON.stringify(payload)
      }
    });
    return NextResponse.json(payload);
  } catch (error) {
    return apiError(error);
  }
}
