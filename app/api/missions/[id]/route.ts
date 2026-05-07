import { NextResponse } from "next/server";
import { MissionStatus, PillarKey, XpSource } from "@prisma/client";
import { apiError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { userMissionSchema } from "@/lib/validations";

async function resolvePillarId(pillarKey: PillarKey | null | undefined) {
  if (!pillarKey) {
    return null;
  }

  const pillar = await prisma.pillar.findUnique({ where: { key: pillarKey } });
  if (!pillar) {
    throw new Error("Pilar inválido.");
  }

  return pillar.id;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const existing = await prisma.userMission.findFirst({
      where: { id, userId: session.userId },
      include: {
        pillar: true
      }
    });

    if (!existing) {
      throw new Error("Missão não encontrada.");
    }

    const body = userMissionSchema.parse(await request.json());
    const pillarId = await resolvePillarId(body.pillar ?? null);
    const progress = body.status === MissionStatus.COMPLETED ? 100 : Math.min(body.progress, 99);
    const completedAt = body.status === MissionStatus.COMPLETED ? existing.completedAt ?? new Date() : null;

    const mission = await prisma.$transaction(async (tx) => {
      const updated = await tx.userMission.update({
        where: { id },
        data: {
          pillarId,
          title: body.title.trim(),
          description: body.description.trim(),
          category: body.category,
          status: body.status,
          priority: body.priority,
          xpReward: body.xpReward,
          progress,
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
          completedAt
        },
        include: {
          pillar: true,
          history: {
            orderBy: { createdAt: "desc" },
            take: 5
          }
        }
      });

      await tx.userMissionHistory.create({
        data: {
          userId: session.userId,
          userMissionId: updated.id,
          status: updated.status,
          progress: updated.progress,
          note: updated.status === MissionStatus.COMPLETED ? "Missão concluída." : "Missão atualizada."
        }
      });

      if (existing.status !== MissionStatus.COMPLETED && updated.status === MissionStatus.COMPLETED) {
        const alreadyAwarded = await tx.xpEvent.findFirst({
          where: {
            userId: session.userId,
            source: XpSource.GOAL,
            referenceId: updated.id
          }
        });

        if (!alreadyAwarded) {
          await tx.xpEvent.create({
            data: {
              userId: session.userId,
              amount: updated.xpReward,
              source: XpSource.GOAL,
              description: `Missão concluída: ${updated.title}`,
              referenceId: updated.id
            }
          });
        }
      }

      return updated;
    });

    return NextResponse.json(mission);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const existing = await prisma.userMission.findFirst({ where: { id, userId: session.userId } });

    if (!existing) {
      throw new Error("Missão não encontrada.");
    }

    await prisma.userMission.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
