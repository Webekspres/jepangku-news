"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Eye,
  Send,
  AlertTriangle,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ContributorGate from "@/components/ContributorGate";
import PreviewArticleBreadcrumb from "@/components/articles/PreviewArticleBreadcrumb";
import { isAdminPreviewContext } from "@/lib/preview-article-nav";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  string,
  { label: string; bannerClass: string; icon: React.ReactNode; description: string }
> = {
  DRAFT: {
    label: "DRAF",
    bannerClass: "bg-jepang-off-white border-b border-jepang-border text-jepang-navy",
    icon: <Edit size={14} strokeWidth={1.5} />,
    description: "Artikel ini masih berupa draft dan belum dikirim untuk review.",
  },
  PENDING_REVIEW: {
    label: "MENUNGGU REVIEW",
    bannerClass: "bg-amber-50 border-b-2 border-amber-400 text-amber-800",
    icon: <Clock size={14} strokeWidth={1.5} />,
    description: "Artikel sedang dalam antrian review oleh admin.",
  },
  REJECTED: {
    label: "DITOLAK",
    bannerClass: "bg-red-50 border-b-2 border-jepang-red text-jepang-red",
    icon: <XCircle size={14} strokeWidth={1.5} />,
    description: "Artikel ini ditolak oleh admin. Edit dan kirim ulang.",
  },
};

function PreviewBanner({
  status,
  rejectionNote,
  articleId,
  onSubmit,
  submitting,
}: {
  status: string;
  rejectionNote?: string | null;
  articleId: string;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;

  return (
    <div className={`sticky top-0 z-40 ${cfg.bannerClass}`}>
      <div className="px-4 mx-auto max-w-7xl py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <AlertTriangle size={14} strokeWidth={1.5} className="shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">
            PRATINJAU
          </span>
          <span className="text-xs opacity-70 mx-1">·</span>
          <span className="text-xs font-mono uppercase tracking-wider">
            {cfg.label}
          </span>
          <span className="text-xs opacity-60 hidden sm:inline truncate">
            &nbsp;— {cfg.description}
          </span>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-xs"
          >
            <Link href={`/edit-article/${articleId}`}>
              <Edit size={12} strokeWidth={1.5} className="mr-1" />
              Ubah
            </Link>
          </Button>

          {(status === "DRAFT" || status === "REJECTED") && (
            <Button
              size="sm"
              onClick={onSubmit}
              disabled={submitting}
              className="text-xs"
            >
              <Send size={12} strokeWidth={1.5} className="mr-1" />
              {submitting ? "Mengirim…" : "Kirim untuk Review"}
            </Button>
          )}
        </div>
      </div>

      {rejectionNote && (
        <div className="px-4 mx-auto max-w-7xl pb-3">
          <p className="text-xs font-mono text-jepang-red bg-red-50 border border-jepang-red/30 px-3 py-2">
            <span className="font-bold">Catatan admin:</span> {rejectionNote}
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PreviewArticlePage() {
  const { id } = useParams<{ id: string }>()!;
  const searchParams = useSearchParams();
  const fromAdmin = isAdminPreviewContext(searchParams);
  const { user } = useAuth();
  const router = useRouter();

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user === false) {
      router.replace("/sign-in");
      return;
    }
    if (user === null) return;

    fetch(`/api/articles/preview/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setArticle)
      .catch(() => {
        toast.error("Artikel tidak ditemukan atau kamu tidak punya akses");
        router.replace(fromAdmin ? "/admin/articles" : "/my-articles");
      })
      .finally(() => setLoading(false));
  }, [id, user, router, fromAdmin]);

  const handleSubmitForReview = async () => {
    if (!article) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/articles/${article.slug}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PENDING_REVIEW" }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Gagal mengirim artikel");
      }
      toast.success("Artikel berhasil dikirim untuk review");
      router.push("/my-articles");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal mengirim");
    } finally {
      setSubmitting(false);
    }
  };

  // Auth loading
  if (user === null || (loading && !article)) {
    return (
      <div className="bg-white min-h-screen">
        <div className="h-12 bg-jepang-border animate-pulse" />
        <div className="px-4 mx-auto max-w-4xl py-12 space-y-6">
          <div className="h-4 w-24 bg-jepang-border animate-pulse" />
          <div className="h-14 w-full max-w-2xl bg-jepang-border animate-pulse" />
          <div className="h-5 w-full bg-jepang-border animate-pulse" />
          <div className="h-5 w-5/6 bg-jepang-border animate-pulse" />
          <div className="h-64 w-full bg-jepang-border animate-pulse" />
        </div>
      </div>
    );
  }

  if (user === false || !article) return null;

  const rejectionNote =
    article.status === "REJECTED" ? article.reviews?.[0]?.note ?? null : null;

  return (
    <ContributorGate>
    <div className="bg-white min-h-screen" data-testid="preview-article-page">
      {/* Sticky preview banner */}
      <PreviewBanner
        status={article.status}
        rejectionNote={rejectionNote}
        articleId={article.id}
        onSubmit={handleSubmitForReview}
        submitting={submitting}
      />

      <article className="px-4 mx-auto max-w-7xl py-12">
        <div className="max-w-4xl mx-auto">
          <PreviewArticleBreadcrumb
            fromAdmin={fromAdmin}
            articleTitle={article.title}
          />

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {article.category && (
              <Badge variant="red">{article.category.name}</Badge>
            )}
            <Badge variant="muted" className="font-mono text-[10px] uppercase tracking-widest">
              {STATUS_CONFIG[article.status]?.label ?? article.status}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-6 leading-[1.05]">
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-xl text-jepang-muted leading-relaxed mb-6 font-light">
              {article.excerpt}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 py-4 border-y border-jepang-border text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-foreground text-white flex items-center justify-center font-bold text-xs">
                {article.author?.name?.charAt(0).toUpperCase() || "J"}
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {article.author?.name || "Jepangku"}
                </p>
                <p className="text-[10px] uppercase tracking-wider font-mono text-jepang-muted">
                  PENULIS
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-jepang-muted font-mono text-xs uppercase tracking-wider">
              <Eye size={14} strokeWidth={1.5} />
              {article.viewCount ?? 0} dilihat
            </div>

            <div className="flex items-center gap-1 text-jepang-muted font-mono text-xs uppercase tracking-wider">
              <Calendar size={14} strokeWidth={1.5} />
              {article.createdAt
                ? new Date(article.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </div>
          </div>

          {/* Cover image */}
          {article.coverImageUrl && (
            <div className="my-8 -mx-4 md:mx-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.coverImageUrl}
                alt={article.title}
                className="w-full max-h-[600px] object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
            data-testid="preview-content"
          />

          {/* Tags */}
          {article.tags?.length > 0 && (
            <div className="mt-8 pt-6 border-t border-jepang-border">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted mb-3">
                Tag
              </p>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag: any) => (
                  <Badge key={tag.id}>#{tag.name}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Bottom action bar */}
          <div className="mt-10 pt-6 border-t border-jepang-border flex flex-col sm:flex-row gap-3">
            <Button variant="outline" asChild>
              <Link href="/my-articles">
                <ArrowLeft size={14} strokeWidth={1.5} className="mr-1" />
                Kembali ke My Articles
              </Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href={`/edit-article/${article.id}`}>
                <Edit size={14} strokeWidth={1.5} className="mr-1" />
                Edit Artikel
              </Link>
            </Button>

            {(article.status === "DRAFT" || article.status === "REJECTED") && (
              <Button onClick={handleSubmitForReview} disabled={submitting}>
                <Send size={14} strokeWidth={1.5} className="mr-1" />
                {submitting ? "Mengirim…" : "Kirim untuk Review"}
              </Button>
            )}
          </div>
        </div>
      </article>
    </div>
    </ContributorGate>
  );
}
