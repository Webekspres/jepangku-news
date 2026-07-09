import {
  uploadResponseErrorMessage,
  mapUploadApiErrorMessage,
} from '@/lib/upload-errors';

describe('uploadResponseErrorMessage', () => {
  it('returns file size message for 413 with HTML body (not session expired)', () => {
    const response = new Response('<html>413</html>', {
      status: 413,
      headers: { 'content-type': 'text/html' },
    });
    expect(uploadResponseErrorMessage(response, 'text/html')).toMatch(
      /Ukuran file terlalu besar/i,
    );
    expect(uploadResponseErrorMessage(response, 'text/html')).not.toMatch(
      /Sesi Anda/i,
    );
  });

  it('returns session expired only for 401', () => {
    const response = new Response('', {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
    expect(uploadResponseErrorMessage(response, 'application/json')).toMatch(
      /Sesi Anda/i,
    );
  });

  it('returns helpful message for HTML non-401/5xx responses', () => {
    const response = new Response('<html>400</html>', {
      status: 400,
      headers: { 'content-type': 'text/html' },
    });
    expect(uploadResponseErrorMessage(response, 'text/html')).toMatch(
      /Upload gagal/i,
    );
    expect(uploadResponseErrorMessage(response, 'text/html')).not.toMatch(
      /Sesi Anda/i,
    );
  });
});

describe('mapUploadApiErrorMessage', () => {
  it('maps English file too large to Indonesian', () => {
    expect(mapUploadApiErrorMessage('File too large (max 10MB)', 400)).toMatch(
      /Ukuran file terlalu besar/i,
    );
  });

  it('maps invalid file type to Indonesian', () => {
    expect(mapUploadApiErrorMessage('Invalid file type', 400)).toMatch(
      /Format file tidak didukung/i,
    );
  });
});

describe('validateArticleImageDimensions', () => {
  it('rejects oversized dimensions', async () => {
    const { validateArticleImageDimensions, ARTICLE_IMAGE_HARD_MAX_DIMENSION } =
      await import('@/lib/article-form-helpers');
    const over = ARTICLE_IMAGE_HARD_MAX_DIMENSION + 1;
    expect(validateArticleImageDimensions(over, 1000)).toMatch(/Dimensi gambar/i);
  });
});
