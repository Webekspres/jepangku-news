"use client";

import { useEffect, useRef, useState } from "react";
import { Link as LinkIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type LinkInsertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialUrl?: string;
  onConfirm: (url: string) => void;
  onRemove?: () => void;
};

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^(https?:\/\/|mailto:|tel:|#)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isValidUrl(url: string): boolean {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default function LinkInsertDialog({
  open,
  onOpenChange,
  initialUrl = "",
  onConfirm,
  onRemove,
}: LinkInsertDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState("");
  const isEditing = Boolean(initialUrl);

  useEffect(() => {
    if (open) {
      setUrl(initialUrl);
      setError("");
      requestAnimationFrame(() => inputRef.current?.select());
    }
  }, [open, initialUrl]);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setUrl(initialUrl);
      setError("");
    }
    onOpenChange(next);
  };

  const handleConfirm = () => {
    const normalized = normalizeUrl(url);
    if (normalized && !isValidUrl(normalized)) {
      setError("URL tidak valid. Contoh: https://example.com");
      return;
    }
    onConfirm(normalized);
    onOpenChange(false);
  };

  const handleRemove = () => {
    onRemove?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPortal open={open}>
        <DialogOverlay className="z-70" />
        <DialogContent
          className={cn(
            "z-71 w-[min(100vw-1.5rem,28rem)]",
            "border border-jepang-border bg-white shadow-xl",
          )}
          data-testid="link-insert-dialog"
        >
          <div className="flex items-center justify-between border-b border-jepang-border px-4 py-3">
            <div>
              <DialogTitle className="font-heading font-bold text-lg">
                {isEditing ? "Edit Tautan" : "Sisipkan Tautan"}
              </DialogTitle>
              <p className="text-xs text-jepang-muted mt-0.5">
                {isEditing
                  ? "Perbarui URL atau hapus tautan dari teks terpilih"
                  : "Tautan akan diterapkan ke teks yang sedang dipilih"}
              </p>
            </div>
            <DialogClose asChild>
              <button
                type="button"
                className="rounded-md p-1.5 text-jepang-muted hover:bg-jepang-off-white"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </DialogClose>
          </div>

          <div className="space-y-4 px-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-insert-url">URL</Label>
              <Input
                ref={inputRef}
                id="link-insert-url"
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleConfirm();
                  }
                }}
                placeholder="https://example.com"
                autoComplete="url"
                data-testid="link-insert-url-input"
              />
            </div>

            {error ? (
              <p className="text-sm text-jepang-red" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <div className="flex gap-2 border-t border-jepang-border px-4 py-3">
            {isEditing && onRemove ? (
              <Button
                type="button"
                variant="outline"
                className="text-jepang-red hover:text-jepang-red"
                onClick={handleRemove}
                data-testid="link-insert-remove"
              >
                Hapus
              </Button>
            ) : null}
            <DialogClose asChild>
              <Button type="button" variant="outline" className="flex-1">
                Batal
              </Button>
            </DialogClose>
            <Button
              type="button"
              className="flex-1"
              onClick={handleConfirm}
              data-testid="link-insert-confirm"
            >
              <LinkIcon size={14} className="mr-2" />
              {isEditing ? "Simpan" : "Sisipkan"}
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
