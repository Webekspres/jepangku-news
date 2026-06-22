"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AdBannerCropModal from "@/components/admin/ads/AdBannerCropModal";
import { getAdSlotDimensions } from "@/lib/ads/dimensions";
import { uploadMediaFile } from "@/lib/upload-media";

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
  const [uploading, setUploading] = useState(false);

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

  const uploadCroppedBanner = async (file: File) => {
    setUploading(true);
    try {
      const data = await uploadMediaFile(file, "banner");
      onImageUrlChange(data.url);
      toast.success("Gambar banner diunggah");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload gagal");
      throw err;
    } finally {
      setUploading(false);
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || uploading}
          onClick={() => fileInputRef.current?.click()}
          data-testid="ad-banner-upload-btn"
        >
          {uploading ? (
            <Loader2 size={14} className="mr-1 animate-spin" />
          ) : (
            <ImagePlus size={14} className="mr-1" />
          )}
          {imageUrl ? "Ganti Gambar" : "Unggah & Crop"}
        </Button>
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
        onConfirm={uploadCroppedBanner}
      />
    </div>
  );
}
