'use client';

import { captureException, addBreadcrumb } from '@/lib/monitoring';
import { useEffect } from 'react';

/**
 * Next.js Error Boundary (app/error.tsx)
 *
 * Catches errors in the page/layout segment (client-side).
 * Logs to Pino + monitoring webhook, then shows a user-friendly UI.
 *
 * Phase 5.4 — Global Error Boundary
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    addBreadcrumb('react.error_boundary', {
      digest: error.digest,
      name: error.name,
    });
    void captureException(error, { source: 'error.tsx' });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
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
      <h1 className="text-xl font-semibold text-jepang-navy">
        Terjadi kesalahan
      </h1>
      <p className="max-w-md text-sm text-jepang-muted">
        Maaf, ada masalah saat memuat halaman ini. Tim kami telah diberi tahu.
        Silakan coba lagi.
      </p>
      <button
        type="button"
        onClick={reset}
        className="jepang-btn-primary"
      >
        Coba lagi
      </button>
    </div>
  );
}
