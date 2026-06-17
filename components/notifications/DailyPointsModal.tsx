"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Award, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onDismiss()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-60 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-60 w-[min(100vw-2rem,24rem)] -translate-x-1/2 -translate-y-1/2 border border-jepang-border bg-white p-6 shadow-jepang-lg"
          data-testid="daily-points-modal"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-11 w-11 items-center justify-center bg-jepang-navy text-white">
              <Award size={22} strokeWidth={1.5} />
            </div>
            <DialogPrimitive.Close
              className="p-1 text-jepang-muted hover:text-foreground"
              aria-label="Tutup"
            >
              <X size={18} />
            </DialogPrimitive.Close>
          </div>

          <DialogPrimitive.Title className="mt-4 font-heading text-2xl font-bold tracking-tight">
            Poin harian +{points}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-2 text-sm leading-relaxed text-jepang-muted">
            Kamu mendapat poin login hari ini. Terus aktif di Jepangku untuk
            mengumpulkan lebih banyak poin!
          </DialogPrimitive.Description>

          <Button
            type="button"
            className="mt-6 w-full"
            onClick={onDismiss}
            data-testid="daily-points-modal-dismiss"
          >
            Mengerti
          </Button>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
