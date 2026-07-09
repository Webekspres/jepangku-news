/** Client-safe schedule validation — no server/db imports. */

/** Minimum lead time before a schedule is accepted (30 minutes). */
export const MIN_SCHEDULE_LEAD_MS = 30 * 60_000;

export type ScheduleParseResult =
  | { ok: true; date: Date }
  | { ok: false; error: string };

export function parseScheduledPublishAt(input: unknown): ScheduleParseResult {
  if (typeof input !== 'string' || !input.trim()) {
    return { ok: false, error: 'scheduledPublishAt wajib diisi' };
  }

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: 'scheduledPublishAt tidak valid' };
  }

  const minAt = Date.now() + MIN_SCHEDULE_LEAD_MS;
  if (date.getTime() < minAt) {
    return { ok: false, error: 'Jadwal tayang minimal 30 menit dari sekarang (WIB)' };
  }

  return { ok: true, date };
}
