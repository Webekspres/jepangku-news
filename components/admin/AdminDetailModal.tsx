"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

export function AdminDetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 border-b border-jepang-border py-2 text-sm last:border-0">
      <span className="font-mono text-xs uppercase tracking-wider text-jepang-muted">
        {label}
      </span>
      <div className="min-w-0 wrap-break-word">{children}</div>
    </div>
  );
}

export type AdminDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  testId?: string;
};

export default function AdminDetailModal({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  footer,
  testId,
}: AdminDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal open={open}>
        <DialogOverlay />
        <DialogContent
          className={cn(
            "w-[min(100vw-2rem,32rem)] rounded-lg border border-jepang-border bg-white shadow-jepang-lg",
          )}
          data-testid={testId}
        >
          <div className="flex items-start justify-between gap-3 border-b border-jepang-border px-5 py-4">
            <div>
              <DialogTitle className="font-heading text-lg font-bold text-jepang-navy">
                {title}
              </DialogTitle>
              {subtitle ? (
                <p className="mt-1 text-sm text-jepang-muted">{subtitle}</p>
              ) : null}
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

          <div className="px-5 py-4">{children}</div>

          <div className="flex justify-end border-t border-jepang-border px-5 py-4">
            {footer ?? (
              <DialogClose asChild>
                <Button variant="outline" size="sm">
                  Tutup
                </Button>
              </DialogClose>
            )}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
