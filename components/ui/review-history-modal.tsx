"use client";

import * as React from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  X,
  History,
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
  DialogDescription,
} from "@/components/ui/dialog";

/* ─── Types ──────────────────────────────────────────── */
export interface ArticleReviewEntry {
  id: string;
  previousStatus: string;
  newStatus: string;
  note: string | null;
  reviewedAt: string;
}

export interface ReviewHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleTitle: string;
  reviews: ArticleReviewEntry[];
  loading?: boolean;
}

/* ─── Status config ──────────────────────────────────── */
const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draf",
  PENDING_REVIEW: "Menunggu Review",
  PUBLISHED: "Dipublikasikan",
  REJECTED: "Ditolak",
  ARCHIVED: "Diarsipkan",
};

type BadgeVariant = "default" | "red" | "black" | "success" | "warning" | "muted" | "outline";

const STATUS_BADGE: Record<string, BadgeVariant> = {
  DRAFT: "muted",
  PENDING_REVIEW: "warning",
  PUBLISHED: "success",
  REJECTED: "red",
  ARCHIVED: "muted",
};

function StatusIcon({ status }: { status: string }) {
  if (status === "PUBLISHED")
    return <CheckCircle2 size={16} strokeWidth={1.5} className="text-green-600 shrink-0" />;
  if (status === "REJECTED")
    return <XCircle size={16} strokeWidth={1.5} className="text-jepang-red shrink-0" />;
  return <Clock size={16} strokeWidth={1.5} className="text-jepang-muted shrink-0" />;
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

/* ─── ReviewHistoryModal ─────────────────────────────── */
export function ReviewHistoryModal({
  open,
  onOpenChange,
  articleTitle,
  reviews,
  loading = false,
}: ReviewHistoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal open={open}>
        <DialogOverlay />
        <DialogContent
          className={cn(
            "w-full max-w-lg rounded-lg border border-jepang-border bg-white shadow-jepang-lg",
            "flex flex-col max-h-[85vh]",
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 p-5 border-b border-jepang-border shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <History size={18} strokeWidth={1.5} className="shrink-0" />
              <div className="min-w-0">
                <DialogTitle className="font-heading font-black text-lg tracking-tight leading-tight">
                  Riwayat Review
                </DialogTitle>
                <DialogDescription className="text-xs text-jepang-muted font-mono mt-0.5 truncate">
                  {articleTitle}
                </DialogDescription>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="shrink-0 p-1 hover:bg-jepang-off-white transition-colors"
              aria-label="Tutup"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Content */}
          <ThinScrollbar className="flex-1 overflow-y-auto p-5">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse flex gap-3"
                  >
                    <div className="w-4 h-4 bg-zinc-200 mt-0.5 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-zinc-200 w-1/2" />
                      <div className="h-3 bg-zinc-200 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <History size={32} strokeWidth={1.5} className="mx-auto mb-3 text-jepang-muted" />
                <p className="text-sm text-jepang-muted font-mono uppercase tracking-wider">
                  Belum ada riwayat review
                </p>
              </div>
            ) : (
              <ol className="relative space-y-0" aria-label="Linimasa review">
                {reviews.map((review, idx) => (
                  <li key={review.id} className="flex gap-3">
                    {/* Timeline line + dot */}
                    <div className="flex flex-col items-center">
                      <div className="mt-1">
                        <StatusIcon status={review.newStatus} />
                      </div>
                      {idx < reviews.length - 1 && (
                        <div className="w-px flex-1 bg-jepang-border mt-1 mb-0" />
                      )}
                    </div>

                    {/* Content */}
                    <div
                      className={cn(
                        "flex-1 pb-5",
                        idx === reviews.length - 1 && "pb-0",
                      )}
                    >
                      {/* Status transition */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <Badge variant={STATUS_BADGE[review.previousStatus] || "muted"}>
                          {STATUS_LABEL[review.previousStatus] || review.previousStatus}
                        </Badge>
                        <ChevronRight size={12} strokeWidth={2} className="text-jepang-muted" />
                        <Badge variant={STATUS_BADGE[review.newStatus] || "muted"}>
                          {STATUS_LABEL[review.newStatus] || review.newStatus}
                        </Badge>
                      </div>

                      {/* Note */}
                      {review.note && review.note !== "Approved" && (
                        <p
                          className={cn(
                            "text-sm mt-1.5 p-2.5 border-l-2 font-mono",
                            review.newStatus === "REJECTED"
                              ? "border-jepang-red bg-red-50 text-jepang-red"
                              : "border-jepang-border bg-jepang-off-white text-foreground",
                          )}
                        >
                          {review.note}
                        </p>
                      )}

                      {/* Timestamp */}
                      <p className="text-[11px] text-jepang-muted font-mono mt-1.5">
                        {formatDate(review.reviewedAt)}
                      </p>
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

/* ─── useReviewHistory hook ──────────────────────────── */
export function useReviewHistory() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [articleTitle, setArticleTitle] = React.useState("");
  const [reviews, setReviews] = React.useState<ArticleReviewEntry[]>([]);

  const openHistory = React.useCallback(async (slug: string, title: string) => {
    setArticleTitle(title);
    setReviews([]);
    setOpen(true);
    setLoading(true);

    try {
      const res = await fetch(`/api/articles/${slug}/reviews`);
      if (res.ok) {
        const data = await parseApiResponse(res);
        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const modalProps: ReviewHistoryModalProps = {
    open,
    onOpenChange: setOpen,
    articleTitle,
    reviews,
    loading,
  };

  return { openHistory, modalProps };
}
