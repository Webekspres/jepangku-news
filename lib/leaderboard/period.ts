const JAKARTA_TZ = 'Asia/Jakarta';

export type LeaderboardPeriod = 'weekly' | 'monthly' | 'sepanjang-waktu';

export const LEADERBOARD_PERIOD_LABELS: Record<LeaderboardPeriod, string> = {
  weekly: 'Minggu ini',
  monthly: 'Bulan ini',
  'sepanjang-waktu': 'Sepanjang waktu',
};

export const LEADERBOARD_PERIOD_SHORT: Record<LeaderboardPeriod, string> = {
  weekly: 'Mingguan',
  monthly: 'Bulanan',
  'sepanjang-waktu': 'Sepanjang waktu',
};

function jakartaParts(now: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: JAKARTA_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(now);

  return {
    year: parts.find((p) => p.type === 'year')!.value,
    month: parts.find((p) => p.type === 'month')!.value,
    day: parts.find((p) => p.type === 'day')!.value,
    weekday: parts.find((p) => p.type === 'weekday')!.value,
  };
}

const WEEKDAY_TO_OFFSET: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

/** Calendar week Mon 00:00 — Sun 23:59:59.999 (Asia/Jakarta). */
export function getJakartaWeekBounds(now = new Date()): { start: Date; end: Date } {
  const { year, month, day, weekday } = jakartaParts(now);
  const anchor = new Date(`${year}-${month}-${day}T12:00:00+07:00`);
  const offset = WEEKDAY_TO_OFFSET[weekday] ?? 0;
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() - offset);

  const mondayParts = new Intl.DateTimeFormat('en-US', {
    timeZone: JAKARTA_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(monday);

  const y = mondayParts.find((p) => p.type === 'year')!.value;
  const m = mondayParts.find((p) => p.type === 'month')!.value;
  const d = mondayParts.find((p) => p.type === 'day')!.value;

  const start = new Date(`${y}-${m}-${d}T00:00:00+07:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/** Calendar month 1st 00:00 — last day 23:59:59.999 (Asia/Jakarta). */
export function getJakartaMonthBounds(now = new Date()): { start: Date; end: Date } {
  const { year, month } = jakartaParts(now);
  const start = new Date(`${year}-${month}-01T00:00:00+07:00`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  end.setMilliseconds(-1);
  return { start, end };
}

export function getPeriodBounds(
  period: LeaderboardPeriod,
  now = new Date(),
): { start: Date; end: Date } | null {
  if (period === 'sepanjang-waktu') return null;
  if (period === 'weekly') return getJakartaWeekBounds(now);
  return getJakartaMonthBounds(now);
}

export function parseLeaderboardPeriod(value: string | null): LeaderboardPeriod {
  if (value === 'monthly' || value === 'sepanjang-waktu') return value;
  return 'weekly';
}
