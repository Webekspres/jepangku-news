"use client";
export const dynamic = "force-dynamic";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  MessageSquare,
  Trash2,
  EyeOff,
  Eye,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import { ConfirmModal, useConfirm } from "@/components/ui/confirm-modal";

interface AdminComment {
  id: string;
  content: string;
  status: "VISIBLE" | "HIDDEN";
  isDeleted: boolean;
  isEdited: boolean;
  parentId: string | null;
  createdAt: string;
  targetType: "ARTICLE" | "POLL" | "QUIZ";
  targetId: string;
  targetTitle: string;
  targetSlug: string | null;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
    isAdmin: boolean;
  };
}

const STATUS_FILTERS = [
  { value: "", label: "Semua" },
  { value: "VISIBLE", label: "Tampil" },
  { value: "HIDDEN", label: "Disembunyikan" },
  { value: "DELETED", label: "Dihapus" },
];

const TYPE_FILTERS = [
  { value: "", label: "Semua Tipe" },
  { value: "ARTICLE", label: "Artikel" },
  { value: "POLL", label: "Polling" },
  { value: "QUIZ", label: "Kuis" },
];

const TARGET_PATH: Record<AdminComment["targetType"], string> = {
  ARTICLE: "/articles",
  POLL: "/polls",
  QUIZ: "/quizzes",
};

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [targetType, setTargetType] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { confirm, confirmProps } = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (status) sp.set("status", status);
      if (targetType) sp.set("targetType", targetType);
      if (query) sp.set("q", query);
      sp.set("page", String(page));
      const data = await fetch(`/api/admin/comments?${sp.toString()}`).then((r) => r.json());
      setComments(Array.isArray(data.comments) ? data.comments : []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [status, targetType, query, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(search.trim());
  };

  const moderate = async (id: string, action: "hide" | "unhide") => {
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(action === "hide" ? "Komentar disembunyikan" : "Komentar ditampilkan");
      load();
    } catch (e: any) {
      toast.error(e.message || "Gagal memoderasi");
    }
  };

  const remove = (id: string) => {
    confirm({
      title: "Hapus komentar permanen?",
      description: "Komentar beserta balasannya akan dihapus permanen dari database.",
      confirmLabel: "Hapus Permanen",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error((await res.json()).error);
          toast.success("Komentar dihapus permanen");
          load();
        } catch (e: any) {
          toast.error(e.message || "Gagal menghapus");
        }
      },
    });
  };

  return (
    <div className="bg-white min-h-screen" data-testid="admin-comments-page">
      <ConfirmModal {...confirmProps} />

      <section className="border-b-2 border-foreground bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-red mb-2">
            MODERASI KOMENTAR
          </p>

          <h1 className="font-heading font-black text-4xl tracking-tighter flex items-center gap-3">
            <MessageSquare size={36} strokeWidth={1.5} /> Komentar
          </h1>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex flex-wrap gap-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  setStatus(f.value);
                  setPage(1);
                }}
                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border transition-colors ${
                  status === f.value
                    ? "border-foreground bg-foreground text-white"
                    : "border-jepang-border hover:border-foreground"
                }`}
                data-testid={`filter-status-${f.value || "all"}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  setTargetType(f.value);
                  setPage(1);
                }}
                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border transition-colors ${
                  targetType === f.value
                    ? "border-jepang-red bg-jepang-red text-white"
                    : "border-jepang-border hover:border-foreground"
                }`}
                data-testid={`filter-type-${f.value || "all"}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 ml-auto">
            <Input
              type="text"
              placeholder="Cari isi komentar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56"
              data-testid="comment-search-input"
            />
            <Button type="submit" variant="outline" size="sm">
              <Search size={14} />
            </Button>
          </form>
        </div>

        {loading ? (
          <Card className="border border-foreground">
            <CardContent className="p-0">
              <div className="divide-y divide-jepang-border">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 space-y-2">
                    <SkeletonBox height="0.8rem" width="30%" />
                    <SkeletonBox height="1rem" width="80%" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : comments.length === 0 ? (
          <div className="text-center py-24" data-testid="no-comments-admin">
            <MessageSquare
              size={48}
              strokeWidth={1.5}
              className="mx-auto mb-4 text-jepang-muted"
            />
            <p className="font-heading font-bold text-2xl mb-2">Tidak ada komentar</p>
            <p className="text-jepang-muted">Tidak ada komentar yang cocok dengan filter.</p>
          </div>
        ) : (
          <Card className="border border-foreground">
            <CardHeader className="border-b border-jepang-border bg-jepang-off-white py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                {total} KOMENTAR
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-jepang-border">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 hover:bg-jepang-off-white transition-colors"
                    data-testid={`admin-comment-${c.id}`}
                  >
                    <div className="flex items-center gap-2 flex-wrap mb-1.5 text-[11px] font-mono uppercase tracking-wider text-jepang-muted">
                      <Badge variant={c.targetType === "ARTICLE" ? "red" : "black"} className="text-[9px] px-1.5 py-0">
                        {c.targetType}
                      </Badge>
                      {c.parentId && (
                        <Badge className="text-[9px] px-1.5 py-0">BALASAN</Badge>
                      )}
                      {c.isDeleted && (
                        <Badge className="text-[9px] px-1.5 py-0 text-jepang-red border-jepang-red">
                          DIHAPUS
                        </Badge>
                      )}
                      {c.status === "HIDDEN" && !c.isDeleted && (
                        <Badge className="text-[9px] px-1.5 py-0">DISEMBUNYIKAN</Badge>
                      )}
                      {c.targetSlug ? (
                        <Link
                          href={`${TARGET_PATH[c.targetType]}/${c.targetSlug}`}
                          className="hover:text-jepang-red truncate max-w-xs"
                        >
                          {c.targetTitle}
                        </Link>
                      ) : (
                        <span className="truncate max-w-xs">{c.targetTitle}</span>
                      )}
                    </div>

                    <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word mb-2">
                      {c.content}
                    </p>

                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-[11px] font-mono uppercase tracking-wider text-jepang-muted">
                        {c.author.name} (@{c.author.username})
                        {c.author.isAdmin ? " · ADMIN" : ""} ·{" "}
                        {new Date(c.createdAt).toLocaleDateString("id-ID")}
                        {c.isEdited ? " · disunting" : ""}
                      </p>

                      {!c.isDeleted && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              moderate(c.id, c.status === "HIDDEN" ? "unhide" : "hide")
                            }
                            className="border border-jepang-border"
                            data-testid={`admin-moderate-${c.id}`}
                          >
                            {c.status === "HIDDEN" ? (
                              <>
                                <Eye size={14} /> Tampilkan
                              </>
                            ) : (
                              <>
                                <EyeOff size={14} /> Sembunyikan
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(c.id)}
                            className="border border-jepang-border hover:border-jepang-red hover:text-jepang-red"
                            data-testid={`admin-delete-${c.id}`}
                            title="Hapus permanen"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Sebelumnya
            </Button>
            <span className="text-xs font-mono uppercase tracking-wider text-jepang-muted">
              Hal {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Berikutnya
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
