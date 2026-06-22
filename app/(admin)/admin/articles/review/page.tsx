"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, X, ChevronLeft, ChevronRight, CheckSquare, Users } from "lucide-react";
import AdminCard from "@/components/admin/AdminCard";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminStatCards from "@/components/admin/AdminStatCards";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { THIN_SCROLLBAR_CLASS } from "@/components/ui/thin-scrollbar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";

export default function AdminReviewArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState<{ totalReview: number; contributorsWaiting: number } | null>(
    null,
  );
  const [statsLoading, setStatsLoading] = useState(true);
  const PER_PAGE = 10;

  useEffect(() => {
    fetch("/api/admin/articles/review/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    loadArticles(1);
  }, []);

  const loadArticles = async (pageNum = 1) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(pageNum),
      limit: String(PER_PAGE),
    });
    const data = await fetch(`/api/admin/articles/pending?${params}`).then((r) =>
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
    setSelected((prev: any) => {
      if (!prev) return null;
      return list.find((article: any) => article.id === prev.id) || null;
    });
    setLoading(false);
  };

  const handleApprove = async (articleId: string) => {
    try {
      await fetch(`/api/admin/articles/${articleId}/approve`, {
        method: "POST",
      });

      toast.success("Artikel berhasil disetujui dan dipublikasikan");
      setSelected(null);
      await loadArticles(page);
      fetch("/api/admin/articles/review/stats")
        .then((r) => r.json())
        .then(setStats);
    } catch {
      toast.error("Gagal menyetujui artikel");
    }
  };

  const handleReject = async (articleId: string) => {
    if (!rejectNote.trim()) {
      toast.error("Catatan penolakan wajib diisi");
      return;
    }

    try {
      await fetch(`/api/admin/articles/${articleId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: rejectNote }),
      });

      toast.success("Artikel berhasil ditolak");
      setSelected(null);
      setRejectNote("");
      await loadArticles(page);
      fetch("/api/admin/articles/review/stats")
        .then((r) => r.json())
        .then(setStats);
    } catch {
      toast.error("Gagal menolak artikel");
    }
  };

  return (
    <AdminPageLayout
      testId="admin-review-page"
      label="ANTRIAN REVIEW"
      title="Artikel Menunggu Review"
    >
      <AdminStatCards
        loading={statsLoading}
        skeletonCount={2}
        gridClassName="grid grid-cols-1 sm:grid-cols-2 gap-4"
        items={[
          {
            label: "Total Review",
            value: stats?.totalReview ?? totalItems,
            icon: CheckSquare,
            highlight: true,
            testId: "stat-total-review",
          },
          {
            label: "Kontributor Menunggu",
            value: stats?.contributorsWaiting ?? 0,
            icon: Users,
            testId: "stat-kontributor-menunggu",
          },
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <AdminCard
            title={`ANTRIAN (${loading ? "..." : totalItems})`}
            variant="list"
            noPadding
          >
            {loading ? (
              <div className="divide-y divide-jepang-border">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="w-full p-4">
                    <SkeletonBox height="1rem" width="80%" />
                    <div className="mt-2">
                      <SkeletonBox height="0.8rem" width="40%" />
                    </div>
                  </div>
                ))}
              </div>
            ) : articles.length > 0 ? (
              <>
                <div className="divide-y divide-jepang-border">
                  {articles.map((article: any) => (
                    <button
                      key={article.id}
                      onClick={() => setSelected(article)}
                      className={`w-full text-left p-4 transition-colors ${
                        selected?.id === article.id
                          ? "border-l-2 border-jepang-red bg-jepang-off-white"
                          : "hover:bg-jepang-off-white"
                      }`}
                      data-testid={`queue-article-${article.id}`}
                    >
                      <p className="font-semibold text-sm line-clamp-2">
                        {article.title}
                      </p>

                      <p className="text-xs text-jepang-muted font-mono uppercase tracking-wider mt-1">
                        OLEH {article.author?.name}
                      </p>
                    </button>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-jepang-border p-3">
                    <p className="text-[11px] text-jepang-muted font-mono uppercase tracking-wider">
                      Halaman {page}/{totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => loadArticles(page - 1)}
                        data-testid="review-prev-page"
                      >
                        <ChevronLeft size={14} /> Sebelumnya
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => loadArticles(page + 1)}
                        data-testid="review-next-page"
                      >
                        Berikutnya <ChevronRight size={14} />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <AdminEmptyState
                title="Tidak ada artikel yang menunggu review"
              />
            )}
          </AdminCard>
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <AdminCard variant="panel">
              <div className="flex items-center gap-2 mb-3">
                <SkeletonBox height="1rem" width="8rem" />
                <SkeletonBox height="0.9rem" width="40%" />
              </div>

              <SkeletonBox height="2rem" width="60%" className="mb-3" />
              <SkeletonBox height="1rem" width="80%" className="mb-4" />
              <SkeletonBox height="12rem" width="100%" className="mb-4" />
              <SkeletonBox height="6rem" width="100%" />
            </AdminCard>
          ) : selected ? (
            <AdminCard variant="panel" testId="review-detail">
              <div className="flex items-center gap-2 mb-3">
                    <Badge variant="red">MENUNGGU REVIEW</Badge>

                    {selected.author && (
                      <span className="text-xs text-jepang-muted font-mono uppercase tracking-wider">
                        OLEH {selected.author.name} (@{selected.author.username})
                      </span>
                    )}
                  </div>

                  <h2 className="font-heading font-black text-3xl tracking-tighter mb-3">
                    {selected.title}
                  </h2>

                  {selected.excerpt && (
                    <p className="text-jepang-muted mb-4 italic">
                      {selected.excerpt}
                    </p>
                  )}

                  {selected.coverImageUrl && (
                    <img
                      src={selected.coverImageUrl}
                      alt={selected.title}
                      className="w-full max-h-96 object-cover mb-4 border border-jepang-border"
                    />
                  )}

                  <div
                    className={cn(
                      THIN_SCROLLBAR_CLASS,
                      "article-content text-sm max-h-96 overflow-y-auto p-4 bg-jepang-off-white border border-jepang-border mb-6",
                    )}
                    dangerouslySetInnerHTML={{ __html: selected.content }}
                  />

                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={() => handleApprove(selected.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      data-testid="approve-btn"
                    >
                      <Check size={16} strokeWidth={2} /> Setujui & Publikasikan
                    </Button>

                    <div className="space-y-2">
                      <Label>Catatan Penolakan (wajib)</Label>

                      <Textarea
                        rows={3}
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        placeholder="Jelaskan alasan artikel ini ditolak..."
                        data-testid="reject-note-input"
                      />

                      <Button
                        onClick={() => handleReject(selected.id)}
                        className="w-full"
                        data-testid="reject-btn"
                      >
                        <X size={16} strokeWidth={2} /> Tolak Artikel
                      </Button>
                    </div>
                  </div>
            </AdminCard>
          ) : (
            <AdminCard variant="panel">
              <AdminEmptyState title="Pilih artikel untuk direview" />
            </AdminCard>
          )}
        </div>
      </div>
    </AdminPageLayout>
  );
}