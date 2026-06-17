"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,32rem)] -translate-x-1/2 -translate-y-1/2",
            "rounded-lg border border-jepang-border bg-white shadow-jepang-lg",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "duration-200",
          )}
          data-testid={testId}
        >
          <div className="flex items-start justify-between gap-3 border-b border-jepang-border px-5 py-4">
            <div>
              <DialogPrimitive.Title className="font-heading text-lg font-bold text-jepang-navy">
                {title}
              </DialogPrimitive.Title>
              {subtitle ? (
                <p className="mt-1 text-sm text-jepang-muted">{subtitle}</p>
              ) : null}
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className="rounded-md p-1.5 text-jepang-muted hover:bg-jepang-off-white"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </DialogPrimitive.Close>
          </div>

          <div className="px-5 py-4">{children}</div>

          <div className="flex justify-end border-t border-jepang-border px-5 py-4">
            {footer ?? (
              <DialogPrimitive.Close asChild>
                <Button variant="outline" size="sm">
                  Tutup
                </Button>
              </DialogPrimitive.Close>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
