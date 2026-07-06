import { describe, expect, test } from 'bun:test';
import { safeImageSrc } from '@/lib/safe-url';

describe('safeImageSrc', () => {
  test('returns "" for null / undefined / empty string', () => {
    expect(safeImageSrc(null)).toBe('');
    expect(safeImageSrc(undefined)).toBe('');
    expect(safeImageSrc('')).toBe('');
  });

  test('returns https URL as-is', () => {
    expect(safeImageSrc('https://example.com/image.jpg')).toBe(
      'https://example.com/image.jpg',
    );
  });

  test('returns http URL as-is', () => {
    expect(safeImageSrc('http://example.com/image.png')).toBe(
      'http://example.com/image.png',
    );
  });

  test('returns root-relative path as-is', () => {
    expect(safeImageSrc('/uploads/image.jpg')).toBe('/uploads/image.jpg');
  });

  test('returns blob: URL as-is (local preview)', () => {
    const blobUrl = 'blob:http://localhost:3000/abc123-def456';
    expect(safeImageSrc(blobUrl)).toBe(blobUrl);
  });

  test('returns blob: URL with https origin as-is', () => {
    const blobUrl = 'blob:https://jepangku.com/xyz-789';
    expect(safeImageSrc(blobUrl)).toBe(blobUrl);
  });

  test('rejects javascript: URLs (XSS)', () => {
    expect(safeImageSrc('javascript:alert(1)')).toBe('');
  });

  test('rejects data: URLs', () => {
    expect(safeImageSrc('data:image/svg+xml,<svg></svg>')).toBe('');
  });

  test('rejects URLs with HTML metacharacters', () => {
    expect(safeImageSrc('https://example.com/image"onerror="alert(1)')).toBe('');
    expect(safeImageSrc("https://example.com/image'/>")).toBe('');
    expect(safeImageSrc('https://example.com/<script>')).toBe('');
  });

  test('rejects URLs with whitespace', () => {
    expect(safeImageSrc('https://example.com/ image.jpg')).toBe('');
  });

  test('trims whitespace before checking', () => {
    expect(safeImageSrc('  https://example.com/image.jpg  ')).toBe(
      'https://example.com/image.jpg',
    );
  });

  test('allows bare http:// (harmless — will just fail to load as img src)', () => {
    expect(safeImageSrc('http://')).toBe('http://');
  });
});
