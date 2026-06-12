"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { THIN_SCROLLBAR_CLASS } from "@/components/ui/thin-scrollbar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";

export default function AdminReviewArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const PER_PAGE = 10;

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
    } catch {
      toast.error("Gagal menolak artikel");
    }
  };

  return (
    <div className="bg-white min-h-screen" data-testid="admin-review-page">
      <section className="border-b border-jepang-border bg-jepang-off-white">
        <div className="w-full px-4 lg:px-6 py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-red mb-2">
            ANTRIAN REVIEW
          </p>

          <h1 className="font-heading font-black text-4xl tracking-tighter">
            Artikel Menunggu Review
          </h1>
        </div>
      </section>

      <div className="w-full px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] mb-3">
              ANTRIAN ({loading ? "..." : totalItems})
            </h3>

            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="w-full p-4 border">
                  <SkeletonBox height="1rem" width="80%" />
                  <div className="mt-2">
                    <SkeletonBox height="0.8rem" width="40%" />
                  </div>
                </div>
              ))
            ) : articles.length > 0 ? (
              <>
                {articles.map((article: any) => (
                  <button
                    key={article.id}
                    onClick={() => setSelected(article)}
                    className={`w-full text-left p-4 border transition-colors ${
                      selected?.id === article.id
                        ? "border-jepang-red bg-jepang-off-white"
                        : "border-jepang-border hover:border-foreground"
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
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
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
              <div className="text-jepang-muted">
                Tidak ada artikel yang menunggu review
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {loading ? (
              <Card className="border border-foreground">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <SkeletonBox height="1rem" width="8rem" />
                    <SkeletonBox height="0.9rem" width="40%" />
                  </div>

                  <SkeletonBox height="2rem" width="60%" className="mb-3" />
                  <SkeletonBox height="1rem" width="80%" className="mb-4" />
                  <SkeletonBox height="12rem" width="100%" className="mb-4" />
                  <SkeletonBox height="6rem" width="100%" />
                </CardContent>
              </Card>
            ) : selected ? (
              <Card
                className="border border-foreground"
                data-testid="review-detail"
              >
                <CardContent className="p-6">
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
                </CardContent>
              </Card>
            ) : (
              <div className="bg-jepang-off-white border border-jepang-border p-12 text-center">
                <p className="text-jepang-muted">
                  Pilih artikel untuk direview
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}