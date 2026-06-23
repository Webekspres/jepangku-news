"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  Send,
  Globe,
  FileText,
  History,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth, isAuthUser } from "@/contexts/AuthContext";
import { isAdminAuthor } from "@/lib/article-workflow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ArticleCardSkeleton from "@/components/skeletons/ArticleCardSkeleton";
import { ConfirmModal, useConfirm } from "@/components/ui/confirm-modal";
import {
  ArticleActivityModal,
  useArticleActivity,
} from "@/components/ui/article-activity-modal";
import ContributorGate from "@/components/ContributorGate";

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

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draf",
  PENDING_REVIEW: "Menunggu",
  PUBLISHED: "Dipublikasikan",
  REJECTED: "Ditolak",
  ARCHIVED: "Diarsipkan",
};

export default function MyArticlesPage() {
  const { user } = useAuth();
  const isAdmin = isAuthUser(user) && isAdminAuthor(user);
  const [articles, setArticles] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const router = useRouter();
  const { confirm, confirmProps } = useConfirm();
  const { openActivity, modalProps: activityModalProps } = useArticleActivity();
  const PER_PAGE = 10;

  useEffect(() => {
    loadArticles(1, filter);
  }, [filter]);

  const loadArticles = async (pageNum = 1, activeFilter = filter) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(pageNum),
      limit: String(PER_PAGE),
    });
    if (activeFilter !== "all") {
      params.set("status", activeFilter);
    }
    const data = await fetch(`/api/articles/my?${params.toString()}`).then((r) =>
      r.json(),
    );

    const list = Array.isArray(data?.articles)
      ? data.articles
      : Array.isArray(data)
        ? data
        : [];

    setArticles(list);
    setPage(Number(data?.page || pageNum));
    setTotalPages(Number(data?.totalPages || 1));
    setTotalItems(Number(data?.total || list.length));
    setLoading(false);
  };

  const handleDelete = async (articleId: string, slug: string) => {
    confirm({
      title: "Hapus Artikel?",
      description:
        "Artikel ini akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.",
      confirmLabel: "Hapus",
      variant: "danger",
      onConfirm: async () => {
        await fetch(`/api/articles/${slug}/delete`, { method: "DELETE" }).then(
          (r) => {
            if (!r.ok)
              return r.json().then((e: any) => {
                throw new Error(e.error);
              });
          },
        );
        toast.success("Artikel dihapus");
        await loadArticles(page, filter);
      },
    });
  };

  const handleSubmitForReview = async (article: any) => {
    try {
      const res = await fetch(`/api/articles/${article.slug}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PENDING_REVIEW" }),
      });
      if (!res.ok) {
        const e = await parseApiResponse(res);
        throw new Error(e.error || "Gagal mengirim");
      }
      toast.success("Artikel dikirim untuk review");
      await loadArticles(page, filter);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal mengirim");
    }
  };

  const handlePublish = async (article: any) => {
    try {
      const res = await fetch(`/api/articles/${article.slug}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" }),
      });
      if (!res.ok) {
        const e = await parseApiResponse(res);
        throw new Error(e.error || "Gagal mempublikasikan");
      }
      toast.success("Artikel berhasil dipublikasikan");
      await loadArticles(page, filter);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal mempublikasikan");
    }
  };

  return (
    <ContributorGate>
    <div className="bg-white min-h-screen" data-testid="my-articles-page">
      <ConfirmModal {...confirmProps} />
      <ArticleActivityModal {...activityModalProps} />

      <section className="border-b border-jepang-border bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl py-12">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-red mb-2">
                ARTIKEL SAYA
              </p>
              <h1 className="font-heading font-black text-4xl tracking-tighter">
                Artikel Kamu
              </h1>
            </div>
            <Button asChild data-testid="new-article-btn">
              <Link href="/submit-article">
                <Plus size={16} strokeWidth={1.5} /> Artikel Baru
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {["all", "DRAFT", "PENDING_REVIEW", "PUBLISHED", "REJECTED"].map(
            (s) => (
              <Button
                key={s}
                size="sm"
                variant={filter === s ? "black" : "outline"}
                onClick={() => {
                  setFilter(s);
                  setPage(1);
                }}
                data-testid={`filter-${s}`}
              >
                {s === "all" ? "Semua" : STATUS_LABELS[s]}
              </Button>
            ),
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <ArticleCardSkeleton key={i} variant="compact" />
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="space-y-3">
            {articles.map((article: any) => (
              <div
                key={article.id}
                className="bg-white border border-jepang-border hover:border-foreground p-4 transition-colors"
                data-testid={`my-article-${article.id}`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                  {/* Article info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={STATUS_BADGE[article.status] || "muted"}>
                        {STATUS_LABELS[article.status] || article.status}
                      </Badge>
                      {article.category && (
                        <Badge>{article.category.name}</Badge>
                      )}
                    </div>
                    <h3 className="font-heading font-bold text-lg">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-sm text-jepang-muted line-clamp-1 mt-1">
                        {article.excerpt}
                      </p>
                    )}
                    {/* Inline rejection preview */}
                    {article.status === "REJECTED" &&
                      article.reviews?.[0]?.note && (
                        <p className="text-xs text-jepang-red mt-1 font-mono line-clamp-1">
                          ✕ {article.reviews[0].note}
                        </p>
                      )}
                    {article.status === "PENDING_REVIEW" && (
                      <p className="text-xs text-jepang-muted mt-2 font-mono">
                        Artikel sedang dalam antrian review dan tidak dapat diedit.
                      </p>
                    )}

                    {article.lastEditedBy?.role === "ADMIN" && (
                      <p className="text-xs text-jepang-muted mt-1">
                        Terakhir diedit admin:{" "}
                        <span className="font-semibold text-foreground">
                          {article.lastEditedBy.name}
                        </span>
                        {article.lastEditedAt && (
                          <span className="font-mono ml-1">
                            ·{" "}
                            {new Date(article.lastEditedAt).toLocaleDateString(
                              "id-ID",
                            )}
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    {(article._count?.reviews > 0 ||
                      article._count?.revisions > 0 ||
                      article.lastEditedBy?.role === "ADMIN") && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          openActivity(article.slug, article.title)
                        }
                        title="Riwayat revisi & review"
                        data-testid={`history-${article.id}`}
                      >
                        <History size={14} strokeWidth={1.5} />
                      </Button>
                    )}

                    {/* Preview — for any non-published article */}
                    {article.status !== "PUBLISHED" &&
                      article.status !== "ARCHIVED" && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            router.push(`/preview-article/${article.id}`)
                          }
                          title="Lihat preview artikel"
                          data-testid={`preview-${article.id}`}
                        >
                          <Eye size={14} strokeWidth={1.5} />
                        </Button>
                      )}

                    {(article.status === "DRAFT" ||
                      article.status === "REJECTED") && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            router.push(`/edit-article/${article.id}`)
                          }
                          title="Edit artikel"
                          data-testid={`edit-${article.id}`}
                        >
                          <Edit size={14} strokeWidth={1.5} />
                        </Button>
                        {isAdmin ? (
                          <Button
                            size="icon"
                            onClick={() => handlePublish(article)}
                            data-testid={`publish-${article.id}`}
                            title="Publikasikan artikel"
                          >
                            <Globe size={14} strokeWidth={1.5} />
                          </Button>
                        ) : (
                          <Button
                            size="icon"
                            onClick={() => handleSubmitForReview(article)}
                            data-testid={`submit-${article.id}`}
                            title="Kirim untuk review"
                          >
                            <Send size={14} strokeWidth={1.5} />
                          </Button>
                        )}
                      </>
                    )}

                    {article.status !== "PUBLISHED" && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(article.id, article.slug)}
                        className="hover:border-jepang-red hover:text-jepang-red"
                        data-testid={`delete-${article.id}`}
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </Button>
                    )}

                    {article.status === "PUBLISHED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        data-testid={`view-${article.id}`}
                      >
                        <Link href={`/articles/${article.slug}`}>Lihat</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-xs text-jepang-muted font-mono uppercase tracking-wider">
                  Halaman {page}/{totalPages} - {totalItems} item
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => loadArticles(page - 1, filter)}
                    data-testid="my-articles-prev-page"
                  >
                    <ChevronLeft size={14} strokeWidth={1.5} /> Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => loadArticles(page + 1, filter)}
                    data-testid="my-articles-next-page"
                  >
                    Berikutnya <ChevronRight size={14} strokeWidth={1.5} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-24" data-testid="no-my-articles">
            <FileText
              size={48}
              strokeWidth={1.5}
              className="mx-auto mb-4 text-jepang-muted"
            />
            <p className="font-heading font-bold text-2xl mb-2">
              Belum ada artikel
              {filter !== "all" && ` dengan status ${STATUS_LABELS[filter]}`}
            </p>
            <p className="text-jepang-muted mb-4">
              Mulai menulis dan bagikan ceritamu!
            </p>
            <Button asChild>
              <Link href="/submit-article">
                <Plus size={16} strokeWidth={1.5} /> Kirim Artikel
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
    </ContributorGate>
  );
}
