"use client";

import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminPointTransaction } from "@/lib/admin/point-transactions";
import { cn } from "@/lib/utils";

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 py-2 border-b border-jepang-border last:border-0 text-sm">
      <span className="text-jepang-muted font-mono text-xs uppercase tracking-wider">
        {label}
      </span>
      <div className="min-w-0 wrap-break-word">{children}</div>
    </div>
  );
}

export type PointTransactionDetailModalProps = {
  transaction: AdminPointTransaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function PointTransactionDetailModal({
  transaction,
  open,
  onOpenChange,
}: PointTransactionDetailModalProps) {
  if (!transaction) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-70 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-71 w-[min(100vw-2rem,32rem)] -translate-x-1/2 -translate-y-1/2",
            "border border-jepang-border bg-white shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
          data-testid="point-transaction-detail-modal"
        >
          <div className="flex items-start justify-between gap-3 border-b border-jepang-border px-5 py-4">
            <div>
              <DialogPrimitive.Title className="font-heading font-bold text-lg text-jepang-navy">
                Detail Transaksi
              </DialogPrimitive.Title>
              <p className="text-sm text-jepang-muted mt-1">{transaction.activityLabel}</p>
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

          <div className="px-5 py-4">
            <DetailRow label="Poin">
              <span className="font-mono font-bold text-jepang-red">
                +{transaction.points}
              </span>
            </DetailRow>
            <DetailRow label="Waktu">
              {new Date(transaction.occurredAt).toLocaleString("id-ID", {
                dateStyle: "full",
                timeStyle: "medium",
              })}
            </DetailRow>
            <DetailRow label="Sumber">
              <p className="font-semibold text-jepang-navy">{transaction.source.label}</p>
              <p className="text-xs text-jepang-muted mt-0.5">
                {transaction.source.typeLabel}
              </p>
              {transaction.source.href && (
                <Link
                  href={transaction.source.href}
                  className="mt-1 inline-block text-xs text-jepang-orange hover:underline"
                >
                  <span className="inline-flex items-center gap-1">Buka di admin</span>
                  <ArrowRight size={12} />
                </Link>
              )}
            </DetailRow>
            {transaction.description &&
              transaction.description !== transaction.activityLabel && (
                <DetailRow label="Catatan">{transaction.description}</DetailRow>
              )}
            <DetailRow label="Pengguna">
              <p className="font-semibold">{transaction.user.name}</p>
              <p className="text-xs text-jepang-muted">@{transaction.user.username}</p>
              <p className="text-xs text-jepang-muted">{transaction.user.email}</p>
              <Link
                href={`/admin/users/${transaction.user.id}`}
                className="mt-1 inline-block text-xs text-jepang-orange hover:underline"
              >
                Profil pengguna →
              </Link>
            </DetailRow>
          </div>

          <div className="border-t border-jepang-border px-5 py-4 flex justify-end">
            <DialogPrimitive.Close asChild>
              <Button variant="outline" size="sm">
                Tutup
              </Button>
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
