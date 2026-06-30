"use client";

import { useRef, useState } from "react";
import { ImageIcon, Loader2, X } from "lucide-react";
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
import { deleteMediaFile, uploadMediaFile } from "@/lib/upload-media";
import { cn } from "@/lib/utils";

export type ArticleImageInsertValues = {
  src: string;
  alt: string;
  caption: string;
};

type ArticleImageInsertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<ArticleImageInsertValues>;
  onConfirm: (values: ArticleImageInsertValues) => void;
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export default function ArticleImageInsertDialog({
  open,
  onOpenChange,
  initialValues,
  onConfirm,
}: ArticleImageInsertDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState(initialValues?.alt ?? "");
  const [caption, setCaption] = useState(initialValues?.caption ?? "");
  const [previewUrl, setPreviewUrl] = useState(initialValues?.src ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  // Tracks an image uploaded during this dialog session so re-picking a new
  // file cleans up the abandoned one from R2 instead of orphaning it.
  const sessionUploadRef = useRef<string | null>(null);

  const resetFromInitial = () => {
    setAlt(initialValues?.alt ?? "");
    setCaption(initialValues?.caption ?? "");
    setPreviewUrl(initialValues?.src ?? "");
    setError("");
    sessionUploadRef.current = null;
  };

  const handleOpenChange = (next: boolean) => {
    if (next) resetFromInitial();
    onOpenChange(next);
  };

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Format harus JPG, PNG, GIF, atau WebP");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const data = await uploadMediaFile(file, "content");
      // Drop a previously uploaded (but not yet inserted) image to avoid orphans.
      const previous = sessionUploadRef.current;
      if (previous && previous !== data.url) {
        deleteMediaFile(previous).catch(() => {});
      }
      sessionUploadRef.current = data.url;
      setPreviewUrl(data.url);
      if (!alt.trim()) {
        const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
        setAlt(baseName.slice(0, 120));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = () => {
    if (!previewUrl.trim()) {
      setError("Pilih gambar terlebih dahulu");
      return;
    }
    // The image is now committed into the article content — keep it.
    sessionUploadRef.current = null;
    onConfirm({
      src: previewUrl.trim(),
      alt: alt.trim(),
      caption: caption.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPortal open={open}>
        <DialogOverlay className="z-70" />
        <DialogContent
          className={cn(
            "z-71 w-[min(100vw-1.5rem,32rem)]",
            "border border-jepang-border bg-white shadow-xl",
          )}
          data-testid="article-image-insert-dialog"
        >
          <div className="flex items-center justify-between border-b border-jepang-border px-4 py-3">
            <div>
              <DialogTitle className="font-heading font-bold text-lg">
                Sisipkan Gambar
              </DialogTitle>
              <p className="text-xs text-jepang-muted mt-0.5">
                {/* TODO: tambahkan sistem maksimal ukuran file dan buat error handling jika melebihi maksimal dan pastikan setiap alert muncul dengan bahasa indonesia */}
                {/* TODO: terdapat bug saat menyisipkan gambar, saat menyisipkan gambar muncul error expected JSON response, received text/html;  */}
                Maks. 5 MB
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
              <Label htmlFor="article-image-file">File gambar</Label>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  id="article-image-file"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleFilePick}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={14} className="mr-2 animate-spin" />
                      Mengupload…
                    </>
                  ) : (
                    <>
                      <ImageIcon size={14} className="mr-2" />
                      Pilih & Upload
                    </>
                  )}
                </Button>
              </div>
            </div>

            {previewUrl ? (
              <div className="border border-jepang-border bg-jepang-off-white p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt={alt || "Pratinjau"}
                  className="mx-auto max-h-48 w-full object-contain"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="article-image-alt">Teks alternatif (alt)</Label>
              <Input
                id="article-image-alt"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Deskripsi singkat gambar"
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="article-image-caption">Sumber gambar (opsional)</Label>
              <Input
                id="article-image-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Contoh: Sumber: Kyodo News / Nama fotografer"
                maxLength={300}
              />
            </div>

            {error ? (
              <p className="text-sm text-jepang-red" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <div className="flex gap-2 border-t border-jepang-border px-4 py-3">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="flex-1">
                Batal
              </Button>
            </DialogClose>
            <Button
              type="button"
              className="flex-1"
              disabled={uploading || !previewUrl}
              onClick={handleConfirm}
              data-testid="article-image-insert-confirm"
            >
              Sisipkan
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
