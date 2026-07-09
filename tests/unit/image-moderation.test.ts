import { afterEach, describe, expect, test } from 'bun:test';
import {
  moderateImage,
  UploadClientError,
  validateImageBuffer,
} from '@/lib/image-moderation';

/** Minimal valid PNG (1×1) padded past MIN_IMAGE_BYTES (100). */
function minimalTestPng(): Buffer {
  const core = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  );
  return Buffer.concat([core, Buffer.alloc(40, 0)]);
}

describe('validateImageBuffer — §19.1 MIME/size validation', () => {
  test('accepts valid PNG with matching MIME', () => {
    const detected = validateImageBuffer(minimalTestPng(), 'image/png');
    expect(detected.ext).toBe('png');
    expect(detected.mime).toBe('image/png');
  });

  test('rejects file smaller than MIN_IMAGE_BYTES', () => {
    const tiny = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    expect(() => validateImageBuffer(tiny, 'image/png')).toThrow(UploadClientError);
    expect(() => validateImageBuffer(tiny, 'image/png')).toThrow(/terlalu kecil/i);
  });

  test('rejects MIME spoofing (PNG bytes, JPEG content-type)', () => {
    expect(() => validateImageBuffer(minimalTestPng(), 'image/jpeg')).toThrow(
      UploadClientError,
    );
    expect(() => validateImageBuffer(minimalTestPng(), 'image/jpeg')).toThrow(
      /tidak sesuai/i,
    );
  });

  test('rejects non-image bytes', () => {
    const text = Buffer.alloc(120, 0x41);
    expect(() => validateImageBuffer(text, 'image/png')).toThrow(UploadClientError);
    expect(() => validateImageBuffer(text, 'image/png')).toThrow(/bukan gambar/i);
  });

  test('rejects disallowed MIME type', () => {
    expect(() => validateImageBuffer(minimalTestPng(), 'image/bmp')).toThrow(
      UploadClientError,
    );
  });
});

describe('moderateImage — §19.3 image moderation', () => {
  const originalFetch = globalThis.fetch;
  const originalEndpoint = process.env.IMAGE_MODERATION_ENDPOINT;
  const originalKey = process.env.IMAGE_MODERATION_API_KEY;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalEndpoint === undefined) {
      delete process.env.IMAGE_MODERATION_ENDPOINT;
    } else {
      process.env.IMAGE_MODERATION_ENDPOINT = originalEndpoint;
    }
    if (originalKey === undefined) {
      delete process.env.IMAGE_MODERATION_API_KEY;
    } else {
      process.env.IMAGE_MODERATION_API_KEY = originalKey;
    }
  });

  test('skips moderation when endpoint is not configured', async () => {
    delete process.env.IMAGE_MODERATION_ENDPOINT;
    delete process.env.IMAGE_MODERATION_API_KEY;
    await expect(
      moderateImage(minimalTestPng(), 'image/png'),
    ).resolves.toBe(true);
  });

  test('rejects unsafe content from moderation API', async () => {
    process.env.IMAGE_MODERATION_ENDPOINT = 'https://moderation.test/check';
    process.env.IMAGE_MODERATION_API_KEY = 'test-key';
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ decision: 'reject' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })) as typeof fetch;

    await expect(moderateImage(minimalTestPng(), 'image/png')).rejects.toThrow(
      UploadClientError,
    );
    await expect(moderateImage(minimalTestPng(), 'image/png')).rejects.toThrow(
      /moderasi/i,
    );
  });

  test('accepts safe content from moderation API', async () => {
    process.env.IMAGE_MODERATION_ENDPOINT = 'https://moderation.test/check';
    process.env.IMAGE_MODERATION_API_KEY = 'test-key';
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ decision: 'allow' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })) as typeof fetch;

    await expect(moderateImage(minimalTestPng(), 'image/png')).resolves.toBe(true);
  });
});
