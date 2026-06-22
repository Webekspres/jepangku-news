export type AdScheduleStatus = 'always' | 'scheduled' | 'expired' | 'upcoming';

export type AdScheduleInfo = {
  status: AdScheduleStatus;
  startLabel: string;
  endLabel: string;
  daysRemaining: number | null;
  daysRemainingLabel: string;
};

function formatDateTimeId(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getAdScheduleInfo(
  startAt: string | null | undefined,
  endAt: string | null | undefined,
  now = new Date(),
): AdScheduleInfo {
  const start = startAt ? new Date(startAt) : null;
  const end = endAt ? new Date(endAt) : null;

  let status: AdScheduleStatus = 'always';
  if (start && start > now) status = 'upcoming';
  else if (end && end < now) status = 'expired';
  else if (start || end) status = 'scheduled';

  let daysRemaining: number | null = null;
  let daysRemainingLabel = 'Tanpa batas';

  if (end && end >= now) {
    const diffMs = startOfDay(end).getTime() - startOfDay(now).getTime();
    daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    daysRemainingLabel =
      daysRemaining === 0 ? 'Berakhir hari ini' : `${daysRemaining} hari lagi`;
  } else if (end && end < now) {
    daysRemainingLabel = 'Sudah berakhir';
  } else if (start && start > now) {
    const diffMs = startOfDay(start).getTime() - startOfDay(now).getTime();
    daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    daysRemainingLabel =
      daysRemaining === 0 ? 'Mulai hari ini' : `Mulai ${daysRemaining} hari lagi`;
  }

  return {
    status,
    startLabel: formatDateTimeId(startAt),
    endLabel: formatDateTimeId(endAt),
    daysRemaining,
    daysRemainingLabel,
  };
}
