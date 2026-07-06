/**
 * Phase 4.4 — Email Logging
 *
 * Tests for lib/email/transport.ts:
 *   - sendTransactionalEmail — error handling when email not configured
 */
import { describe, expect, test, mock } from 'bun:test';

// Mock logger to avoid actual log drain calls
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

// Mock email config — return falsy values = email not configured
// Both missing API key and missing from address hit the same guard
// (if (!resend || !from) → throw EMAIL_NOT_CONFIGURED), so one test covers both.
mock.module('@/lib/email/config', () => ({
  getResendApiKey: () => null,
  getEmailFromHeader: () => null,
  getEmailReplyTo: () => null,
}));

const { sendTransactionalEmail } = await import('@/lib/email/transport');

describe('sendTransactionalEmail — §4.4', () => {
  test('throws EMAIL_NOT_CONFIGURED when email is not configured', async () => {
    await expect(
      sendTransactionalEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Hello</p>',
        text: 'Hello',
      }),
    ).rejects.toThrow('EMAIL_NOT_CONFIGURED');
  });
});
