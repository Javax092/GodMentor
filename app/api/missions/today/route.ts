import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { getTodayMissions } from "@/lib/missions";

export async function GET() {
  try {
    const session = await requireSession();
    const missions = await getTodayMissions(session.userId);
    return NextResponse.json({ missions });
  } catch (error) {
    return apiError(error);
  }
}
