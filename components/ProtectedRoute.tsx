"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getAuthLoginPath } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { user, isLoaded, isSignedIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace(getAuthLoginPath());
      return;
    }
    if (loading || user === null) return;

    if (requireAdmin && (user as { role?: string }).role !== "ADMIN") {
      router.replace("/");
    }
  }, [user, isLoaded, isSignedIn, loading, requireAdmin, router]);

  if (!isLoaded || (isSignedIn && (loading || user === null))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div
            className="text-2xl font-black tracking-tighter mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span className="text-jepang-red">Jepang</span>
            <span className="text-foreground">ku</span>
          </div>
          <p
            className="text-sm text-jepang-muted uppercase tracking-wider"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Memuat...
          </p>
        </div>
      </div>
    );
  }

  if (!isSignedIn || user === false) return null;

  // Not admin when required
  if (requireAdmin && (user as any).role !== "ADMIN") return null;

  return <>{children}</>;
}
