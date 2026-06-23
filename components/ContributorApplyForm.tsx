"use client";

import { useEffect, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import {
  canCreateArticles,
  CONTRIBUTOR_APPLY_PATH,
} from "@/lib/contributor";
import type { ContributorApplicationSummary } from "@/lib/contributor-applications";

type StatusResponse = {
  isContributor: boolean;
  application: ContributorApplicationSummary | null;
  contributorApplicationStatus: string | null;
};

export default function ContributorApplyForm() {
  const { user, isLoaded, refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [motivation, setMotivation] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setLoading(false);
      return;
    }
    if (canCreateArticles(user)) {
      router.replace("/submit-article");
      return;
    }

    fetch("/api/contributor/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: StatusResponse | null) => setStatus(data))
      .finally(() => setLoading(false));
  }, [isLoaded, user, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/contributor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivation, portfolioUrl }),
      });
      const data = await parseApiResponse(res);
      if (!res.ok) {
        toast.error(data.error ?? "Gagal mengirim permohonan");
        return;
      }

      toast.success("Permohonan kontributor terkirim");
      await refreshUser();
      setStatus({
        isContributor: false,
        application: data.application,
        contributorApplicationStatus: "PENDING",
      });
    } catch {
      toast.error("Gagal mengirim permohonan");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <SkeletonBox height="2.5rem" width="100%" />
        <SkeletonBox height="8rem" width="100%" />
        <SkeletonBox height="2.5rem" width="100%" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg rounded-lg border border-jepang-border bg-white p-8 shadow-jepang text-center">
        <p className="text-sm text-jepang-muted leading-relaxed mb-6">
          Masuk ke akun Jepangku untuk mengajukan diri sebagai kontributor.
        </p>
        <Link href="/sign-in" className="jepang-btn-primary inline-flex">
          Masuk
        </Link>
      </div>
    );
  }

  const application = status?.application;
  const isPending =
    status?.contributorApplicationStatus === "PENDING" ||
    application?.status === "PENDING";
  const isRejected =
    status?.contributorApplicationStatus === "REJECTED" ||
    application?.status === "REJECTED";

  if (isPending) {
    return (
      <div
        className="mx-auto max-w-lg rounded-lg border border-jepang-border bg-white p-8 shadow-jepang"
        data-testid="contributor-apply-pending"
      >
        <h2 className="font-heading text-xl font-bold text-jepang-navy mb-3">
          Permohonan Sedang Ditinjau
        </h2>
        <p className="text-sm text-jepang-muted leading-relaxed mb-4">
          Tim editorial sedang meninjau permohonan Anda. Anda akan dapat mengunggah
          artikel setelah disetujui.
        </p>
        {application?.motivation && (
          <div className="rounded-md border border-jepang-border bg-jepang-cream/40 p-4 text-sm text-jepang-navy">
            <p className="font-semibold mb-2">Motivasi Anda</p>
            <p className="whitespace-pre-wrap">{application.motivation}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg rounded-lg border border-jepang-border bg-white p-8 shadow-jepang">
      {isRejected && (
        <div
          className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          data-testid="contributor-apply-rejected"
        >
          <p className="font-semibold mb-1">Permohonan sebelumnya ditolak</p>
          {application?.adminNote ? (
            <p className="whitespace-pre-wrap">{application.adminNote}</p>
          ) : (
            <p>Anda dapat mengajukan ulang dengan melengkapi form di bawah.</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" data-testid="contributor-apply-form">
        <div className="space-y-2">
          <Label htmlFor="motivation">Motivasi menjadi kontributor *</Label>
          <Textarea
            id="motivation"
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            placeholder="Ceritakan pengalaman menulis, topik yang ingin Anda bahas, dan alasan ingin berkontribusi di Jepangku…"
            rows={6}
            required
            minLength={20}
            maxLength={2000}
          />
          <p className="text-xs text-jepang-muted">Minimal 20 karakter.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="portfolioUrl">Link portofolio (opsional)</Label>
          <Input
            id="portfolioUrl"
            type="url"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            placeholder="https://medium.com/@username"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={submitting || motivation.trim().length < 20}
        >
          {submitting ? "Mengirim…" : "Kirim Permohonan"}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-jepang-muted">
        Butuh bantuan? Kunjungi halaman{" "}
        <Link href={CONTRIBUTOR_APPLY_PATH} className="text-jepang-orange hover:underline">
          kontributor
        </Link>
        .
      </p>
    </div>
  );
}
