"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AdminDetailModal, { AdminDetailRow } from "@/components/admin/AdminDetailModal";
import type { AdminPointTransaction } from "@/lib/admin/point-transactions";

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
    <AdminDetailModal
      open={open}
      onOpenChange={onOpenChange}
      title="Detail Transaksi"
      subtitle={transaction.activityLabel}
      testId="point-transaction-detail-modal"
    >
      <AdminDetailRow label="Poin">
        <span className="font-mono font-bold text-jepang-red">+{transaction.points}</span>
      </AdminDetailRow>
      <AdminDetailRow label="Waktu">
        {new Date(transaction.occurredAt).toLocaleString("id-ID", {
          dateStyle: "full",
          timeStyle: "medium",
        })}
      </AdminDetailRow>
      <AdminDetailRow label="Sumber">
        <p className="font-semibold text-jepang-navy">{transaction.source.label}</p>
        <p className="mt-0.5 text-xs text-jepang-muted">{transaction.source.typeLabel}</p>
        {transaction.source.href && (
          <Link
            href={transaction.source.href}
            className="mt-1 inline-flex items-center gap-1 text-xs text-jepang-orange hover:underline"
          >
            Buka di admin
            <ArrowRight size={12} />
          </Link>
        )}
      </AdminDetailRow>
      {transaction.description && transaction.description !== transaction.activityLabel && (
        <AdminDetailRow label="Catatan">{transaction.description}</AdminDetailRow>
      )}
      <AdminDetailRow label="Pengguna">
        <p className="font-semibold">{transaction.user.name}</p>
        <p className="text-xs text-jepang-muted">@{transaction.user.username}</p>
        <p className="text-xs text-jepang-muted">{transaction.user.email}</p>
        <Link
          href={`/admin/users/${transaction.user.id}`}
          className="mt-1 inline-block text-xs text-jepang-orange hover:underline"
        >
          Profil pengguna →
        </Link>
      </AdminDetailRow>
    </AdminDetailModal>
  );
}
