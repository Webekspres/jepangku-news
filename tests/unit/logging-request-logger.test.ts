/**
 * Phase 2 — Request Logging Middleware
 *
 * Tests for pure helper functions in lib/logging/request-logger.ts:
 *   - generateReqId()        — correlation ID
 *   - anonymizeIp()          — IP masking (hanya 2 oktet terakhir)
 *   - getClientIp()          — ekstraksi dari header
 *   - getUserAgent()         — ekstraksi dari header
 */
import { describe, expect, test } from 'bun:test';
import {
  generateReqId,
  anonymizeIp,
  getClientIp,
  getUserAgent,
} from '@/lib/logging/request-logger';

// ─── generateReqId ────────────────────────────────────────────────

describe('generateReqId — §2.1 correlation ID', () => {
  test('returns a non-empty string', () => {
    expect(generateReqId()).toBeTruthy();
    expect(typeof generateReqId()).toBe('string');
  });

  test('returns a valid UUID v4 format (xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx)', () => {
    const uuid = generateReqId();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  test('produces unique values across multiple calls', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateReqId()));
    expect(ids.size).toBe(100);
  });
});

// ─── anonymizeIp ──────────────────────────────────────────────────

describe('anonymizeIp — §2.1 IP masking', () => {
  test('masks first two octets for IPv4', () => {
    expect(anonymizeIp('192.168.1.100')).toBe('xxx.xxx.1.100');
    expect(anonymizeIp('10.0.0.1')).toBe('xxx.xxx.0.1');
    expect(anonymizeIp('203.0.113.42')).toBe('xxx.xxx.113.42');
  });

  test('returns [masked] for IPv6 addresses', () => {
    expect(anonymizeIp('2001:db8::1')).toBe('[masked]');
    expect(anonymizeIp('::1')).toBe('[masked]');
    expect(
      anonymizeIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334'),
    ).toBe('[masked]');
  });

  test('returns [masked] for unknown / empty input', () => {
    expect(anonymizeIp('unknown')).toBe('[masked]');
    expect(anonymizeIp('')).toBe('[masked]');
    expect(anonymizeIp('localhost')).toBe('[masked]');
  });
});

// ─── getClientIp ──────────────────────────────────────────────────

describe('getClientIp — §2.1 IP extraction', () => {
  test('extracts from x-forwarded-for (first IP)', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '203.0.113.1, 10.0.0.1' },
    });
    expect(getClientIp(req)).toBe('203.0.113.1');
  });

  test('falls back to x-real-ip when x-forwarded-for is missing', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-real-ip': '10.0.0.5' },
    });
    expect(getClientIp(req)).toBe('10.0.0.5');
  });

  test('returns unknown when no IP header present', () => {
    const req = new Request('http://localhost');
    expect(getClientIp(req)).toBe('unknown');
  });

  test('x-forwarded-for takes precedence over x-real-ip', () => {
    const req = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '1.2.3.4',
        'x-real-ip': '5.6.7.8',
      },
    });
    expect(getClientIp(req)).toBe('1.2.3.4');
  });
});

// ─── getUserAgent ─────────────────────────────────────────────────

describe('getUserAgent — §2.1 user-agent extraction', () => {
  test('extracts user-agent header from request', () => {
    const req = new Request('http://localhost', {
      headers: { 'user-agent': 'Mozilla/5.0 TestBrowser' },
    });
    expect(getUserAgent(req)).toBe('Mozilla/5.0 TestBrowser');
  });

  test('returns empty string when header is missing', () => {
    const req = new Request('http://localhost');
    expect(getUserAgent(req)).toBe('');
  });
});
