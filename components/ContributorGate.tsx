"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  canCreateArticles,
  CONTRIBUTOR_APPLY_PATH,
} from "@/lib/contributor";

export default function ContributorGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user && !canCreateArticles(user)) {
      router.replace(CONTRIBUTOR_APPLY_PATH);
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <p className="text-jepang-muted text-sm">Memuat…</p>
      </div>
    );
  }

  if (user && !canCreateArticles(user)) {
    return null;
  }

  return <>{children}</>;
}
