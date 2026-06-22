"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth, getAuthLoginPath, isAuthUser } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

type CategorySubscribeButtonProps = {
  categorySlug: string;
  categoryName?: string;
};

export default function CategorySubscribeButton({
  categorySlug,
  categoryName,
}: CategorySubscribeButtonProps) {
  const { user, loading, isSignedIn } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadStatus = useCallback(async () => {
    if (!isSignedIn) {
      setSubscribed(false);
      setChecking(false);
      return;
    }
    setChecking(true);
    try {
      const res = await fetch("/api/category-subscriptions");
      const data = await res.json();
      const list = Array.isArray(data.subscriptions) ? data.subscriptions : [];
      setSubscribed(list.some((s: { categorySlug: string }) => s.categorySlug === categorySlug));
    } catch {
      setSubscribed(false);
    } finally {
      setChecking(false);
    }
  }, [categorySlug, isSignedIn]);

  useEffect(() => {
    if (!loading) void loadStatus();
  }, [loading, loadStatus]);

  const toggle = async () => {
    if (!isSignedIn || !isAuthUser(user)) {
      toast.error("Masuk dulu untuk mengikuti kategori");
      return;
    }

    setSubmitting(true);
    try {
      if (subscribed) {
        const res = await fetch(
          `/api/category-subscriptions?categorySlug=${encodeURIComponent(categorySlug)}`,
          { method: "DELETE" },
        );
        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error ?? "Gagal berhenti mengikuti");
          return;
        }
        setSubscribed(false);
        toast.success("Berhenti mengikuti kategori");
      } else {
        const res = await fetch("/api/category-subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categorySlug }),
        });
        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error ?? "Gagal mengikuti kategori");
          return;
        }
        setSubscribed(true);
        toast.success(
          categoryName
            ? `Mengikuti ${categoryName} — notifikasi artikel baru aktif`
            : "Mengikuti kategori — notifikasi artikel baru aktif",
        );
      }
    } catch {
      toast.error("Gagal memperbarui langganan kategori");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || checking) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Memuat…
      </Button>
    );
  }

  if (!isSignedIn) {
    return (
      <Button variant="outline" size="sm" asChild className="gap-2">
        <a href={getAuthLoginPath()}>
          <Bell size={14} aria-hidden />
          Ikuti kategori
        </a>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={subscribed ? "secondary" : "default"}
      size="sm"
      className="gap-2"
      disabled={submitting}
      onClick={toggle}
      data-testid={`category-subscribe-${categorySlug}`}
    >
      {submitting ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : subscribed ? (
        <BellOff size={14} aria-hidden />
      ) : (
        <Bell size={14} aria-hidden />
      )}
      {subscribed ? "Mengikuti" : "Ikuti kategori"}
    </Button>
  );
}
