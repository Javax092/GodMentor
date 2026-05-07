import { GoalCategory, GoalPeriod, GoalPriority, GoalStatus, MissionPriority, MissionStatus, PillarKey } from "@prisma/client";
import { z } from "zod";

export const missionCategorySchema = z.enum(["estudo", "treino", "vendas", "conteudo", "saude", "foco", "pessoal"]);

export const registerSchema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  email: z.string().email("Email inválido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres.")
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(8, "Senha inválida.")
});

export const journalEntrySchema = z.object({
  date: z.string().min(1, "Informe a data."),
  score: z.coerce.number().int().min(1).max(10),
  mood: z.string().min(2),
  content: z.string().min(10),
  win: z.string().min(3),
  challenge: z.string().min(3),
  tomorrowPriority: z.string().min(3),
  gratitude: z.string().min(3)
});

export const goalSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.nativeEnum(GoalCategory),
  period: z.nativeEnum(GoalPeriod),
  deadline: z.string().optional().nullable(),
  progress: z.coerce.number().int().min(0).max(100),
  status: z.nativeEnum(GoalStatus),
  priority: z.nativeEnum(GoalPriority)
});

export const userMissionSchema = z.object({
  title: z.string().min(3, "Informe o título da missão."),
  description: z.string().min(10, "Descreva a missão com mais clareza."),
  category: missionCategorySchema.default("pessoal"),
  pillar: z.nativeEnum(PillarKey).optional().nullable(),
  status: z.nativeEnum(MissionStatus),
  priority: z.nativeEnum(MissionPriority),
  xpReward: z.coerce.number().int().min(0).max(500),
  progress: z.coerce.number().int().min(0).max(100),
  dueDate: z.string().optional().nullable()
});

export const checkInSchema = z.object({
  date: z.string().min(1, "Informe a data."),
  score: z.coerce.number().int().min(1).max(10),
  mood: z.string().min(2, "Informe o humor."),
  executedPriority: z.coerce.boolean(),
  progressNote: z.string().min(3, "Descreva o avanço principal."),
  blocker: z.string().min(3, "Descreva o bloqueio."),
  tomorrowPriority: z.string().min(3, "Defina a prioridade de amanhã."),
  gratitude: z.string().min(3, "Registre uma gratidão."),
  energy: z.coerce.number().int().min(1).max(10).optional(),
  sleepHours: z.coerce.number().min(0).max(24).optional().nullable()
});

export const weeklyReviewSchema = z.object({
  weekStart: z.string().min(1),
  worked: z.string().min(10),
  didntWork: z.string().min(10),
  lesson: z.string().min(10),
  obstacle: z.string().min(10),
  nextFocus: z.string().min(10),
  wins: z.string().optional().nullable(),
  failures: z.string().optional().nullable(),
  patterns: z.string().optional().nullable(),
  score: z.coerce.number().int().min(0).max(10).optional().nullable()
});

export const monthlyReviewSchema = z.object({
  month: z.string().min(1),
  biggestGrowth: z.string().min(10),
  completedGoals: z.string().min(10),
  helpfulHabits: z.string().min(10),
  harmfulHabits: z.string().min(10),
  nextMonthFocus: z.string().min(10)
});
