import { MIN_SCHEDULE_LEAD_MS, parseScheduledPublishAt } from '@/lib/articles/schedule-validation';

/** Default datetime-local value — at least MIN_SCHEDULE_LEAD + 5 minutes ahead. */
export function defaultScheduleInputValue(
  offsetMs = MIN_SCHEDULE_LEAD_MS + 5 * 60_000,
): string {
  const date = new Date(Date.now() + offsetMs);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Convert datetime-local input to ISO string for API. */
export function scheduleInputToIso(value: string): string {
  return new Date(value).toISOString();
}

/** Convert ISO timestamp to datetime-local input value. */
export function isoToScheduleInput(value: string | Date | null | undefined): string {
  if (!value) return defaultScheduleInputValue();
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return defaultScheduleInputValue();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Client-side validation for datetime-local schedule input. Returns error message or null. */
export function getScheduleInputError(value: string): string | null {
  if (!value.trim()) {
    return 'Jadwal tayang wajib diisi';
  }
  const result = parseScheduledPublishAt(scheduleInputToIso(value));
  return result.ok ? null : result.error;
}
