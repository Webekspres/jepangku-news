"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  FilePenLine,
  History,
  XCircle,
  Save,
  Send,
  Archive,
  Globe,
  Check,
} from "lucide-react";
import AdminCard from "@/components/admin/AdminCard";
import ArticleRevisionDetailModal, {
  type RevisionDetailPayload,
} from "@/components/admin/ArticleRevisionDetailModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { THIN_SCROLLBAR_CLASS } from "@/components/ui/thin-scrollbar";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReviewEntry, RevisionEntry } from "@/components/ui/article-activity-modal";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draf",
  PENDING_REVIEW: "Menunggu Review",
  PUBLISHED: "Dipublikasikan",
  REJECTED: "Ditolak",
  ARCHIVED: "Diarsipkan",
};

type TimelineItem =
  | { kind: "review"; at: string; data: ReviewEntry }
  | { kind: "revision"; at: string; data: RevisionEntry };

type ArticleEditAsideProps = {
  articleId: string;
  status: string;
  changeNote: string;
  onChangeNoteChange: (value: string) => void;
  onSaveChanges: () => void;
  onApprove: () => void;
  onPublish: () => void;
  onArchive: () => void;
  onRepublish: () => void;
  rejectNote: string;
  onRejectNoteChange: (value: string) => void;
  onReject: () => void;
  loading?: boolean;
  refreshKey?: number;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildTimeline(reviews: ReviewEntry[], revisions: RevisionEntry[]): TimelineItem[] {
  return [
    ...reviews.map((r) => ({ kind: "review" as const, at: r.reviewedAt, data: r })),
    ...revisions.map((r) => ({ kind: "revision" as const, at: r.createdAt, data: r })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export default function ArticleEditAside({
  articleId,
  status,
  changeNote,
  onChangeNoteChange,
  onSaveChanges,
  onApprove,
  onPublish,
  onArchive,
  onRepublish,
  rejectNote,
  onRejectNoteChange,
  onReject,
  loading = false,
  refreshKey = 0,
}: ArticleEditAsideProps) {
  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [revisions, setRevisions] = useState<RevisionEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<RevisionDetailPayload | null>(null);
  const [previousRevision, setPreviousRevision] = useState<RevisionDetailPayload | null>(null);
  const [selectedReview, setSelectedReview] = useState<ReviewEntry | null>(null);

  const loadActivity = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}/activity`);
      if (!res.ok) return;
      const data = await res.json();
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      setRevisions(Array.isArray(data.revisions) ? data.revisions : []);
    } finally {
      setHistoryLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    void loadActivity();
  }, [loadActivity, refreshKey]);

  const timeline = useMemo(
    () => buildTimeline(reviews, revisions),
    [reviews, revisions],
  );

  const openRevisionDetail = async (revisionId: string) => {
    setSelectedReview(null);
    setSelectedRevision(null);
    setPreviousRevision(null);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await fetch(
        `/api/admin/articles/${articleId}/revisions/${revisionId}`,
      );
      if (!res.ok) return;
      const data = await res.json();
      setSelectedRevision(data.revision ?? null);
      setPreviousRevision(data.previous ?? null);
    } finally {
      setDetailLoading(false);
    }
  };

  const openReviewDetail = (review: ReviewEntry) => {
    setSelectedRevision(null);
    setPreviousRevision(null);
    setSelectedReview(review);
    setDetailOpen(true);
    setDetailLoading(false);
  };

  return (
    <>
      <AdminCard title="Simpan & Aksi" variant="list" testId="admin-article-actions-aside">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="change-note">
              Catatan Perubahan <span className="text-jepang-red">*</span>
            </Label>
            <p className="text-[11px] text-jepang-muted leading-snug">
              Terlihat oleh penulis di riwayat artikel
            </p>
            <Textarea
              id="change-note"
              rows={3}
              value={changeNote}
              onChange={(e) => onChangeNoteChange(e.target.value)}
              placeholder="Jelaskan apa yang diubah dan alasannya..."
              data-testid="admin-change-note"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={onSaveChanges}
              disabled={loading}
              className="w-full justify-center"
              data-testid="admin-save-changes"
            >
              <Save size={14} strokeWidth={1.5} className="mr-1" />
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>

            {status === "PENDING_REVIEW" && (
              <Button
                onClick={onApprove}
                disabled={loading}
                className="w-full justify-center bg-green-600 hover:bg-green-700 text-white"
                data-testid="admin-approve"
              >
                <Check size={14} strokeWidth={1.5} className="mr-1" />
                Setujui & Publikasikan
              </Button>
            )}

            {status === "REJECTED" && (
              <Button
                onClick={onPublish}
                disabled={loading}
                className="w-full justify-center"
                data-testid="admin-publish"
              >
                <Globe size={14} strokeWidth={1.5} className="mr-1" />
                {loading ? "Menyimpan..." : "Publikasikan"}
              </Button>
            )}

            {status !== "ARCHIVED" && status !== "PENDING_REVIEW" && (
              <Button
                variant="outline"
                onClick={onArchive}
                disabled={loading}
                className="w-full justify-center"
                data-testid="admin-archive"
              >
                <Archive size={14} strokeWidth={1.5} className="mr-1" />
                Arsipkan
              </Button>
            )}

            {status === "ARCHIVED" && (
              <Button
                variant="outline"
                onClick={onRepublish}
                disabled={loading}
                className="w-full justify-center"
                data-testid="admin-republish"
              >
                <Send size={14} strokeWidth={1.5} className="mr-1" />
                Publikasikan Ulang
              </Button>
            )}
          </div>
        </div>
      </AdminCard>

      {status === "PENDING_REVIEW" && (
        <AdminCard title="Tolak Artikel" variant="list" testId="admin-reject-aside">
          <div className="space-y-3">
            <Label htmlFor="reject-note">Catatan Penolakan (wajib)</Label>
            <Textarea
              id="reject-note"
              rows={4}
              value={rejectNote}
              onChange={(e) => onRejectNoteChange(e.target.value)}
              placeholder="Jelaskan alasan artikel ini ditolak..."
              data-testid="reject-note-input"
            />
            <Button
              onClick={onReject}
              disabled={loading}
              className="w-full text-jepang-red border-jepang-red bg-transparent hover:bg-jepang-red hover:text-white"
              variant="outline"
              data-testid="admin-reject"
            >
              <XCircle size={14} strokeWidth={1.5} className="mr-1" />
              Tolak Artikel
            </Button>
          </div>
        </AdminCard>
      )}

      <AdminCard
        title="Riwayat Perubahan"
        variant="list"
        testId="admin-article-history-aside"
      >
        {historyLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse bg-jepang-border" />
            ))}
          </div>
        ) : timeline.length === 0 ? (
          <div className="py-8 text-center">
            <History size={24} className="mx-auto mb-2 text-jepang-muted" />
            <p className="text-xs font-mono uppercase tracking-wider text-jepang-muted">
              Belum ada riwayat
            </p>
          </div>
        ) : (
          <ol className={cn(THIN_SCROLLBAR_CLASS, "max-h-[28rem] space-y-0 overflow-y-auto")}>
            {timeline.map((item) => (
              <li
                key={`${item.kind}-${item.data.id}`}
                className="flex gap-3 border-b border-jepang-border py-3 last:border-b-0"
              >
                <div className="mt-0.5 shrink-0">
                  {item.kind === "revision" ? (
                    <FilePenLine size={15} className="text-foreground" />
                  ) : item.data.newStatus === "PUBLISHED" ? (
                    <CheckCircle2 size={15} className="text-green-600" />
                  ) : item.data.newStatus === "REJECTED" ? (
                    <XCircle size={15} className="text-jepang-red" />
                  ) : (
                    <Clock size={15} className="text-jepang-muted" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-jepang-muted">
                    {item.kind === "revision"
                      ? `Revisi #${item.data.revisionNumber}`
                      : "Perubahan status"}
                  </p>
                  <p className="mt-0.5 text-sm font-medium line-clamp-2">
                    {item.kind === "revision"
                      ? item.data.title
                      : `${STATUS_LABEL[item.data.previousStatus] || item.data.previousStatus} → ${STATUS_LABEL[item.data.newStatus] || item.data.newStatus}`}
                  </p>
                  <p className="mt-1 text-[11px] font-mono text-jepang-muted">
                    {formatDate(item.at)}
                  </p>
                  {item.kind === "revision" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 h-7 px-2 text-xs"
                      onClick={() => openRevisionDetail(item.data.id)}
                      data-testid={`view-revision-${item.data.id}`}
                    >
                      Lihat perubahan
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 h-7 px-2 text-xs"
                      onClick={() => openReviewDetail(item.data)}
                      data-testid={`view-review-${item.data.id}`}
                    >
                      Lihat detail
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </AdminCard>

      {selectedReview ? (
        <ReviewStatusDetailModal
          open={detailOpen}
          onOpenChange={setDetailOpen}
          review={selectedReview}
        />
      ) : (
        <ArticleRevisionDetailModal
          open={detailOpen}
          onOpenChange={setDetailOpen}
          loading={detailLoading}
          revision={selectedRevision}
          previous={previousRevision}
        />
      )}
    </>
  );
}

function ReviewStatusDetailModal({
  open,
  onOpenChange,
  review,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: ReviewEntry;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-1.5rem,28rem)] -translate-x-1/2 -translate-y-1/2 border border-jepang-border bg-white p-5 shadow-jepang-lg">
          <div className="mb-4 flex items-start justify-between gap-3">
            <DialogPrimitive.Title className="font-heading text-lg font-bold">
              Detail Perubahan Status
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="text-jepang-muted hover:text-jepang-red">
              <X size={18} />
            </DialogPrimitive.Close>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="outline">
              {STATUS_LABEL[review.previousStatus] || review.previousStatus}
            </Badge>
            <span className="text-jepang-muted">→</span>
            <Badge variant="outline">
              {STATUS_LABEL[review.newStatus] || review.newStatus}
            </Badge>
          </div>
          {review.note && (
            <p className="text-sm whitespace-pre-wrap border-l-2 border-jepang-border bg-jepang-off-white p-3">
              {review.note}
            </p>
          )}
          <p className="mt-3 text-[11px] font-mono text-jepang-muted">
            {review.reviewer?.name || "Sistem"}
            {review.reviewer?.role === "ADMIN" ? " (Admin)" : ""} ·{" "}
            {formatDate(review.reviewedAt)}
          </p>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
