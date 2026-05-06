import { type ClassValue, clsx } from "clsx";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number) {
  return `${score.toFixed(1).replace(".0", "")}/10`;
}

export function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function percent(part: number, total: number) {
  if (!total) {
    return 0;
  }

  return Math.round((part / total) * 100);
}

export function formatShortDate(date: Date) {
  return format(date, "dd 'de' MMM", { locale: ptBR });
}

export function formatWeekday(date: Date) {
  return format(date, "EEE", { locale: ptBR });
}

export function uniqueDays(dates: Date[]) {
  const bucket = new Map<string, Date>();

  for (const date of dates) {
    bucket.set(format(date, "yyyy-MM-dd"), date);
  }

  return Array.from(bucket.values());
}

export function calculateStreak(dates: Date[], referenceDate = new Date()) {
  const normalized = uniqueDays(dates)
    .map((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime())
    .sort((a, b) => b - a);

  if (!normalized.length) {
    return 0;
  }

  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate()).getTime();
  const yesterday = today - 86400000;
  const startsValid = normalized[0] === today || normalized[0] === yesterday;

  if (!startsValid) {
    return 0;
  }

  let streak = 1;
  for (let index = 0; index < normalized.length - 1; index += 1) {
    const diff = normalized[index] - normalized[index + 1];
    if (diff === 86400000) {
      streak += 1;
      continue;
    }

    if (diff !== 0) {
      break;
    }
  }

  return streak;
}

export function calculateBestStreak(dates: Date[]) {
  const normalized = uniqueDays(dates)
    .map((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime())
    .sort((a, b) => a - b);

  if (!normalized.length) {
    return 0;
  }

  let best = 1;
  let current = 1;

  for (let index = 1; index < normalized.length; index += 1) {
    const diff = normalized[index] - normalized[index - 1];
    if (diff === 86400000) {
      current += 1;
      best = Math.max(best, current);
    } else if (diff !== 0) {
      current = 1;
    }
  }

  return best;
}

export function compareWeekVariation(current: number, previous: number) {
  if (!previous && !current) {
    return 0;
  }

  if (!previous) {
    return 100;
  }

  return Math.round(((current - previous) / previous) * 100);
}

export function todayKey(date = new Date()) {
  return format(date, "yyyy-MM-dd");
}

export function isToday(date: Date) {
  return isSameDay(date, new Date());
}
