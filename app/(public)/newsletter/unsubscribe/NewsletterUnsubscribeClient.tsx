"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, MailX } from "lucide-react";
import { toast } from "sonner";
import { useAuth, getAuthLoginPath, isAuthUser } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import AdminCard from "@/components/admin/AdminCard";

type SubscriptionPreview = {
  email: string;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt: string | null;
};

export default function NewsletterUnsubscribeClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const { user, loading, isSignedIn } = useAuth();

  const [preview, setPreview] = useState<SubscriptionPreview | null>(null);
  const [fetching, setFetching] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreview = useCallback(async () => {
    if (!token || !isSignedIn) return;
    setFetching(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/newsletter/subscription?token=${encodeURIComponent(token)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal memuat langganan");
        setPreview(null);
        return;
      }
      setPreview(data.subscription ?? null);
    } catch {
      setError("Gagal memuat langganan");
    } finally {
      setFetching(false);
    }
  }, [token, isSignedIn]);

  useEffect(() => {
    if (!loading && isSignedIn && token) {
      void loadPreview();
    }
  }, [loading, isSignedIn, token, loadPreview]);

  const handleUnsubscribe = async () => {
    if (!token) return;
    setProcessing(true);
    try {
      const res = await fetch(
        `/api/newsletter/subscription?token=${encodeURIComponent(token)}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal berhenti berlangganan");
        return;
      }
      setDone(true);
      toast.success("Anda berhenti berlangganan newsletter");
    } catch {
      toast.error("Gagal berhenti berlangganan");
    } finally {
      setProcessing(false);
    }
  };

  if (!token) {
    return (
      <PageShell>
        <AdminCard title="Berhenti berlangganan" variant="panel">
          <p className="text-muted-foreground">Link tidak valid atau token hilang.</p>
        </AdminCard>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell>
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-jepang-navy" aria-hidden />
        </div>
      </PageShell>
    );
  }

  if (!isSignedIn || !isAuthUser(user)) {
    const returnUrl = `/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
    return (
      <PageShell>
        <AdminCard title="Login diperlukan" variant="panel">
          <p className="text-muted-foreground mb-4">
            Untuk berhenti berlangganan, masuk dengan akun yang menggunakan email yang sama
            dengan langganan newsletter Anda.
          </p>
          <Button asChild className="bg-jepang-navy hover:bg-jepang-navy/90">
            <Link href={`${getAuthLoginPath()}?redirect_url=${encodeURIComponent(returnUrl)}`}>
              Masuk untuk melanjutkan
            </Link>
          </Button>
        </AdminCard>
      </PageShell>
    );
  }

  if (done) {
    return (
      <PageShell>
        <AdminCard title="Berhenti berlangganan" variant="panel">
          <p className="text-muted-foreground">
            Anda tidak akan menerima email newsletter lagi. Anda masih bisa berlangganan ulang
            kapan saja dari footer situs.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/">Kembali ke beranda</Link>
          </Button>
        </AdminCard>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <AdminCard title="Berhenti berlangganan newsletter" variant="panel">
        {fetching ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Memuat…
          </div>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : preview ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MailX className="h-5 w-5 text-jepang-orange mt-0.5 shrink-0" aria-hidden />
              <div>
                <p className="font-medium text-foreground">{preview.email}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {preview.isActive
                    ? "Langganan aktif — konfirmasi untuk berhenti menerima email newsletter."
                    : "Langganan ini sudah tidak aktif."}
                </p>
              </div>
            </div>
            {preview.isActive ? (
              <Button
                variant="destructive"
                onClick={handleUnsubscribe}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden />
                    Memproses…
                  </>
                ) : (
                  "Ya, berhenti berlangganan"
                )}
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href="/">Kembali ke beranda</Link>
              </Button>
            )}
          </div>
        ) : null}
      </AdminCard>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[60vh] flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}
