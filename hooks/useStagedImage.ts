"use client";

import { useCallback, useState } from "react";
import {
  commitStagedUrl,
  deleteMediaFile,
  discardStagedUrl,
  getReplacedUrl,
  isStagedUrl,
  stageFile,
  type UploadPurpose,
} from "@/lib/upload-media";
import { validateArticleImageFileFull } from "@/lib/article-form-helpers";

type UseStagedImageOptions = {
  /** Committed (already-saved) URL, kept in form state. */
  value: string;
  /** Persist the committed URL back to form state. */
  onValueChange: (url: string) => void;
  purpose?: UploadPurpose;
};

export type UseStagedImage = {
  /** URL to render in <img>: the local staged preview or the committed value. */
  previewUrl: string;
  hasImage: boolean;
  /** True while uploading (commit) or deleting from R2. */
  busy: boolean;
  /** True when a file is picked locally but not yet uploaded/saved. */
  dirty: boolean;
  /** Pesan validasi terakhir (format/ukuran/dimensi). */
  validationError: string | null;
  /** Stage a file locally. Returns error message on failure, null on success. */
  selectFile: (file: File) => Promise<string | null>;
  /** Remove the image entirely — deletes the saved R2 object immediately. */
  remove: () => Promise<void>;
  /** Upload any staged file and return the final URL (also syncs form state). */
  commit: () => Promise<string>;
  /** Reset to a committed URL (e.g. after data loads), dropping any staged file. */
  reset: (url?: string | null) => void;
};

/**
 * Manages a single image field with staged (deferred) uploads. The committed URL
 * lives in form state via `value`/`onValueChange` so autosave keeps persisting the
 * already-saved image, while newly picked files stay local until `commit()`.
 */
export function useStagedImage({
  value,
  onValueChange,
  purpose = "content",
}: UseStagedImageOptions): UseStagedImage {
  const [staged, setStaged] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectFile = useCallback(
    async (file: File): Promise<string | null> => {
      const error = await validateArticleImageFileFull(file, purpose);
      if (error) {
        setValidationError(error);
        return error;
      }

      setValidationError(null);
      setStaged((prev) => {
        const replaced = prev
          ? isStagedUrl(prev)
            ? getReplacedUrl(prev)
            : prev
          : value || undefined;
        if (prev) discardStagedUrl(prev);
        return stageFile(file, purpose, replaced);
      });
      return null;
    },
    [purpose, value],
  );

  const remove = useCallback(async () => {
    let toDelete: string | undefined;
    setStaged((prev) => {
      if (prev) {
        toDelete = isStagedUrl(prev) ? getReplacedUrl(prev) : prev;
        discardStagedUrl(prev);
      }
      return null;
    });
    if (value) toDelete = value;

    if (toDelete) {
      setBusy(true);
      try {
        await deleteMediaFile(toDelete);
      } finally {
        setBusy(false);
      }
    }
    setValidationError(null);
    if (value) onValueChange("");
  }, [value, onValueChange]);

  const commit = useCallback(async () => {
    if (!staged) return value;
    setBusy(true);
    try {
      const realUrl = await commitStagedUrl(staged);
      setStaged(null);
      setValidationError(null);
      onValueChange(realUrl);
      return realUrl;
    } finally {
      setBusy(false);
    }
  }, [staged, value, onValueChange]);

  const reset = useCallback((url?: string | null) => {
    setStaged((prev) => {
      if (prev) discardStagedUrl(prev);
      return null;
    });
    setValidationError(null);
    onValueChange(url ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const previewUrl = staged ?? value ?? "";

  return {
    previewUrl,
    hasImage: Boolean(staged || value),
    busy,
    dirty: Boolean(staged),
    validationError,
    selectFile,
    remove,
    commit,
    reset,
  };
}
