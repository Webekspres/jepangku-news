/**
 * Phase 5 — Error Monitoring Upgrade
 *
 * Tests for lib/monitoring.ts:
 *   - addBreadcrumb() / getBreadcrumbs() / clearBreadcrumbs()  (5.1)
 *   - computeErrorFingerprint()                                (5.2)
 *   - captureException()                                       (5.4)
 *   - isMonitoringEnabled() / captureMessage()
 */
import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';

// Mock logger to suppress output during tests
mock.module('@/lib/logger', () => ({
  logger: {
    info: () => {},
    warn: () => {},
    error: () => {},
    child: () => ({
      info: () => {},
      warn: () => {},
      error: () => {},
    }),
  },
}));

// Import after mocking — fresh module for each describe block
const {
  addBreadcrumb,
  getBreadcrumbs,
  clearBreadcrumbs,
  computeErrorFingerprint,
  isMonitoringEnabled,
  captureMessage,
  captureException,
} = await import('@/lib/monitoring');

// ═══════════════════════════════════════════════════════════════════
// §5.1 — Breadcrumbs System
// ═══════════════════════════════════════════════════════════════════

describe('§5.1 Breadcrumbs — addBreadcrumb / getBreadcrumbs / clearBreadcrumbs', () => {
  beforeEach(() => {
    clearBreadcrumbs();
  });

  test('addBreadcrumb stores a breadcrumb with event name and timestamp', () => {
    addBreadcrumb('user.login', { userId: 'u-1' });
    const crumbs = getBreadcrumbs();
    expect(crumbs).toHaveLength(1);
    expect(crumbs[0].event).toBe('user.login');
    expect(crumbs[0].data).toEqual({ userId: 'u-1' });
    expect(crumbs[0].timestamp).toBeTruthy();
    expect(() => new Date(crumbs[0].timestamp)).not.toThrow();
  });

  test('getBreadcrumbs returns a copy (immutable)', () => {
    addBreadcrumb('test.event');
    const crumbs = getBreadcrumbs();
    crumbs.push({ event: 'fake', timestamp: new Date().toISOString() });
    // Original should still be 1
    expect(getBreadcrumbs()).toHaveLength(1);
  });

  test('clearBreadcrumbs removes all entries', () => {
    addBreadcrumb('a');
    addBreadcrumb('b');
    expect(getBreadcrumbs()).toHaveLength(2);
    clearBreadcrumbs();
    expect(getBreadcrumbs()).toHaveLength(0);
  });

  test('breadcrumbs can be added without data', () => {
    addBreadcrumb('simple.event');
    const crumbs = getBreadcrumbs();
    expect(crumbs[0].event).toBe('simple.event');
    expect(crumbs[0].data).toBeUndefined();
  });

  test('ring buffer respects max capacity of 50', () => {
    // Add 55 breadcrumbs
    for (let i = 0; i < 55; i++) {
      addBreadcrumb(`event-${i}`);
    }
    const crumbs = getBreadcrumbs();
    expect(crumbs).toHaveLength(50);
    // Oldest entries should be evicted
    expect(crumbs[0].event).toBe('event-5');
    expect(crumbs[49].event).toBe('event-54');
  });
});

// ═══════════════════════════════════════════════════════════════════
// §5.2 — Error Fingerprint
// ═══════════════════════════════════════════════════════════════════

describe('§5.2 Error Fingerprint — computeErrorFingerprint', () => {
  test('produces stable fingerprint for same Error', () => {
    const fp1 = computeErrorFingerprint(new Error('Not found'));
    const fp2 = computeErrorFingerprint(new Error('Not found'));
    expect(fp1.fingerprint).toBe(fp2.fingerprint);
  });

  test('different errors produce different fingerprints', () => {
    const fp1 = computeErrorFingerprint(new Error('Not found'));
    const fp2 = computeErrorFingerprint(new Error('Unauthorized'));
    expect(fp1.fingerprint).not.toBe(fp2.fingerprint);
  });

  test('returns name="Error" and correct message for plain Error', () => {
    const fp = computeErrorFingerprint(new Error('Something broke'));
    expect(fp.name).toBe('Error');
    expect(fp.message).toBe('Something broke');
  });

  test('uses custom error name for subclasses', () => {
    class CustomError extends Error {
      override name = 'CustomError';
    }
    const fp = computeErrorFingerprint(new CustomError('custom message'));
    expect(fp.name).toBe('CustomError');
    expect(fp.message).toBe('custom message');
  });

  test('handles non-Error values (string)', () => {
    const fp = computeErrorFingerprint('just a string');
    expect(fp.name).toBe('UnknownError');
    expect(fp.message).toBe('just a string');
  });

  test('handles non-Error values (null)', () => {
    const fp = computeErrorFingerprint(null);
    expect(fp.name).toBe('UnknownError');
    expect(fp.message).toBe('null');
  });

  test('handles non-Error values (object)', () => {
    const fp = computeErrorFingerprint({ foo: 'bar' });
    expect(fp.name).toBe('UnknownError');
    expect(fp.message).toBe('[object Object]');
  });

  test('is case-insensitive for same error with different casing', () => {
    const fp1 = computeErrorFingerprint(new Error('NOT FOUND'));
    const fp2 = computeErrorFingerprint(new Error('not found'));
    expect(fp1.fingerprint).toBe(fp2.fingerprint);
  });

  test('normalizes whitespace differences', () => {
    const fp1 = computeErrorFingerprint(new Error('too   many   spaces'));
    const fp2 = computeErrorFingerprint(new Error('too many spaces'));
    expect(fp1.fingerprint).toBe(fp2.fingerprint);
  });

  test('fingerprint format is err_xxxxxxxx', () => {
    const fp = computeErrorFingerprint(new Error('test'));
    expect(fp.fingerprint).toMatch(/^err_[0-9a-f]{8}$/);
  });
});

// ═══════════════════════════════════════════════════════════════════
// §5.4 — captureException / captureMessage / isMonitoringEnabled
// ═══════════════════════════════════════════════════════════════════

describe('§5.4 captureException & captureMessage — monitoring API', () => {
  afterEach(() => {
    clearBreadcrumbs();
  });

  test('captureMessage does not throw', () => {
    expect(() => captureMessage('test message')).not.toThrow();
    expect(() => captureMessage('with context', { key: 'value' })).not.toThrow();
  });

  test('captureException does not throw', async () => {
    await expect(
      captureException(new Error('test error')),
    ).resolves.toBeUndefined();
  });

  test('captureException accepts context data', async () => {
    await expect(
      captureException(new Error('context error'), { source: 'test' }),
    ).resolves.toBeUndefined();
  });

  test('captureException clears breadcrumbs after call', async () => {
    addBreadcrumb('before.error', { step: 1 });
    addBreadcrumb('before.error', { step: 2 });
    expect(getBreadcrumbs()).toHaveLength(2);

    await captureException(new Error('should clear'));

    expect(getBreadcrumbs()).toHaveLength(0);
  });

  test('captureException clears breadcrumbs even without webhook', async () => {
    addBreadcrumb('pre.error');
    expect(getBreadcrumbs()).toHaveLength(1);

    // MONITORING_WEBHOOK_URL is undefined in test env -> no webhook send
    await captureException(new Error('no webhook'));

    // Breadcrumbs should still be cleared (moved before webhook guard)
    expect(getBreadcrumbs()).toHaveLength(0);
  });

  test('captureException handles null error gracefully', async () => {
    clearBreadcrumbs();
    await expect(captureException(null)).resolves.toBeUndefined();
  });

  test('captureException handles undefined error gracefully', async () => {
    clearBreadcrumbs();
    await expect(captureException(undefined)).resolves.toBeUndefined();
  });

  test('captureException handles string error gracefully', async () => {
    clearBreadcrumbs();
    await expect(captureException('string error')).resolves.toBeUndefined();
  });
});

describe('isMonitoringEnabled', () => {
  test('returns false in test environment (no MONITORING_WEBHOOK_URL)', () => {
    // monitoringEndpoint is captured at module-load time from process.env.
    // In test env MONITORING_WEBHOOK_URL is not set, so it should be false.
    expect(isMonitoringEnabled()).toBe(false);
  });
});
