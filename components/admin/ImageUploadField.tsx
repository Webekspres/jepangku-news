"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { safeImageSrc } from "@/lib/safe-url";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { stageFile, type UploadPurpose } from "@/lib/upload-media";
import {
  getArticleImageUploadHint,
  validateArticleImageFileFull,
  ARTICLE_IMAGE_ACCEPT,
} from "@/lib/article-form-helpers";
import { cn } from "@/lib/utils";

export interface ImageUploadFieldProps {
  label?: string;
  value: string;
  uploadKey?: string;
  onUrlChange: (url: string) => void;
  testId?: string;
  /** Hide the file-accept / max-size hint below the input */
  hideHint?: boolean;
  /** Tujuan upload — menentukan petunjuk dimensi di UI */
  purpose?: UploadPurpose;
  /** Compact layout for nested fields (e.g. quiz options) */
  compact?: boolean;
}

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

/**
 * Shared image upload field with client-side validation.
 *
 * Upload-only: users pick a file; existing URLs are shown read-only.
 * Stages locally until the parent form saves via `commitStagedUrl`.
 */
export default function ImageUploadField({
  label,
  value,
  uploadKey: _uploadKey,
  onUrlChange,
  testId,
  hideHint,
  purpose = "content",
  compact = false,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFilePick = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (fileInputRef.current) fileInputRef.current.value = "";

      const validationError = await validateArticleImageFileFull(file, purpose);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError("");
      setUploading(true);
      try {
        const blobUrl = stageFile(file, purpose);
        onUrlChange(blobUrl);
      } catch {
        setError("Gagal memproses gambar");
      } finally {
        setUploading(false);
      }
    },
    [onUrlChange, purpose],
  );

  const previewSrc = safeImageSrc(value);

  return (
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      {label && (
        <Label className={cn(compact && "text-xs font-normal text-jepang-muted")}>
          {label}
        </Label>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={ARTICLE_IMAGE_ACCEPT}
          className="hidden"
          onChange={handleFilePick}
        />
        <Button
          type="button"
          variant="outline"
          size={compact ? "sm" : "default"}
          disabled={uploading}
          className="cursor-pointer hover:bg-foreground hover:text-white shrink-0"
          onClick={() => fileInputRef.current?.click()}
          data-testid={testId}
        >
          <Upload size={14} strokeWidth={1.5} className={compact ? "" : "mr-1.5"} />
          {uploading ? "Memproses..." : value ? "Ganti Gambar" : "Pilih Gambar"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size={compact ? "icon" : "icon"}
            onClick={() => {
              setError("");
              onUrlChange("");
            }}
            className="text-jepang-red shrink-0"
            aria-label="Hapus gambar"
          >
            <X size={14} />
          </Button>
        )}
      </div>

      {value && !value.startsWith("blob:") && (
        <p
          className="text-[11px] text-jepang-muted break-all"
          title={value}
          data-testid={testId ? `${testId}-url` : undefined}
        >
          File saat ini: {displayUrlLabel(value)}
        </p>
      )}

      {!hideHint && (
        <p className="text-[11px] text-jepang-muted">
          {getArticleImageUploadHint(purpose)}
        </p>
      )}

      {error && (
        <p className="text-sm text-jepang-red" role="alert">
          {error}
        </p>
      )}

      {previewSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewSrc}
          alt="Preview"
          className={cn(
            "object-cover border border-jepang-border",
            compact ? "mt-0.5 max-h-16 max-w-[8rem]" : "mt-1 max-h-32",
          )}
        />
      )}
    </div>
  );
}
