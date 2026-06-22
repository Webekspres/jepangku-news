import { describe, expect, test } from 'bun:test';
import {
  LEADERBOARD_PERIOD_LABELS,
  LEADERBOARD_PERIOD_SHORT,
  getJakartaMonthBounds,
  getJakartaWeekBounds,
  getPeriodBounds,
  parseLeaderboardPeriod,
} from '@/lib/leaderboard/period';

describe('parseLeaderboardPeriod', () => {
  test('defaults to weekly for null and unknown values', () => {
    expect(parseLeaderboardPeriod(null)).toBe('weekly');
    expect(parseLeaderboardPeriod('invalid')).toBe('weekly');
    expect(parseLeaderboardPeriod('')).toBe('weekly');
  });

  test('accepts monthly and sepanjang-waktu', () => {
    expect(parseLeaderboardPeriod('monthly')).toBe('monthly');
    expect(parseLeaderboardPeriod('sepanjang-waktu')).toBe('sepanjang-waktu');
  });
});

describe('period labels', () => {
  test('has Indonesian labels for all periods', () => {
    expect(LEADERBOARD_PERIOD_LABELS.weekly).toBe('Minggu ini');
    expect(LEADERBOARD_PERIOD_LABELS.monthly).toBe('Bulan ini');
    expect(LEADERBOARD_PERIOD_LABELS['sepanjang-waktu']).toBe('Sepanjang waktu');
    expect(LEADERBOARD_PERIOD_SHORT.weekly).toBe('Mingguan');
    expect(LEADERBOARD_PERIOD_SHORT.monthly).toBe('Bulanan');
  });
});

describe('getJakartaWeekBounds', () => {
  test('week bounds bracket a mid-week Jakarta date', () => {
    const now = new Date('2026-06-24T14:00:00+07:00');
    const { start, end } = getJakartaWeekBounds(now);

    expect(start.toISOString()).toBe('2026-06-21T17:00:00.000Z');
    expect(now.getTime()).toBeGreaterThanOrEqual(start.getTime());
    expect(now.getTime()).toBeLessThanOrEqual(end.getTime());
    expect(end.getTime()).toBeGreaterThan(start.getTime());
  });

  test('Sunday anchor starts on Monday of that week', () => {
    const sunday = new Date('2026-06-28T12:00:00+07:00');
    const { start } = getJakartaWeekBounds(sunday);
    expect(start.toISOString()).toBe('2026-06-21T17:00:00.000Z');
  });
});

describe('getJakartaMonthBounds', () => {
  test('start is first day 00:00 WIB and end is after anchor within same month span', () => {
    const now = new Date('2026-06-15T10:00:00+07:00');
    const { start, end } = getJakartaMonthBounds(now);

    expect(start.toISOString()).toBe('2026-05-31T17:00:00.000Z');
    expect(now.getTime()).toBeGreaterThanOrEqual(start.getTime());
    expect(now.getTime()).toBeLessThanOrEqual(end.getTime());
    expect(end.getTime()).toBeGreaterThan(start.getTime());
  });

  test('February in leap year brackets anchor', () => {
    const now = new Date('2024-02-10T08:00:00+07:00');
    const { start, end } = getJakartaMonthBounds(now);
    expect(start.toISOString()).toBe('2024-01-31T17:00:00.000Z');
    expect(now.getTime()).toBeGreaterThanOrEqual(start.getTime());
    expect(now.getTime()).toBeLessThanOrEqual(end.getTime());
  });
});

describe('getPeriodBounds', () => {
  const anchor = new Date('2026-06-24T10:00:00+07:00');

  test('weekly returns week bounds', () => {
    const bounds = getPeriodBounds('weekly', anchor);
    expect(bounds).not.toBeNull();
    expect(bounds!.start.getTime()).toBeLessThan(anchor.getTime());
    expect(bounds!.end.getTime()).toBeGreaterThan(anchor.getTime());
  });

  test('monthly returns month bounds', () => {
    const bounds = getPeriodBounds('monthly', anchor);
    expect(bounds).not.toBeNull();
    expect(bounds!.start.getUTCDate()).toBe(31); // May 31 UTC = Jun 1 WIB
  });

  test('sepanjang-waktu returns null (all-time, no date filter)', () => {
    expect(getPeriodBounds('sepanjang-waktu', anchor)).toBeNull();
  });
});
