"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { safeImageSrc } from "@/lib/safe-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { stageFile } from "@/lib/upload-media";
import {
  ARTICLE_IMAGE_MAX_LABEL,
  validateArticleImageFile,
} from "@/lib/article-form-helpers";

export interface ImageUploadFieldProps {
  label?: string;
  value: string;
  uploadKey?: string;
  onUrlChange: (url: string) => void;
  placeholder?: string;
  testId?: string;
  /** Hide the file-accept / max-size hint below the input */
  hideHint?: boolean;
}

/**
 * Shared image upload field with client-side validation.
 *
 * - Validates file type (JPG/PNG/GIF/WebP) and size (max 5 MB)
 *   **before** staging — so the user gets instant feedback.
 * - Stages the file locally (no network call) until the parent form
 *   is saved via `commitStagedUrl`.
 * - Shows a preview thumbnail after a file is selected.
 */
export default function ImageUploadField({
  label,
  value,
  uploadKey: _uploadKey,
  onUrlChange,
  placeholder = "URL gambar atau upload...",
  testId,
  hideHint,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFilePick = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      // Reset input so re-picking the same file triggers onChange again.
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Client-side validation (format + size)
      const validationError = validateArticleImageFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError("");
      setUploading(true);
      try {
        const blobUrl = stageFile(file, "content");
        onUrlChange(blobUrl);
      } catch {
        setError("Gagal memproses gambar");
      } finally {
        setUploading(false);
      }
    },
    [onUrlChange],
  );

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      <div className="flex gap-2 items-start">
        <Input
          type="text"
          className="flex-1"
          value={value}
          onChange={(e) => {
            setError("");
            onUrlChange(e.target.value);
          }}
          placeholder={placeholder}
          data-testid={testId}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFilePick}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          className="cursor-pointer hover:bg-foreground hover:text-white shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={14} strokeWidth={1.5} />
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              setError("");
              onUrlChange("");
            }}
            className="text-jepang-red shrink-0"
          >
            <X size={14} />
          </Button>
        )}
      </div>

      {!hideHint && (
        <p className="text-[11px] text-jepang-muted">
          Format: JPG, PNG, GIF, WebP · Maks. {ARTICLE_IMAGE_MAX_LABEL}
        </p>
      )}

      {error && (
        <p className="text-sm text-jepang-red" role="alert">
          {error}
        </p>
      )}

      {safeImageSrc(value) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={safeImageSrc(value)}
          alt="Preview"
          className="mt-1 max-h-32 object-cover border border-jepang-border"
        />
      )}
    </div>
  );
}
