import { ApiClientError, parseApiResponse } from '@/lib/fetch-api';
import { ARTICLE_IMAGE_MAX_LABEL } from '@/lib/article-form-helpers';

/** Pesan error berbahasa Indonesia untuk respons upload non-JSON (proxy, nginx, dll.). */
export function uploadResponseErrorMessage(
  response: Response,
  contentType: string,
): string {
  if (response.status === 413) {
    return `Ukuran file terlalu besar. Maksimal ${ARTICLE_IMAGE_MAX_LABEL}. Kompres atau pilih gambar yang lebih kecil.`;
  }
  if (response.status === 401) {
    return 'Sesi Anda telah berakhir. Muat ulang halaman dan masuk kembali, lalu coba upload lagi.';
  }
  if (response.status === 403) {
    return 'Anda tidak memiliki izin untuk mengunggah gambar ini.';
  }
  if (response.status === 429) {
    return 'Terlalu banyak upload. Coba lagi dalam beberapa saat.';
  }
  if (response.status >= 500) {
    return 'Server sedang bermasalah. Coba lagi dalam beberapa saat.';
  }
  if (contentType.includes('text/html')) {
    return `Upload gagal (HTTP ${response.status}). Periksa ukuran dan format gambar — maks. ${ARTICLE_IMAGE_MAX_LABEL}, format JPG/PNG/GIF/WebP.`;
  }
  return 'Upload gagal. Respons server tidak valid.';
}

/** Terjemahkan pesan error API upload (Inggris) ke bahasa Indonesia. */
export function mapUploadApiErrorMessage(
  message: string,
  status?: number,
): string {
  const lower = message.toLowerCase();

  if (status === 401 || lower.includes('not authenticated')) {
    return 'Sesi Anda telah berakhir. Muat ulang halaman dan masuk kembali, lalu coba upload lagi.';
  }
  if (
    status === 413 ||
    lower.includes('too large') ||
    lower.includes('exceeds maximum size') ||
    lower.includes('file too large')
  ) {
    return `Ukuran file terlalu besar. Maksimal ${ARTICLE_IMAGE_MAX_LABEL}. Kompres atau pilih gambar yang lebih kecil.`;
  }
  if (lower.includes('invalid file type') || lower.includes('invalid image mime')) {
    return 'Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.';
  }
  if (lower.includes('not a valid image') || lower.includes('too small')) {
    return 'File gambar tidak valid atau rusak. Coba pilih file lain.';
  }
  if (lower.includes('mime type does not match')) {
    return 'Ekstensi file tidak sesuai isi gambar. Simpan ulang sebagai JPG, PNG, GIF, atau WebP.';
  }
  if (lower.includes('moderation') || lower.includes('rejected')) {
    return 'Gambar ditolak oleh sistem moderasi. Pilih gambar lain.';
  }
  if (lower.includes('rate limit') || lower.includes('terlalu banyak upload')) {
    return 'Terlalu banyak upload. Coba lagi nanti.';
  }
  if (status && status >= 500) {
    return 'Server sedang bermasalah. Coba lagi dalam beberapa saat.';
  }

  return message;
}

export async function parseUploadApiResponse<T = unknown>(
  response: Response,
): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error(uploadResponseErrorMessage(response, contentType));
  }

  try {
    return await parseApiResponse<T>(response);
  } catch (err) {
    if (err instanceof ApiClientError) {
      throw new Error(mapUploadApiErrorMessage(err.message, err.status));
    }
    throw err;
  }
}
