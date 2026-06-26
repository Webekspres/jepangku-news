"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AdBannerCropModal from "@/components/admin/ads/AdBannerCropModal";
import { getAdSlotDimensions } from "@/lib/ads/dimensions";
import {
  deleteMediaFile,
  discardStagedUrl,
  getReplacedUrl,
  isStagedUrl,
  stageFile,
} from "@/lib/upload-media";

type AdBannerUploadFieldProps = {
  position: string;
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  disabled?: boolean;
};

export default function AdBannerUploadField({
  position,
  imageUrl,
  onImageUrlChange,
  disabled = false,
}: AdBannerUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { width, height } = getAdSlotDimensions(position);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format harus JPG, PNG, atau WebP");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setCropImageSrc(objectUrl);
    setCropOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const stageCroppedBanner = async (file: File) => {
    // Preserve the original saved URL across re-crops so it is cleaned up on save.
    const replaced = isStagedUrl(imageUrl)
      ? getReplacedUrl(imageUrl)
      : imageUrl || undefined;
    if (isStagedUrl(imageUrl)) discardStagedUrl(imageUrl);
    onImageUrlChange(stageFile(file, "banner", replaced));
    toast.success('Gambar siap. Klik "Simpan" untuk menerapkan.');
  };

  const handleRemove = async () => {
    if (isStagedUrl(imageUrl)) {
      const carried = getReplacedUrl(imageUrl);
      discardStagedUrl(imageUrl);
      onImageUrlChange("");
      if (carried) {
        setDeleting(true);
        try {
          await deleteMediaFile(carried);
        } catch {
          // best effort
        } finally {
          setDeleting(false);
        }
      }
      return;
    }
    const previous = imageUrl;
    onImageUrlChange("");
    if (previous) {
      setDeleting(true);
      try {
        await deleteMediaFile(previous);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Gagal menghapus gambar");
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleCropOpenChange = (open: boolean) => {
    setCropOpen(open);
    if (!open && cropImageSrc) {
      URL.revokeObjectURL(cropImageSrc);
      setCropImageSrc(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <label className="block text-sm font-semibold">Gambar banner *</label>
          <p className="text-xs text-jepang-muted mt-0.5">
            Crop ke {width}×{height}px sesuai slot
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || deleting}
            onClick={() => fileInputRef.current?.click()}
            data-testid="ad-banner-upload-btn"
          >
            {deleting ? (
              <Loader2 size={14} className="mr-1 animate-spin" />
            ) : (
              <ImagePlus size={14} className="mr-1" />
            )}
            {imageUrl ? "Ganti Gambar" : "Pilih & Crop"}
          </Button>
          {imageUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || deleting}
              onClick={handleRemove}
              className="text-jepang-red border-jepang-red hover:bg-jepang-red hover:text-white"
              data-testid="ad-banner-remove-btn"
            >
              <Trash2 size={14} className="mr-1" />
              Hapus
            </Button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {imageUrl ? (
        <div className="overflow-hidden rounded-lg border border-jepang-border bg-jepang-off-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Pratinjau banner"
            className="w-full h-auto max-h-48 object-contain"
          />
        </div>
      ) : (
        <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-jepang-border bg-jepang-off-white px-4 text-center text-sm text-jepang-muted">
          Belum ada gambar — unggah lalu crop ke ukuran slot
        </div>
      )}

      <AdBannerCropModal
        open={cropOpen}
        imageSrc={cropImageSrc}
        position={position}
        onOpenChange={handleCropOpenChange}
        onConfirm={stageCroppedBanner}
      />
    </div>
  );
}
