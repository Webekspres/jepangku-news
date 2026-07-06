'use client';

import { captureException, addBreadcrumb } from '@/lib/monitoring';
import { useEffect } from 'react';

/**
 * Next.js Global Error Boundary (app/global-error.tsx)
 *
 * Catches errors that escape the root layout (e.g. in the <html>/<body>).
 * Must render its own <html> and <body> tags.
 * Logs to Pino + monitoring webhook via captureException.
 *
 * Phase 5.4 — Global Error Boundary
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    addBreadcrumb('react.global_error_boundary', {
      digest: error.digest,
      name: error.name,
    });
    void captureException(error, { source: 'global-error.tsx' });
  }, [error]);

  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <svg
            className="h-8 w-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold">Terjadi kesalahan</h1>
        <p className="text-jepang-muted max-w-md text-sm">
          Maaf, ada masalah saat memuat halaman. Tim kami telah diberi tahu.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-jepang-orange px-4 py-2 text-sm text-white hover:bg-jepang-orange-hover"
        >
          Coba lagi
        </button>
      </body>
    </html>
  );
}
