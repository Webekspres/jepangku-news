/**
 * Phase 4.2 — External API Logging
 *
 * Tests for lib/core/client.ts:
 *   - CoreApiError class (code, message, status)
 *
 * coreFetch() is tested via integration tests (auth-section1.test.ts).
 */
import { describe, expect, test } from 'bun:test';
import { CoreApiError } from '@/lib/core/client';

describe('CoreApiError — §4.2', () => {
  test('sets code, message, and status from constructor', () => {
    const err = new CoreApiError('CORE_NOT_FOUND', 'User not found', 404);
    expect(err.code).toBe('CORE_NOT_FOUND');
    expect(err.message).toBe('User not found');
    expect(err.status).toBe(404);
  });

  test('inherits from Error', () => {
    const err = new CoreApiError('ERR', 'msg', 500);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(CoreApiError);
  });

  test('name is CoreApiError', () => {
    const err = new CoreApiError('ERR', 'msg', 500);
    expect(err.name).toBe('CoreApiError');
  });

  test('can be thrown and caught by type', () => {
    function throwIt(): never {
      throw new CoreApiError('TEST_ERR', 'test error', 400);
    }

    try {
      throwIt();
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(CoreApiError);
      if (error instanceof CoreApiError) {
        expect(error.code).toBe('TEST_ERR');
        expect(error.status).toBe(400);
      }
    }
  });

  test('handles various status codes', () => {
    const cases = [
      { code: 'CORE_NOT_CONFIGURED', status: 503 },
      { code: 'CORE_TIMEOUT', status: 504 },
      { code: 'CORE_NOT_FOUND', status: 404 },
      { code: 'CORE_UNAUTHORIZED', status: 401 },
      { code: 'CORE_FORBIDDEN', status: 403 },
      { code: 'CORE_SERVER_ERROR', status: 500 },
    ];

    for (const { code, status } of cases) {
      const err = new CoreApiError(code, 'msg', status);
      expect(err.code).toBe(code);
      expect(err.status).toBe(status);
    }
  });

  test('stack trace is captured on creation', () => {
    const err = new CoreApiError('ERR', 'msg', 500);
    expect(err.stack).toBeTruthy();
    expect(err.stack).toContain('CoreApiError');
  });
});
