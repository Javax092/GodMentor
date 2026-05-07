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

function buildMissionPayload(input: {
  title: string;
  description: string;
  status: MissionStatus;
  progress: number;
  xpReward: number;
  dueDate?: string | null;
}) {
  const progress = input.status === MissionStatus.COMPLETED ? 100 : Math.min(input.progress, 99);

  return {
    title: input.title.trim(),
    description: input.description.trim(),
    status: input.status,
    progress,
    xpReward: input.xpReward,
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
    completedAt: input.status === MissionStatus.COMPLETED ? new Date() : null
  };
}

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const pillar = searchParams.get("pillar");
    const priority = searchParams.get("priority");

    const missions = await prisma.userMission.findMany({
      where: {
        userId: session.userId,
        ...(status ? { status: status as MissionStatus } : {}),
        ...(priority ? { priority: priority as never } : {}),
        ...(pillar ? { pillar: { key: pillar as PillarKey } } : {})
      },
      include: {
        pillar: true,
        history: {
          orderBy: { createdAt: "desc" },
          take: 5
        }
      },
      orderBy: [{ status: "asc" }, { priority: "desc" }, { dueDate: "asc" }, { createdAt: "desc" }]
    });

    return NextResponse.json(missions);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = userMissionSchema.parse(await request.json());
    const pillarId = await resolvePillarId(body.pillar ?? null);
    const payload = buildMissionPayload(body);

    const mission = await prisma.$transaction(async (tx) => {
      const created = await tx.userMission.create({
        data: {
          userId: session.userId,
          pillarId,
          title: payload.title,
          description: payload.description,
          category: body.category,
          status: payload.status,
          priority: body.priority,
          xpReward: payload.xpReward,
          progress: payload.progress,
          dueDate: payload.dueDate,
          completedAt: payload.completedAt
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
          userMissionId: created.id,
          status: created.status,
          progress: created.progress,
          note: "Missão criada."
        }
      });

      if (created.status === MissionStatus.COMPLETED) {
        await tx.xpEvent.create({
          data: {
            userId: session.userId,
            amount: created.xpReward,
            source: XpSource.GOAL,
            description: `Missão concluída: ${created.title}`,
            referenceId: created.id
          }
        });
      }

      return created;
    });

    return NextResponse.json(mission, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
