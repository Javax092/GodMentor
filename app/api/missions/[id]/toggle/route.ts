import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { apiError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { toggleTodayMission } from "@/lib/missions";

const toggleMissionSchema = z.object({
  id: z.string().min(1, "Informe a missão.")
});

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = toggleMissionSchema.parse(await params);
    const mission = await toggleTodayMission(session.userId, id);

    revalidatePath("/dashboard");
    revalidatePath("/missoes");

    return NextResponse.json({
      mission,
      message: mission.status === "COMPLETED" ? "Missão concluída." : "Conclusão desfeita."
    });
  } catch (error) {
    return apiError(error);
  }
}
