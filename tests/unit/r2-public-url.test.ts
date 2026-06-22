import { describe, expect, test } from 'bun:test';
import { buildR2PublicUrl } from '@/lib/r2';
import { isR2MediaUrl } from '@/lib/media/url';

describe('R2 public URLs — §19.2', () => {
  test('buildR2PublicUrl joins R2_PUBLIC_URL and object key', () => {
    const prev = process.env.R2_PUBLIC_URL;
    process.env.R2_PUBLIC_URL = 'https://cdn.example.com/';
    try {
      expect(buildR2PublicUrl('jepangku/uploads/u1/content/a.webp')).toBe(
        'https://cdn.example.com/jepangku/uploads/u1/content/a.webp',
      );
    } finally {
      if (prev === undefined) delete process.env.R2_PUBLIC_URL;
      else process.env.R2_PUBLIC_URL = prev;
    }
  });

  test('isR2MediaUrl recognizes r2.dev and cloudflarestorage hosts', () => {
    expect(isR2MediaUrl('https://bucket-id.r2.dev/jepangku/uploads/a.webp')).toBe(true);
    expect(
      isR2MediaUrl('https://bucket-id.r2.cloudflarestorage.com/jepangku/uploads/a.webp'),
    ).toBe(true);
    expect(isR2MediaUrl('https://evil.example.com/a.webp')).toBe(false);
  });

  test('isR2MediaUrl recognizes custom R2_PUBLIC_URL host', () => {
    const prev = process.env.R2_PUBLIC_URL;
    process.env.R2_PUBLIC_URL = 'https://media.jepangku.com';
    try {
      expect(isR2MediaUrl('https://media.jepangku.com/jepangku/uploads/a.webp')).toBe(
        true,
      );
    } finally {
      if (prev === undefined) delete process.env.R2_PUBLIC_URL;
      else process.env.R2_PUBLIC_URL = prev;
    }
  });
});
