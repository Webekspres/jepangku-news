"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Globe, Pencil } from "lucide-react";
import AdminCard from "@/components/admin/AdminCard";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { THIN_SCROLLBAR_CLASS } from "@/components/ui/thin-scrollbar";
import { cn } from "@/lib/utils";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";

const STATUS_BADGE: Record<
  string,
  "success" | "warning" | "red" | "muted" | "black"
> = {
  DRAFT: "muted",
  PENDING_REVIEW: "warning",
  PUBLISHED: "success",
  REJECTED: "red",
  ARCHIVED: "muted",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draf",
  PENDING_REVIEW: "Menunggu Review",
  PUBLISHED: "Dipublikasikan",
  REJECTED: "Ditolak",
  ARCHIVED: "Diarsipkan",
};

export default function AdminArticleViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/articles/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setArticle)
      .catch(() => {
        toast.error("Gagal memuat artikel");
        router.push("/admin/articles");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <AdminPageLayout
        testId="admin-article-view-page"
        backHref="/admin/articles"
        backLabel="Kembali ke Artikel"
        title="Lihat Artikel"
      >
        <AdminCard>
          <div className="space-y-4">
            <SkeletonBox height="1rem" width="30%" />
            <SkeletonBox height="2rem" width="70%" />
            <SkeletonBox height="12rem" width="100%" />
          </div>
        </AdminCard>
      </AdminPageLayout>
    );
  }

  if (!article) return null;

  const rejectionNote =
    article.status === "REJECTED" ? article.reviews?.[0]?.note ?? null : null;

  return (
    <AdminPageLayout
      testId="admin-article-view-page"
      backHref="/admin/articles"
      backLabel="Kembali ke Artikel"
      title="Lihat Artikel"
    >
        <AdminCard testId="admin-article-detail">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant={STATUS_BADGE[article.status] || "muted"}>
                {STATUS_LABEL[article.status] || article.status}
              </Badge>
              {article.author && (
                <span className="text-xs text-jepang-muted font-mono uppercase tracking-wider">
                  OLEH {article.author.name} (@{article.author.username})
                </span>
              )}
              {article.category && (
                <span className="text-xs text-jepang-muted font-mono uppercase tracking-wider">
                  · {article.category.name}
                </span>
              )}
            </div>

            <h2 className="font-heading font-black text-3xl tracking-tighter mb-3">
              {article.title}
            </h2>

            {article.excerpt && (
              <p className="text-jepang-muted mb-4 italic">{article.excerpt}</p>
            )}

            {article.coverImageUrl && (
              <img
                src={article.coverImageUrl}
                alt={article.title}
                className="w-full max-h-96 object-cover mb-4 border border-jepang-border"
              />
            )}

            <div
              className={cn(
                THIN_SCROLLBAR_CLASS,
                "article-content text-sm max-h-128 overflow-y-auto p-4 bg-jepang-off-white border border-jepang-border mb-6",
              )}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {rejectionNote && (
              <p className="text-xs font-mono text-jepang-red bg-red-50 border border-jepang-red/30 px-3 py-2 mb-6">
                <span className="font-bold">Catatan penolakan:</span> {rejectionNote}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/admin/articles/${article.id}/edit`}
                  data-testid="edit-article-btn"
                >
                  <Pencil size={14} className="mr-1" /> Ubah
                </Link>
              </Button>
              {article.status === "PUBLISHED" && article.slug && (
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={`/articles/${article.slug}`}
                    target="_blank"
                    data-testid="view-live-article-btn"
                  >
                    <Globe size={14} className="mr-1" /> Lihat di Situs
                  </Link>
                </Button>
              )}
            </div>
        </AdminCard>
    </AdminPageLayout>
  );
}
