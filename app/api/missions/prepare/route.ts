import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { apiError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { getTodayMissions, prepareTodayMissions } from "@/lib/missions";

const prepareMissionSchema = z.object({}).passthrough();

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    await prepareMissionSchema.parseAsync(await request.json().catch(() => ({})));

    const result = await prepareTodayMissions(session.userId).catch(async (error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const missions = await getTodayMissions(session.userId);
        return { created: false, missions };
      }

      throw error;
    });

    revalidatePath("/dashboard");
    revalidatePath("/missoes");

    return NextResponse.json({
      created: result.created,
      missions: result.missions,
      message: result.created ? "Missões de hoje preparadas." : "As missões de hoje já estavam prontas."
    });
  } catch (error) {
    return apiError(error);
  }
}
