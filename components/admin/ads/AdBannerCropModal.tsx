"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Loader2, RotateCcw, RotateCw, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { getAdSlotDimensions, getAdSlotAspect } from "@/lib/ads/dimensions";
import { getCroppedAdBannerBlob } from "@/lib/ad-crop";
import { cn } from "@/lib/utils";

export type AdBannerCropModalProps = {
  open: boolean;
  imageSrc: string | null;
  position: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (file: File) => Promise<void>;
};

export default function AdBannerCropModal({
  open,
  imageSrc,
  position,
  onOpenChange,
  onConfirm,
}: AdBannerCropModalProps) {
  const { width, height } = getAdSlotDimensions(position);
  const aspect = getAdSlotAspect(position);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels || processing) return;

    setProcessing(true);
    try {
      const blob = await getCroppedAdBannerBlob(
        imageSrc,
        croppedAreaPixels,
        position,
        rotation,
      );
      const file = new File([blob], `banner-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      await onConfirm(file);
      onOpenChange(false);
      setRotation(0);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    } catch {
      // onConfirm menampilkan toast; modal tetap terbuka agar bisa coba lagi
    } finally {
      setProcessing(false);
    }
  };

  if (!imageSrc) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal open={open}>
        <DialogOverlay className="z-70" />
        <DialogContent
          className={cn(
            "z-71 w-[min(100vw-1.5rem,36rem)]",
            "border border-jepang-border bg-white shadow-xl",
          )}
          data-testid="ad-banner-crop-modal"
        >
          <div className="flex items-center justify-between border-b border-jepang-border px-4 py-3">
            <div>
              <DialogTitle className="font-heading font-bold text-lg">
                Crop Banner Iklan
              </DialogTitle>
              <p className="text-xs text-jepang-muted mt-0.5">
                Ukuran target {width}×{height}px
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

          <div className="relative h-72 bg-jepang-navy">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              cropShape="rect"
              showGrid
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="space-y-4 border-t border-jepang-border px-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-jepang-muted">
                <ZoomIn size={14} />
                Zoom
              </div>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-jepang-red"
                aria-label="Zoom banner"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-jepang-muted">
                Putar
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRotation((r) => r - 90)}
                aria-label="Putar kiri"
              >
                <RotateCcw size={14} />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRotation((r) => r + 90)}
                aria-label="Putar kanan"
              >
                <RotateCw size={14} />
              </Button>
              <span className="ml-auto text-xs font-mono text-jepang-muted">
                {rotation}°
              </span>
            </div>

            <div className="flex gap-2 pt-1">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Batal
                </Button>
              </DialogClose>
              <Button
                type="button"
                className="flex-1"
                disabled={processing || !croppedAreaPixels}
                onClick={handleConfirm}
                data-testid="ad-banner-crop-confirm"
              >
                {processing ? (
                  <>
                    <Loader2 size={14} className="mr-2 animate-spin" />
                    Memproses…
                  </>
                ) : (
                  "Gunakan Gambar"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
