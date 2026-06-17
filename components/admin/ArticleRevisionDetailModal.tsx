"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { THIN_SCROLLBAR_CLASS } from "@/components/ui/thin-scrollbar";
import {
  diffRevisionSnapshots,
  type RevisionFieldChange,
  type RevisionSnapshot,
} from "@/lib/article-revision-diff";
import { cn } from "@/lib/utils";

type EditorInfo = { id: string; name: string; role: string };

export type RevisionDetailPayload = {
  id: string;
  revisionNumber: number;
  changeNote: string | null;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  categoryId: string | null;
  status: string;
  createdAt: string;
  editor?: EditorInfo | null;
};

type ArticleRevisionDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  revision: RevisionDetailPayload | null;
  previous: RevisionDetailPayload | null;
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draf",
  PENDING_REVIEW: "Menunggu Review",
  PUBLISHED: "Dipublikasikan",
  REJECTED: "Ditolak",
  ARCHIVED: "Diarsipkan",
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

function toSnapshot(data: RevisionDetailPayload): RevisionSnapshot {
  return {
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    coverImageUrl: data.coverImageUrl,
    categoryId: data.categoryId,
    status: data.status,
  };
}

function ChangeBlock({
  change,
  revision,
  previous,
}: {
  change: RevisionFieldChange;
  revision: RevisionDetailPayload;
  previous: RevisionDetailPayload | null;
}) {
  if (change.field === "content") {
    return (
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-jepang-muted">
          {change.label}
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="mb-1.5 text-[10px] font-mono uppercase tracking-wider text-jepang-muted">
              Sebelum
            </p>
            <div
              className={cn(
                THIN_SCROLLBAR_CLASS,
                "article-content max-h-56 overflow-y-auto border border-jepang-border bg-jepang-off-white p-3 text-sm",
              )}
              dangerouslySetInnerHTML={{
                __html: previous?.content || "<p class='text-jepang-muted'>—</p>",
              }}
            />
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-mono uppercase tracking-wider text-jepang-muted">
              Sesudah
            </p>
            <div
              className={cn(
                THIN_SCROLLBAR_CLASS,
                "article-content max-h-56 overflow-y-auto border border-jepang-border bg-white p-3 text-sm",
              )}
              dangerouslySetInnerHTML={{ __html: revision.content }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (change.field === "coverImageUrl") {
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-jepang-muted">
          {change.label}
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="mb-1.5 text-[10px] font-mono uppercase tracking-wider text-jepang-muted">
              Sebelum
            </p>
            {previous?.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previous.coverImageUrl}
                alt="Cover sebelum"
                className="max-h-32 w-full border border-jepang-border object-cover"
              />
            ) : (
              <p className="text-sm text-jepang-muted">—</p>
            )}
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-mono uppercase tracking-wider text-jepang-muted">
              Sesudah
            </p>
            {revision.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={revision.coverImageUrl}
                alt="Cover sesudah"
                className="max-h-32 w-full border border-jepang-border object-cover"
              />
            ) : (
              <p className="text-sm text-jepang-muted">—</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-jepang-muted">
        {change.label}
      </p>
      <div className="grid gap-2 md:grid-cols-2 text-sm">
        <div className="border border-jepang-border bg-jepang-off-white p-3">
          <p className="mb-1 text-[10px] font-mono uppercase tracking-wider text-jepang-muted">
            Sebelum
          </p>
          <p className="whitespace-pre-wrap break-words">{change.before}</p>
        </div>
        <div className="border border-jepang-border bg-white p-3">
          <p className="mb-1 text-[10px] font-mono uppercase tracking-wider text-jepang-muted">
            Sesudah
          </p>
          <p className="whitespace-pre-wrap break-words">{change.after}</p>
        </div>
      </div>
    </div>
  );
}

export default function ArticleRevisionDetailModal({
  open,
  onOpenChange,
  loading = false,
  revision,
  previous,
}: ArticleRevisionDetailModalProps) {
  const changes =
    revision && !loading
      ? diffRevisionSnapshots(previous ? toSnapshot(previous) : null, toSnapshot(revision))
      : [];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[min(100vw-1.5rem,42rem)] -translate-x-1/2 -translate-y-1/2 flex-col",
            "border border-jepang-border bg-white shadow-jepang-lg",
          )}
          data-testid="article-revision-detail-modal"
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-jepang-border p-5">
            <div>
              <DialogPrimitive.Title className="font-heading text-xl font-bold">
                {revision ? `Detail Revisi #${revision.revisionNumber}` : "Detail Revisi"}
              </DialogPrimitive.Title>
              {revision && (
                <p className="mt-1 text-xs font-mono text-jepang-muted">
                  {revision.editor?.name || "Sistem"}
                  {revision.editor?.role === "ADMIN" ? " (Admin)" : ""} ·{" "}
                  {formatDate(revision.createdAt)}
                </p>
              )}
            </div>
            <DialogPrimitive.Close className="p-1 text-jepang-muted hover:text-jepang-red">
              <X size={18} />
            </DialogPrimitive.Close>
          </div>

          <div className={cn(THIN_SCROLLBAR_CLASS, "flex-1 overflow-y-auto p-5 space-y-5")}>
            {loading ? (
              <div className="flex items-center justify-center py-16 text-jepang-muted">
                <Loader2 size={20} className="mr-2 animate-spin" />
                Memuat detail…
              </div>
            ) : revision ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {STATUS_LABEL[revision.status] || revision.status}
                  </Badge>
                  <span className="text-sm font-medium line-clamp-1">{revision.title}</span>
                </div>

                {revision.changeNote && (
                  <div className="border-l-2 border-jepang-border bg-jepang-off-white p-3">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-jepang-muted mb-1">
                      Catatan perubahan
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{revision.changeNote}</p>
                  </div>
                )}

                {changes.length > 0 ? (
                  <div className="space-y-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                      Perubahan
                    </p>
                    {changes.map((change) => (
                      <ChangeBlock
                        key={change.field}
                        change={change}
                        revision={revision}
                        previous={previous}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-jepang-muted">
                    Tidak ada perbedaan konten dibanding revisi sebelumnya.
                  </p>
                )}
              </>
            ) : null}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
