"use client";

import * as React from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  X,
  History,
  FilePenLine,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThinScrollbar } from "@/components/ui/thin-scrollbar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draf",
  PENDING_REVIEW: "Menunggu Review",
  PUBLISHED: "Dipublikasikan",
  REJECTED: "Ditolak",
  ARCHIVED: "Diarsipkan",
};

type BadgeVariant =
  | "default"
  | "red"
  | "black"
  | "success"
  | "warning"
  | "muted"
  | "outline";

const STATUS_BADGE: Record<string, BadgeVariant> = {
  DRAFT: "muted",
  PENDING_REVIEW: "warning",
  PUBLISHED: "success",
  REJECTED: "red",
  ARCHIVED: "muted",
};

type EditorInfo = { id: string; name: string; role: string } | null;

export interface ArticleActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleTitle: string;
  articleStatus?: string;
  lastEditedAt?: string | null;
  lastEditedBy?: EditorInfo;
  reviews: ReviewEntry[];
  revisions: RevisionEntry[];
  loading?: boolean;
}

export interface ReviewEntry {
  id: string;
  previousStatus: string;
  newStatus: string;
  note: string | null;
  reviewedAt: string;
  reviewer?: EditorInfo;
}

export interface RevisionEntry {
  id: string;
  revisionNumber: number;
  changeNote: string | null;
  title: string;
  status: string;
  createdAt: string;
  editor?: EditorInfo;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function editorLabel(editor?: EditorInfo) {
  if (!editor) return "Sistem";
  return editor.role === "ADMIN" ? `${editor.name} (Admin)` : editor.name;
}

type TimelineItem =
  | { kind: "review"; at: string; data: ReviewEntry }
  | { kind: "revision"; at: string; data: RevisionEntry };

function buildTimeline(reviews: ReviewEntry[], revisions: RevisionEntry[]): TimelineItem[] {
  const items: TimelineItem[] = [
    ...reviews.map((r) => ({ kind: "review" as const, at: r.reviewedAt, data: r })),
    ...revisions.map((r) => ({ kind: "revision" as const, at: r.createdAt, data: r })),
  ];
  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export function ArticleActivityModal({
  open,
  onOpenChange,
  articleTitle,
  articleStatus,
  lastEditedAt,
  lastEditedBy,
  reviews,
  revisions,
  loading = false,
}: ArticleActivityModalProps) {
  const timeline = buildTimeline(reviews, revisions);
  const adminLastEdit =
    lastEditedBy?.role === "ADMIN" ? lastEditedBy : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal open={open}>
        <DialogOverlay />
        <DialogContent
          className={cn(
            "w-full max-w-lg rounded-lg border border-jepang-border bg-white shadow-jepang-lg",
            "max-h-[85vh] flex flex-col",
          )}
        >
          <div className="flex items-start justify-between gap-4 p-6 border-b border-jepang-border shrink-0">
            <div>
              <DialogTitle className="font-heading font-black text-xl tracking-tight">
                Riwayat Artikel
              </DialogTitle>
              <p className="text-sm text-jepang-muted mt-1 line-clamp-2">{articleTitle}</p>
              {articleStatus && (
                <Badge
                  variant={STATUS_BADGE[articleStatus] || "muted"}
                  className="mt-2"
                >
                  {STATUS_LABEL[articleStatus] || articleStatus}
                </Badge>
              )}
            </div>
            <DialogClose className="p-1 hover:text-jepang-red transition-colors">
              <X size={20} strokeWidth={1.5} />
            </DialogClose>
          </div>

          {(adminLastEdit || lastEditedAt) && (
            <div className="px-6 py-3 bg-jepang-off-white border-b border-jepang-border text-sm space-y-1 shrink-0">
              {adminLastEdit && (
                <p className="flex items-center gap-2">
                  <User size={14} className="text-jepang-red shrink-0" />
                  <span>
                    Terakhir diedit oleh admin:{" "}
                    <strong>{adminLastEdit.name}</strong>
                  </span>
                </p>
              )}
              {lastEditedAt && (
                <p className="text-xs text-jepang-muted font-mono pl-5">
                  {formatDate(lastEditedAt)}
                </p>
              )}
            </div>
          )}

          <ThinScrollbar className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse h-16 bg-jepang-border" />
                ))}
              </div>
            ) : timeline.length === 0 ? (
              <div className="text-center py-12">
                <History
                  size={32}
                  strokeWidth={1.5}
                  className="mx-auto mb-3 text-jepang-muted"
                />
                <p className="text-sm text-jepang-muted font-mono uppercase tracking-wider">
                  Belum ada riwayat
                </p>
              </div>
            ) : (
              <ol className="space-y-0" aria-label="Linimasa artikel">
                {timeline.map((item, idx) => (
                  <li key={`${item.kind}-${item.data.id}`} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="mt-1">
                        {item.kind === "revision" ? (
                          <FilePenLine
                            size={16}
                            strokeWidth={1.5}
                            className="text-foreground shrink-0"
                          />
                        ) : item.data.newStatus === "PUBLISHED" ? (
                          <CheckCircle2
                            size={16}
                            className="text-green-600 shrink-0"
                          />
                        ) : item.data.newStatus === "REJECTED" ? (
                          <XCircle
                            size={16}
                            className="text-jepang-red shrink-0"
                          />
                        ) : (
                          <Clock
                            size={16}
                            className="text-jepang-muted shrink-0"
                          />
                        )}
                      </div>
                      {idx < timeline.length - 1 && (
                        <div className="w-px flex-1 bg-jepang-border mt-1" />
                      )}
                    </div>

                    <div
                      className={cn(
                        "flex-1 pb-5",
                        idx === timeline.length - 1 && "pb-0",
                      )}
                    >
                      {item.kind === "revision" ? (
                        <>
                          <p className="text-xs font-semibold uppercase tracking-wider text-jepang-muted mb-1">
                            Revisi #{item.data.revisionNumber}
                          </p>
                          <p className="text-sm font-medium line-clamp-1">
                            {item.data.title}
                          </p>
                          <Badge
                            variant={STATUS_BADGE[item.data.status] || "muted"}
                            className="mt-1"
                          >
                            {STATUS_LABEL[item.data.status] || item.data.status}
                          </Badge>
                          {item.data.changeNote && (
                            <p className="text-sm mt-2 p-2.5 border-l-2 border-jepang-border bg-jepang-off-white font-mono">
                              {item.data.changeNote}
                            </p>
                          )}
                          <p className="text-[11px] text-jepang-muted font-mono mt-1.5">
                            {editorLabel(item.data.editor)} ·{" "}
                            {formatDate(item.at)}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-semibold uppercase tracking-wider text-jepang-muted mb-1">
                            Perubahan status
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <Badge
                              variant={
                                STATUS_BADGE[item.data.previousStatus] || "muted"
                              }
                            >
                              {STATUS_LABEL[item.data.previousStatus] ||
                                item.data.previousStatus}
                            </Badge>
                            <ChevronRight
                              size={12}
                              className="text-jepang-muted"
                            />
                            <Badge
                              variant={
                                STATUS_BADGE[item.data.newStatus] || "muted"
                              }
                            >
                              {STATUS_LABEL[item.data.newStatus] ||
                                item.data.newStatus}
                            </Badge>
                          </div>
                          {item.data.note &&
                            !["Approved", "Disetujui dan dipublikasikan"].includes(
                              item.data.note,
                            ) && (
                              <p
                                className={cn(
                                  "text-sm mt-1.5 p-2.5 border-l-2 font-mono",
                                  item.data.newStatus === "REJECTED"
                                    ? "border-jepang-red bg-red-50 text-jepang-red"
                                    : "border-jepang-border bg-jepang-off-white",
                                )}
                              >
                                {item.data.note}
                              </p>
                            )}
                          <p className="text-[11px] text-jepang-muted font-mono mt-1.5">
                            {editorLabel(item.data.reviewer)} ·{" "}
                            {formatDate(item.at)}
                          </p>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </ThinScrollbar>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

export function useArticleActivity() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [articleTitle, setArticleTitle] = React.useState("");
  const [articleStatus, setArticleStatus] = React.useState<string>();
  const [lastEditedAt, setLastEditedAt] = React.useState<string | null>(null);
  const [lastEditedBy, setLastEditedBy] = React.useState<EditorInfo>(null);
  const [reviews, setReviews] = React.useState<ReviewEntry[]>([]);
  const [revisions, setRevisions] = React.useState<RevisionEntry[]>([]);

  const openActivity = React.useCallback(async (slug: string, title: string) => {
    setArticleTitle(title);
    setReviews([]);
    setRevisions([]);
    setLastEditedBy(null);
    setLastEditedAt(null);
    setOpen(true);
    setLoading(true);

    try {
      const [reviewsRes, revisionsRes] = await Promise.all([
        fetch(`/api/articles/${slug}/reviews`),
        fetch(`/api/articles/${slug}/revisions`),
      ]);

      if (reviewsRes.ok) {
        const data = await reviewsRes.json();
        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
        setArticleStatus(data.articleStatus);
        setLastEditedAt(data.lastEditedAt ?? null);
        setLastEditedBy(data.lastEditedBy ?? null);
      }

      if (revisionsRes.ok) {
        const data = await revisionsRes.json();
        setRevisions(Array.isArray(data.revisions) ? data.revisions : []);
        if (!reviewsRes.ok) {
          setArticleStatus(data.articleStatus);
          setLastEditedAt(data.lastEditedAt ?? null);
          setLastEditedBy(data.lastEditedBy ?? null);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const modalProps: ArticleActivityModalProps = {
    open,
    onOpenChange: setOpen,
    articleTitle,
    articleStatus,
    lastEditedAt,
    lastEditedBy,
    reviews,
    revisions,
    loading,
  };

  return { openActivity, modalProps };
}
