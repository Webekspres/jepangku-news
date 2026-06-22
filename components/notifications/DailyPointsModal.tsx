"use client";

import { Award, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

type DailyPointsModalProps = {
  open: boolean;
  points: number;
  onDismiss: () => void;
};

export default function DailyPointsModal({
  open,
  points,
  onDismiss,
}: DailyPointsModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onDismiss()}>
      <DialogPortal open={open}>
        <DialogOverlay className="z-60" />
        <DialogContent
          className="z-60 w-[min(100vw-2rem,24rem)] border border-jepang-border bg-white p-6 shadow-jepang-lg"
          data-testid="daily-points-modal"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-11 w-11 items-center justify-center bg-jepang-navy text-white">
              <Award size={22} strokeWidth={1.5} />
            </div>
            <DialogClose
              className="p-1 text-jepang-muted hover:text-foreground"
              aria-label="Tutup"
            >
              <X size={18} />
            </DialogClose>
          </div>

          <DialogTitle className="mt-4 font-heading text-2xl font-bold tracking-tight">
            Poin harian +{points}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-relaxed text-jepang-muted">
            Kamu mendapat poin login hari ini. Terus aktif di Jepangku untuk
            mengumpulkan lebih banyak poin!
          </DialogDescription>

          <Button
            type="button"
            className="mt-6 w-full"
            onClick={onDismiss}
            data-testid="daily-points-modal-dismiss"
          >
            Mengerti
          </Button>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
