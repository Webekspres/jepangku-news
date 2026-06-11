'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/');
      return;
    }
    if (!loading && user && (user as { role?: string }).role !== 'ADMIN') {
      router.push('/');
    }
  }, [user, loading, isLoaded, isSignedIn, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!isLoaded || !isSignedIn || loading || !user || (user as { role?: string }).role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50" data-testid="admin-shell">
      {/* Sidebar desktop — full height kiri (NextUI dashboard pattern) */}
      <div className="hidden min-h-0 shrink-0 lg:flex">
        <AdminSidebar />
      </div>

      {/* Sidebar mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Tutup menu"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 shadow-xl">
            <AdminSidebar onNavigate={() => setSidebarOpen(false)} className="h-full" />
          </div>
        </div>
      )}

      {/* Kolom kanan: topbar + konten scroll */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</main>
      </div>
    </div>
  );
}
