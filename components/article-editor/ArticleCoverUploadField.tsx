"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { safeImageSrc } from "@/lib/safe-url";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  getArticleImageUploadHint,
  ARTICLE_IMAGE_ACCEPT,
} from "@/lib/article-form-helpers";
import type { UseStagedImage } from "@/hooks/useStagedImage";
import { cn } from "@/lib/utils";

function displayUrlLabel(url: string): string {
  if (url.startsWith("blob:")) {
    return "File dipilih — akan diunggah saat disimpan";
  }
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.split("/").filter(Boolean).pop();
    return path || parsed.hostname;
  } catch {
    return url.length > 48 ? `${url.slice(0, 45)}…` : url;
  }
}

export type ArticleCoverUploadFieldProps = {
  cover: UseStagedImage;
  committedUrl: string;
  onFilePick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
  uploadTestId?: string;
  removeTestId?: string;
  previewTestId?: string;
  urlTestId?: string;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Upload-only cover image field for article editors (uses staged upload via useStagedImage).
 */
export default function ArticleCoverUploadField({
  cover,
  committedUrl,
  onFilePick,
  loading = false,
  uploadTestId,
  removeTestId,
  previewTestId,
  urlTestId,
  className,
  children,
}: ArticleCoverUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewSrc = safeImageSrc(cover.previewUrl);
  const showCommittedUrl = committedUrl && !cover.dirty;

  return (
    <div className={cn("space-y-2", className)}>
      <Label>Gambar Cover</Label>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={cover.busy}
          className="cursor-pointer hover:bg-foreground hover:text-white shrink-0"
          onClick={() => fileInputRef.current?.click()}
          data-testid={uploadTestId}
        >
          <Upload size={14} strokeWidth={1.5} className="mr-1.5" />
          {cover.busy ? "Memproses..." : cover.hasImage ? "Ganti Gambar" : "Pilih Gambar"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ARTICLE_IMAGE_ACCEPT}
          className="hidden"
          onChange={onFilePick}
          disabled={cover.busy}
        />
      </div>

      {cover.dirty && (
        <p className="text-[11px] text-jepang-muted">
          File dipilih — akan diunggah saat disimpan
        </p>
      )}

      {showCommittedUrl && (
        <p
          className="text-[11px] text-jepang-muted break-all"
          title={committedUrl}
          data-testid={urlTestId}
        >
          File saat ini: {displayUrlLabel(committedUrl)}
        </p>
      )}

      <p className="text-xs text-jepang-muted">
        {getArticleImageUploadHint("cover")}
      </p>

      {children}

      {cover.validationError ? (
        <p className="text-sm text-jepang-red" role="alert">
          {cover.validationError}
        </p>
      ) : null}

      {previewSrc && (
        <div className="mt-1 space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt="Preview cover"
            className="max-h-48 object-cover border border-jepang-border"
            data-testid={previewTestId}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={cover.busy || loading}
            onClick={() => void cover.remove()}
            className="text-jepang-red border-jepang-red hover:bg-jepang-red hover:text-white"
            data-testid={removeTestId}
          >
            Hapus Gambar
          </Button>
        </div>
      )}
    </div>
  );
}
