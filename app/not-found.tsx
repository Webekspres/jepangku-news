export const dynamic = 'force-static';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F4F5]">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D90429] mb-4">404</p>
        <h1 className="font-heading font-black text-6xl tracking-tighter mb-4">Halaman tidak ditemukan</h1>
        <p className="text-[#52525B] mb-8">Halaman yang kamu cari tidak ada atau sudah dipindahkan.</p>
        <Button asChild>
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    </div>
  );
}
