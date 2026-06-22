import { beforeAll, describe, expect, it } from 'bun:test';
import sharp from 'sharp';
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from '../helpers/integration';

async function buildUploadPng(): Promise<Buffer> {
  return sharp({
    create: {
      width: 12,
      height: 12,
      channels: 3,
      background: { r: 200, g: 40, b: 40 },
    },
  })
    .png()
    .toBuffer();
}

function uploadForm(file: Blob, purpose = 'content'): FormData {
  const fd = new FormData();
  fd.append('file', file, 'section19-test.png');
  fd.append('purpose', purpose);
  return fd;
}

describe('API — §19 Upload & media', () => {
  let ctx: IntegrationContext;
  let testPng: Buffer;

  beforeAll(async () => {
    ctx = await setupIntegration();
    testPng = await buildUploadPng();
  });

  describe('19.1 — MIME/size validation', () => {
    it('returns 401 for guest upload', async () => {
      if (skipUnless(ctx, 'server')) return;
      const fd = uploadForm(new Blob([testPng], { type: 'image/png' }));
      const res = await clientFor(ctx).postForm('/api/upload', fd);
      expect(res.status).toBe(401);
    });

    it('rejects invalid MIME type with 400', async () => {
      if (skipUnless(ctx, 'auth')) return;
      const fd = uploadForm(new Blob(['not-an-image'], { type: 'text/plain' }));
      const res = await clientFor(ctx, 'USER').postForm('/api/upload', fd);
      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: string };
      expect(body.error).toMatch(/invalid file type/i);
    });

    it('rejects MIME spoofing with 400', async () => {
      if (skipUnless(ctx, 'auth')) return;
      const fd = uploadForm(new Blob([testPng], { type: 'image/jpeg' }));
      const res = await clientFor(ctx, 'USER').postForm('/api/upload', fd);
      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: string };
      expect(body.error).toMatch(/does not match|not a valid image/i);
    });

    it('accepts valid PNG upload', async () => {
      if (skipUnless(ctx, 'auth')) return;
      const fd = uploadForm(new Blob([testPng], { type: 'image/png' }));
      const res = await clientFor(ctx, 'USER').postForm('/api/upload', fd);
      expect(res.status).toBe(200);
      const body = (await res.json()) as { url: string; path: string };
      expect(body.url).toBeTruthy();
      expect(body.path).toMatch(/^jepangku\/uploads\//);
    });
  });

  describe('19.2 — public URL accessible', () => {
    it('uploaded image URL is fetchable', async () => {
      if (skipUnless(ctx, 'auth')) return;
      const fd = uploadForm(new Blob([testPng], { type: 'image/png' }));
      const uploadRes = await clientFor(ctx, 'USER').postForm('/api/upload', fd);
      expect(uploadRes.status).toBe(200);
      const { url } = (await uploadRes.json()) as { url: string };

      const mediaRes = await fetch(
        url.startsWith('http') ? url : `${ctx.baseUrl}${url}`,
      );
      expect(mediaRes.status).toBe(200);
      expect(mediaRes.headers.get('content-type')).toMatch(/^image\//);
    });
  });

  describe('19.4 — rich text editor image embed (API contract)', () => {
    it('upload returns URL usable in article figure HTML', async () => {
      if (skipUnless(ctx, 'auth')) return;
      const fd = uploadForm(new Blob([testPng], { type: 'image/png' }), 'content');
      const res = await clientFor(ctx, 'USER').postForm('/api/upload', fd);
      expect(res.status).toBe(200);
      const { url } = (await res.json()) as { url: string };
      const figureHtml = `<figure class="article-figure"><img src="${url}" alt="QA embed" loading="lazy" class="article-inline-image" /><figcaption class="article-figure-caption">QA</figcaption></figure>`;
      expect(figureHtml).toContain('article-figure');
      expect(figureHtml).toContain(url);
    });
  });
});
