"use client";

import Link from "next/link";
import { Sparkles, X } from "lucide-react";
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

type WelcomeModalProps = {
  open: boolean;
  onDismiss: () => void;
};

export default function WelcomeModal({ open, onDismiss }: WelcomeModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onDismiss()}>
      <DialogPortal open={open}>
        <DialogOverlay className="z-60" />
        <DialogContent
          className="z-60 w-[min(100vw-2rem,26rem)] border border-jepang-border bg-white p-6 shadow-jepang-lg"
          data-testid="welcome-modal"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-11 w-11 items-center justify-center bg-jepang-red text-white">
              <Sparkles size={22} strokeWidth={1.5} />
            </div>
            <DialogClose
              className="p-1 text-jepang-muted hover:text-foreground"
              aria-label="Tutup"
            >
              <X size={18} />
            </DialogClose>
          </div>

          <DialogTitle className="mt-4 font-heading text-2xl font-bold tracking-tight">
            Selamat datang di Jepangku!
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-relaxed text-jepang-muted">
            Jelajahi artikel, kumpulkan poin, ikuti kuis & polling, dan
            bergabung dengan komunitas pecinta Jepang.
          </DialogDescription>

          <div className="mt-6 flex flex-col gap-2">
            <Button type="button" onClick={onDismiss} data-testid="welcome-modal-dismiss">
              Mulai jelajah
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/leaderboard">Lihat leaderboard</Link>
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
