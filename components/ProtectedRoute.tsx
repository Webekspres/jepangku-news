'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) return; // still loading

    if (user === false) {
      router.replace('/login');
      return;
    }

    if (requireAdmin && (user as any).role !== 'ADMIN') {
      router.replace('/');
    }
  }, [user, requireAdmin, router]);

  // Loading state
  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div
            className="text-2xl font-black tracking-tighter mb-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <span className="text-[#D90429]">Jepang</span>
            <span className="text-[#0A0A0A]">ku</span>
          </div>
          <p className="text-sm text-[#52525B] uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (user === false) return null;

  // Not admin when required
  if (requireAdmin && (user as any).role !== 'ADMIN') return null;

  return <>{children}</>;
}
