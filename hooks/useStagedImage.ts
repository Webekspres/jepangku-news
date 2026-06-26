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
  /** Stage a freshly selected/cropped file locally (no upload yet). */
  selectFile: (file: File) => void;
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

  const selectFile = useCallback(
    (file: File) => {
      setStaged((prev) => {
        // Preserve the original committed URL across repeated re-picks so it is
        // still cleaned up once we finally commit.
        const replaced = prev
          ? isStagedUrl(prev)
            ? getReplacedUrl(prev)
            : prev
          : value || undefined;
        if (prev) discardStagedUrl(prev);
        return stageFile(file, purpose, replaced);
      });
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
    if (value) onValueChange("");
  }, [value, onValueChange]);

  const commit = useCallback(async () => {
    if (!staged) return value;
    setBusy(true);
    try {
      const realUrl = await commitStagedUrl(staged);
      setStaged(null);
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
    onValueChange(url ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const previewUrl = staged ?? value ?? "";

  return {
    previewUrl,
    hasImage: Boolean(staged || value),
    busy,
    dirty: Boolean(staged),
    selectFile,
    remove,
    commit,
    reset,
  };
}
