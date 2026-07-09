import { describe, expect, test } from 'bun:test';
import { formatPublishedDateWib, formatScheduledPublishAtWib, getArticleTimingDisplay } from '@/lib/articles/format-published-date';
import {
  defaultScheduleInputValue,
  isoToScheduleInput,
  scheduleInputToIso,
  getScheduleInputError,
} from '@/lib/articles/schedule-input';
import { MIN_SCHEDULE_LEAD_MS, parseScheduledPublishAt } from '@/lib/articles/schedule-validation';

describe('formatPublishedDateWib', () => {
  test('formats UTC instant in Asia/Jakarta with WIB suffix', () => {
    const formatted = formatPublishedDateWib('2026-07-10T01:00:00.000Z');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('WIB');
    expect(formatted).toMatch(/08[.:]00/);
  });

  test('returns empty string for invalid input', () => {
    expect(formatPublishedDateWib(null)).toBe('');
    expect(formatPublishedDateWib('invalid')).toBe('');
  });
});

describe('getArticleTimingDisplay', () => {
  test('shows published time for PUBLISHED articles', () => {
    const timing = getArticleTimingDisplay({
      status: 'PUBLISHED',
      publishedAt: '2026-07-10T01:00:00.000Z',
    });
    expect(timing.kind).toBe('published');
    expect(timing.label).toBe('Dipublikasikan');
    expect(timing.compact).toContain('WIB');
  });

  test('shows scheduled time for SCHEDULED articles', () => {
    const timing = getArticleTimingDisplay({
      status: 'SCHEDULED',
      scheduledPublishAt: '2026-07-10T01:00:00.000Z',
    });
    expect(timing.kind).toBe('scheduled');
    expect(timing.label).toBe('Terjadwal');
  });

  test('falls back to createdAt for draft articles', () => {
    const timing = getArticleTimingDisplay({
      status: 'DRAFT',
      createdAt: '2026-07-09T10:00:00.000Z',
    });
    expect(timing.label).toBe('Dibuat');
    expect(timing.compact).toContain('WIB');
  });
});

describe('formatScheduledPublishAtWib', () => {
  test('prefixes scheduled label', () => {
    const label = formatScheduledPublishAtWib('2026-07-10T01:00:00.000Z');
    expect(label.startsWith('Tayang ')).toBe(true);
    expect(label).toContain('WIB');
  });
});

describe('schedule input helpers', () => {
  test('round-trips datetime-local through ISO', () => {
    const input = '2026-12-25T15:30';
    const iso = scheduleInputToIso(input);
    expect(isoToScheduleInput(iso)).toBe(input);
  });

  test('defaultScheduleInputValue returns future datetime-local string', () => {
    const value = defaultScheduleInputValue();
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    const parsed = new Date(scheduleInputToIso(value));
    expect(parsed.getTime()).toBeGreaterThan(Date.now());
  });
});

describe('getScheduleInputError', () => {
  test('returns error when schedule is too soon', () => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const soon = new Date(Date.now() + 5 * 60_000);
    const input = `${soon.getFullYear()}-${pad(soon.getMonth() + 1)}-${pad(soon.getDate())}T${pad(soon.getHours())}:${pad(soon.getMinutes())}`;
    const error = getScheduleInputError(input);
    expect(error).toContain('30 menit');
  });

  test('returns null for valid future schedule', () => {
    const error = getScheduleInputError(defaultScheduleInputValue());
    expect(error).toBeNull();
  });
});

describe('parseScheduledPublishAt', () => {
  test('rejects missing value', () => {
    const result = parseScheduledPublishAt('');
    expect(result.ok).toBe(false);
  });

  test('rejects schedule in the past', () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    const result = parseScheduledPublishAt(past);
    expect(result.ok).toBe(false);
  });

  test('rejects schedule less than 30 minutes ahead', () => {
    const soon = new Date(Date.now() + 5 * 60_000).toISOString();
    const result = parseScheduledPublishAt(soon);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('30 menit');
    }
  });

  test('accepts schedule beyond minimum lead time', () => {
    const future = new Date(Date.now() + MIN_SCHEDULE_LEAD_MS + 5_000).toISOString();
    const result = parseScheduledPublishAt(future);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.date.getTime()).toBeGreaterThan(Date.now());
    }
  });
});
