import { Activity, BarChart3, BookOpen, BrainCircuit, Dumbbell, Flame, Focus, Gem, LayoutDashboard, MoonStar, Radar, ScrollText, Sparkles, Swords, Target, Trophy, Users, Zap } from "lucide-react";

type GoalCategoryKey = "PERSONAL" | "PROFESSIONAL" | "HEALTH" | "STUDIES" | "FINANCIAL" | "RELATIONSHIPS";
type PillarKeyValue =
  | "EXECUTION"
  | "SALES_NETWORKING"
  | "BODY"
  | "LEARNING"
  | "REPUTATION"
  | "DISCIPLINE"
  | "REFLECTION";
type SubscriptionTierKey = "FREE" | "PRO" | "ELITE";
type MissionStatusKey = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";
type MissionPriorityKey = "LOW" | "MEDIUM" | "HIGH";
type DailyMissionCategoryKey = "estudo" | "treino" | "vendas" | "conteudo" | "saude" | "foco" | "pessoal";

export const APP_NAME = "Evolua AI";
export const AUTH_COOKIE = "evolua_token";

export const appNavItems = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Hoje", icon: LayoutDashboard },
  { href: "/missoes", label: "Missões", shortLabel: "Missões", icon: Target },
  { href: "/foco", label: "Foco", shortLabel: "Foco", icon: Focus },
  { href: "/diario", label: "Diário", shortLabel: "Diário", icon: ScrollText },
  { href: "/evolucao", label: "Evolução", shortLabel: "Evolução", icon: BarChart3 },
  { href: "/ia", label: "Mentor IA", shortLabel: "IA", icon: BrainCircuit },
  { href: "/ranking", label: "Ranking", shortLabel: "Ranking", icon: Trophy },
  { href: "/metas", label: "Metas", shortLabel: "Metas", icon: Radar },
  { href: "/review", label: "Review", shortLabel: "Review", icon: Sparkles }
] as const;

export const goalCategoryLabels = {
  PERSONAL: "Pessoal",
  PROFESSIONAL: "Profissional",
  HEALTH: "Saúde",
  STUDIES: "Estudos",
  FINANCIAL: "Financeiro",
  RELATIONSHIPS: "Relacionamentos"
} as const satisfies Record<GoalCategoryKey, string>;

export const goalStatusLabels = {
  ACTIVE: "Ativa",
  COMPLETED: "Concluída",
  PAUSED: "Pausada",
  CANCELLED: "Cancelada"
} as const;

export const goalPriorityLabels = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta"
} as const;

export const goalPeriodLabels = {
  DAILY: "Diária",
  WEEKLY: "Semanal",
  MONTHLY: "Mensal"
} as const;

export const missionStatusLabels = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em progresso",
  COMPLETED: "Concluída",
  SKIPPED: "Ignorada"
} as const satisfies Record<MissionStatusKey, string>;

export const missionPriorityLabels = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta"
} as const satisfies Record<MissionPriorityKey, string>;

export const dailyMissionCategoryLabels = {
  estudo: "Estudo",
  treino: "Treino",
  vendas: "Vendas",
  conteudo: "Conteúdo",
  saude: "Saúde",
  foco: "Foco",
  pessoal: "Pessoal"
} as const satisfies Record<DailyMissionCategoryKey, string>;

export const moodOptions = ["Inspirado", "Focado", "Equilibrado", "Cansado", "Ansioso", "Grato"] as const;

export const levelConfig = [
  { rank: 1, name: "Iniciante", minXp: 0 },
  { rank: 2, name: "Operador", minXp: 250 },
  { rank: 3, name: "Executor", minXp: 650 },
  { rank: 4, name: "Disciplinado", minXp: 1300 },
  { rank: 5, name: "Estratégico", minXp: 2200 },
  { rank: 6, name: "Elite", minXp: 3400 }
] as const;

export const planConfig = {
  FREE: {
    name: "Free",
    description: "3 pilares, check-in básico e visão limitada.",
    pillarsLimit: 3,
    dashboardLimit: 4,
    hasFullAiMentor: false,
    hasAdvancedAnalytics: false,
    hasAdvancedGoals: false,
    hasVoiceAi: false,
    hasAutomation: false,
    hasPremiumReports: false
  },
  PRO: {
    name: "Pro",
    description: "IA completa, analytics e histórico total.",
    pillarsLimit: 7,
    dashboardLimit: null,
    hasFullAiMentor: true,
    hasAdvancedAnalytics: true,
    hasAdvancedGoals: true,
    hasVoiceAi: false,
    hasAutomation: false,
    hasPremiumReports: true
  },
  ELITE: {
    name: "Elite",
    description: "Voz IA, automações e relatórios premium.",
    pillarsLimit: 7,
    dashboardLimit: null,
    hasFullAiMentor: true,
    hasAdvancedAnalytics: true,
    hasAdvancedGoals: true,
    hasVoiceAi: true,
    hasAutomation: true,
    hasPremiumReports: true
  }
} as const satisfies Record<
  SubscriptionTierKey,
  {
    name: string;
    description: string;
    pillarsLimit: number | null;
    dashboardLimit: number | null;
    hasFullAiMentor: boolean;
    hasAdvancedAnalytics: boolean;
    hasAdvancedGoals: boolean;
    hasVoiceAi: boolean;
    hasAutomation: boolean;
    hasPremiumReports: boolean;
  }
>;

export const pillarCatalog = [
  {
    key: "EXECUTION" as PillarKeyValue,
    name: "Execução",
    description: "Deep work, tarefas importantes e produtividade real.",
    icon: "Zap",
    color: "from-cyan-400/25 via-sky-500/18 to-transparent",
    missionTitle: "Bloco de deep work",
    missionDescription: "Conclua seu bloco mais importante sem distrações.",
    xpReward: 60,
    category: "PROFESSIONAL" as GoalCategoryKey,
    metricLabel: "Entrega"
  },
  {
    key: "SALES_NETWORKING" as PillarKeyValue,
    name: "Vendas / Networking",
    description: "Contatos, follow-ups e conversas que geram oportunidade.",
    icon: "Users",
    color: "from-fuchsia-400/22 via-rose-500/16 to-transparent",
    missionTitle: "Contato de avanço",
    missionDescription: "Envie follow-ups ou abra uma conversa comercial.",
    xpReward: 55,
    category: "FINANCIAL" as GoalCategoryKey,
    metricLabel: "Pipeline"
  },
  {
    key: "BODY" as PillarKeyValue,
    name: "Corpo",
    description: "Treino, sono, energia e água para sustentar performance.",
    icon: "Dumbbell",
    color: "from-emerald-400/24 via-teal-500/14 to-transparent",
    missionTitle: "Mover o corpo",
    missionDescription: "Treine, caminhe ou feche sua meta física do dia.",
    xpReward: 50,
    category: "HEALTH" as GoalCategoryKey,
    metricLabel: "Energia"
  },
  {
    key: "LEARNING" as PillarKeyValue,
    name: "Aprendizado",
    description: "Estudo, leitura e prática com retenção.",
    icon: "BookOpen",
    color: "from-amber-300/24 via-orange-500/16 to-transparent",
    missionTitle: "Sessão de estudo",
    missionDescription: "Estude algo que aumenta sua vantagem competitiva.",
    xpReward: 45,
    category: "STUDIES" as GoalCategoryKey,
    metricLabel: "Domínio"
  },
  {
    key: "REPUTATION" as PillarKeyValue,
    name: "Reputação",
    description: "Posts, projetos publicados e presença digital forte.",
    icon: "Gem",
    color: "from-violet-300/24 via-indigo-500/14 to-transparent",
    missionTitle: "Ativo público",
    missionDescription: "Publique algo que aumente sua autoridade.",
    xpReward: 55,
    category: "PROFESSIONAL" as GoalCategoryKey,
    metricLabel: "Presença"
  },
  {
    key: "DISCIPLINE" as PillarKeyValue,
    name: "Disciplina",
    description: "Autocontrole, distrações evitadas e consistência.",
    icon: "Flame",
    color: "from-red-400/24 via-orange-500/14 to-transparent",
    missionTitle: "Blindar o ambiente",
    missionDescription: "Elimine o gatilho que mais rouba sua atenção hoje.",
    xpReward: 40,
    category: "PERSONAL" as GoalCategoryKey,
    metricLabel: "Controle"
  },
  {
    key: "REFLECTION" as PillarKeyValue,
    name: "Reflexão",
    description: "Diário, revisão e consciência para ajustar o sistema.",
    icon: "MoonStar",
    color: "from-slate-300/20 via-cyan-400/12 to-transparent",
    missionTitle: "Fechamento do dia",
    missionDescription: "Registre o check-in noturno com clareza.",
    xpReward: 35,
    category: "PERSONAL" as GoalCategoryKey,
    metricLabel: "Consciência"
  }
] as const;

export const xpSourceLabels = {
  CHALLENGE: "Desafio concluído",
  STREAK: "Streak preservada",
  STUDY: "Estudo",
  TRAINING: "Treino",
  SALES: "Vendas / Networking",
  CONTENT: "Conteúdo publicado",
  NIGHT_CHECKIN: "Check-in noturno",
  WEEKLY_REVIEW: "Review semanal",
  FOCUS: "Sessão de foco",
  GOAL: "Meta avançada"
} as const;

export const achievementCatalog = [
  {
    key: "first-checkin",
    title: "Dia Fechado",
    description: "Complete seu primeiro check-in noturno.",
    icon: "Sparkles",
    xpBonus: 40,
    requirement: "1 check-in concluído"
  },
  {
    key: "three-day-streak",
    title: "Ritmo Encontrado",
    description: "Mantenha 3 dias seguidos em evolução.",
    icon: "Flame",
    xpBonus: 70,
    requirement: "3 dias de streak"
  },
  {
    key: "weekly-review",
    title: "Olhar Estratégico",
    description: "Conclua uma review semanal completa.",
    icon: "Trophy",
    xpBonus: 120,
    requirement: "1 review semanal"
  },
  {
    key: "all-pillars",
    title: "Dia Redondo",
    description: "Complete 7/7 pilares em um único dia.",
    icon: "Activity",
    xpBonus: 180,
    requirement: "7 pilares em um dia"
  }
] as const;

export const iconMap = {
  Activity,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Dumbbell,
  Flame,
  Focus,
  Gem,
  LayoutDashboard,
  MoonStar,
  Radar,
  ScrollText,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Users,
  Zap
} as const;
