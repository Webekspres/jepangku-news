import { describe, expect, test } from 'bun:test';
import {
  getJakartaDateKey,
  getJakartaDayBounds,
  isWithinJakartaDay,
} from '@/lib/jakarta-calendar';

describe('getJakartaDateKey', () => {
  test('formats as YYYY-MM-DD in Asia/Jakarta', () => {
    // 2026-06-21 18:00 UTC = 2026-06-22 01:00 WIB
    const key = getJakartaDateKey(new Date('2026-06-21T18:00:00.000Z'));
    expect(key).toBe('2026-06-22');
  });

  test('uses current date when no argument', () => {
    const key = getJakartaDateKey();
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('midnight WIB stays on same calendar day', () => {
    const key = getJakartaDateKey(new Date('2026-06-21T17:00:00.000Z')); // 00:00 WIB Jun 22
    expect(key).toBe('2026-06-22');
  });
});

describe('getJakartaDayBounds', () => {
  test('start is 00:00:00+07:00 and end is 23:59:59.999+07:00', () => {
    const now = new Date('2026-06-22T10:30:00+07:00');
    const { start, end } = getJakartaDayBounds(now);

    expect(start.toISOString()).toBe('2026-06-21T17:00:00.000Z');
    expect(end.toISOString()).toBe('2026-06-22T16:59:59.999Z');
  });

  test('bounds span exactly one Jakarta calendar day', () => {
    const now = new Date('2026-03-15T15:00:00+07:00');
    const { start, end } = getJakartaDayBounds(now);
    const durationMs = end.getTime() - start.getTime();
    expect(durationMs).toBe(24 * 60 * 60 * 1000 - 1);
  });

  test('date key aligns with day bounds for same anchor', () => {
    const now = new Date('2026-12-31T20:00:00+07:00');
    const key = getJakartaDateKey(now);
    const { start } = getJakartaDayBounds(now);
    expect(key).toBe('2026-12-31');
    expect(isWithinJakartaDay(start, now)).toBe(true);
  });
});

describe('isWithinJakartaDay', () => {
  const anchor = new Date('2026-06-22T10:00:00+07:00');

  test('true for time inside Jakarta day', () => {
    expect(isWithinJakartaDay(new Date('2026-06-22T00:00:00+07:00'), anchor)).toBe(true);
    expect(isWithinJakartaDay(new Date('2026-06-22T23:59:59+07:00'), anchor)).toBe(true);
    expect(isWithinJakartaDay(new Date('2026-06-22T12:00:00+07:00'), anchor)).toBe(true);
  });

  test('false for previous and next Jakarta day', () => {
    expect(isWithinJakartaDay(new Date('2026-06-21T23:59:59+07:00'), anchor)).toBe(false);
    expect(isWithinJakartaDay(new Date('2026-06-23T00:00:00+07:00'), anchor)).toBe(false);
  });

  test('UTC edge: late UTC evening maps to next Jakarta day', () => {
    // 2026-06-21 20:00 UTC = 2026-06-22 03:00 WIB
    const utcEvening = new Date('2026-06-21T20:00:00.000Z');
    const jakartaMorning = new Date('2026-06-22T03:00:00+07:00');
    expect(getJakartaDateKey(utcEvening)).toBe('2026-06-22');
    expect(isWithinJakartaDay(jakartaMorning, utcEvening)).toBe(true);
  });
});
