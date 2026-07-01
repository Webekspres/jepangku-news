import { ApiClientError, parseApiResponse } from '@/lib/fetch-api';

/** Pesan error berbahasa Indonesia untuk respons upload non-JSON (sesi habis, halaman HTML, dll.). */
export function uploadResponseErrorMessage(
  response: Response,
  contentType: string,
): string {
  if (response.status === 401 || contentType.includes('text/html')) {
    return 'Sesi Anda telah berakhir. Muat ulang halaman dan masuk kembali, lalu coba upload lagi.';
  }
  if (response.status === 413) {
    return 'Ukuran file terlalu besar. Maksimal 5 MB.';
  }
  if (response.status >= 500) {
    return 'Server sedang bermasalah. Coba lagi dalam beberapa saat.';
  }
  return 'Upload gagal. Respons server tidak valid.';
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
    if (err instanceof ApiClientError && err.status === 401) {
      throw new Error(
        'Sesi Anda telah berakhir. Muat ulang halaman dan masuk kembali, lalu coba upload lagi.',
      );
    }
    throw err;
  }
}
