"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  MessageSquare,
  Trash2,
  EyeOff,
  Eye,
} from "lucide-react";
import AdminCard from "@/components/admin/AdminCard";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  AdminFilterButtons,
  AdminSearchInput,
  AdminToolbar,
} from "@/components/admin/AdminToolbar";
import { Button } from "@/components/ui/button";
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
  { value: "", label: "Semua", testId: "filter-status-all" },
  { value: "VISIBLE", label: "Tampil", testId: "filter-status-VISIBLE" },
  { value: "HIDDEN", label: "Disembunyikan", testId: "filter-status-HIDDEN" },
  { value: "DELETED", label: "Dihapus", testId: "filter-status-DELETED" },
];

const TYPE_FILTERS = [
  { value: "", label: "Semua Tipe", testId: "filter-type-all" },
  { value: "ARTICLE", label: "Artikel", testId: "filter-type-ARTICLE" },
  { value: "POLL", label: "Polling", testId: "filter-type-POLL" },
  { value: "QUIZ", label: "Kuis", testId: "filter-type-QUIZ" },
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
    <>
      <ConfirmModal {...confirmProps} />

      <AdminPageLayout
        testId="admin-comments-page"
        label="MODERASI KOMENTAR"
        title={
          <>
            <MessageSquare size={36} strokeWidth={1.5} className="inline mr-3" />
            Komentar
          </>
        }
      >
        <AdminToolbar>
          <AdminFilterButtons
            options={STATUS_FILTERS}
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          />
          <AdminFilterButtons
            options={TYPE_FILTERS}
            value={targetType}
            onChange={(value) => {
              setTargetType(value);
              setPage(1);
            }}
          />
          <AdminSearchInput
            value={search}
            onChange={setSearch}
            onSubmit={() => {
              setPage(1);
              setQuery(search.trim());
            }}
            placeholder="Cari isi komentar..."
            testId="comment-search-input"
          />
        </AdminToolbar>

        {loading ? (
          <AdminCard variant="list" noPadding>
            <div className="divide-y divide-jepang-border">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 space-y-2">
                    <SkeletonBox height="0.8rem" width="30%" />
                    <SkeletonBox height="1rem" width="80%" />
                  </div>
                ))}
              </div>
          </AdminCard>
        ) : comments.length === 0 ? (
          <div data-testid="no-comments-admin">
            <AdminEmptyState
              icon={MessageSquare}
              title="Tidak ada komentar"
              description="Tidak ada komentar yang cocok dengan filter."
            />
          </div>
        ) : (
          <AdminCard title={`${total} KOMENTAR`} variant="list" noPadding>
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
          </AdminCard>
        )}

        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
        />
      </AdminPageLayout>
    </>
  );
}
