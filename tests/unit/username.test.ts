import { describe, expect, test } from 'bun:test';
import {
  USERNAME_COOLDOWN_DAYS,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  fallbackUsernameFromCoreUser,
  getUsernameCooldownDays,
  hasValidUsernameChars,
  hasValidUsernameLength,
  isValidUsername,
  slugifyUsername,
} from '@/lib/username';

describe('slugifyUsername', () => {
  test('lowercases and replaces invalid chars with underscore', () => {
    expect(slugifyUsername('Hello World!')).toBe('hello_world');
    expect(slugifyUsername('User@123')).toBe('user_123');
  });

  test('trims leading/trailing underscores', () => {
    expect(slugifyUsername('___abc___')).toBe('abc');
  });

  test('caps at 24 characters', () => {
    const long = 'a'.repeat(30);
    expect(slugifyUsername(long).length).toBe(24);
  });
});

describe('fallbackUsernameFromCoreUser', () => {
  test('uses slugified name when >= 3 chars', () => {
    expect(fallbackUsernameFromCoreUser({ id: 'clerk_abc123', name: 'Budi Santoso' })).toBe(
      'budi_santoso',
    );
  });

  test('falls back to user_id suffix when name too short', () => {
    const handle = fallbackUsernameFromCoreUser({ id: 'clerk_XYZabc99', name: 'A' });
    expect(handle).toMatch(/^user_[a-z0-9]+$/);
    expect(handle.length).toBeGreaterThanOrEqual(3);
  });
});

describe('hasValidUsernameChars', () => {
  test('accepts lowercase letters, digits, underscore', () => {
    expect(hasValidUsernameChars('abc_123')).toBe(true);
    expect(hasValidUsernameChars('valid_user')).toBe(true);
  });

  test('rejects uppercase, spaces, and symbols', () => {
    expect(hasValidUsernameChars('BadUser')).toBe(false);
    expect(hasValidUsernameChars('user name')).toBe(false);
    expect(hasValidUsernameChars('user-name')).toBe(false);
    expect(hasValidUsernameChars('user@mail')).toBe(false);
  });
});

describe('hasValidUsernameLength', () => {
  test(`requires ${USERNAME_MIN_LENGTH}–${USERNAME_MAX_LENGTH} characters after trim`, () => {
    expect(hasValidUsernameLength('ab')).toBe(false);
    expect(hasValidUsernameLength('abc')).toBe(true);
    expect(hasValidUsernameLength('a'.repeat(USERNAME_MAX_LENGTH))).toBe(true);
    expect(hasValidUsernameLength('a'.repeat(USERNAME_MAX_LENGTH + 1))).toBe(false);
    expect(hasValidUsernameLength('  abc  ')).toBe(true);
  });
});

describe('isValidUsername', () => {
  test('combines charset and length rules', () => {
    expect(isValidUsername('good_handle')).toBe(true);
    expect(isValidUsername('AB')).toBe(false);
    expect(isValidUsername('bad-handle')).toBe(false);
  });
});

describe('getUsernameCooldownDays', () => {
  const now = new Date('2026-06-22T12:00:00.000Z').getTime();

  test('returns 0 when never changed', () => {
    expect(getUsernameCooldownDays(null, now)).toBe(0);
  });

  test('returns 0 when cooldown elapsed', () => {
    const changedAt = new Date(now - USERNAME_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
    expect(getUsernameCooldownDays(changedAt, now)).toBe(0);
  });

  test('returns remaining days when within cooldown', () => {
    const oneDayAgo = new Date(now - 1 * 24 * 60 * 60 * 1000);
    expect(getUsernameCooldownDays(oneDayAgo, now)).toBe(USERNAME_COOLDOWN_DAYS - 1);
  });

  test('ceil partial days', () => {
    const halfDayAgo = new Date(now - 0.5 * 24 * 60 * 60 * 1000);
    expect(getUsernameCooldownDays(halfDayAgo, now)).toBe(USERNAME_COOLDOWN_DAYS);
  });
});
