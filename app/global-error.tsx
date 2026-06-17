'use client';

import { captureException } from '@/lib/monitoring';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void captureException(error);
  }, [error]);

  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-semibold">Terjadi kesalahan</h1>
        <p className="text-muted-foreground max-w-md text-sm">
          Maaf, ada masalah saat memuat halaman. Tim kami telah diberi tahu.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Coba lagi
        </button>
      </body>
    </html>
  );
}
