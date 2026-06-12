"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import { ConfirmModal, useConfirm } from "@/components/ui/confirm-modal";
import { AD_SLOT_POSITIONS, getAdSlotLabel } from "@/lib/ads/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AdminAd = {
  id: string;
  position: string;
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  startAt: string | null;
  endAt: string | null;
  sortOrder: number;
};

export default function AdminAdsPage() {
  const [ads, setAds] = useState<AdminAd[]>([]);
  const [positionFilter, setPositionFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { confirm, confirmProps } = useConfirm();

  useEffect(() => {
    loadAds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionFilter]);

  const loadAds = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (positionFilter) params.set("position", positionFilter);
    const url = `/api/admin/ads${params.toString() ? `?${params}` : ""}`;
    const data = await fetch(url).then((r) => r.json());
    setAds(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleToggleActive = async (ad: AdminAd) => {
    const res = await fetch(`/api/admin/ads/${ad.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !ad.isActive }),
    });
    if (!res.ok) {
      toast.error("Gagal mengubah status iklan");
      return;
    }
    toast.success(ad.isActive ? "Iklan dinonaktifkan" : "Iklan diaktifkan");
    loadAds();
  };

  const handleDelete = (ad: AdminAd) => {
    confirm({
      title: "Hapus Banner?",
      description: `"${ad.title || ad.position}" akan dihapus permanen.`,
      confirmLabel: "Ya, Hapus",
      variant: "danger",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/ads/${ad.id}`, { method: "DELETE" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Gagal menghapus iklan");
        toast.success("Banner dihapus");
        setAds((prev) => prev.filter((item) => item.id !== ad.id));
      },
    });
  };

  return (
    <div data-testid="admin-ads-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <p className="section-label mb-1">Monetisasi</p>
          <h1 className="font-heading font-black text-3xl tracking-tighter flex items-center gap-2">
            <Megaphone size={28} className="text-jepang-red" />
            Banner & Iklan
          </h1>
        </div>
        <Button onClick={() => router.push("/admin/ads/create")} data-testid="create-ad-btn">
          <Plus size={16} className="mr-2" />
          Tambah Banner
        </Button>
      </div>

      <Card className="mb-6 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPositionFilter("")}
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider border transition-colors ${
              positionFilter === ""
                ? "bg-jepang-navy text-white border-jepang-navy"
                : "border-jepang-border hover:border-jepang-navy"
            }`}
          >
            Semua
          </button>
          {AD_SLOT_POSITIONS.map((slot) => (
            <button
              key={slot.value}
              type="button"
              onClick={() => setPositionFilter(slot.value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider border transition-colors ${
                positionFilter === slot.value
                  ? "bg-jepang-navy text-white border-jepang-navy"
                  : "border-jepang-border hover:border-jepang-navy"
              }`}
            >
              {slot.value}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <SkeletonBox key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : ads.length === 0 ? (
          <div className="p-12 text-center text-jepang-muted">
            Belum ada banner. Tambah banner pertama!
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banner</TableHead>
                <TableHead>Slot</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Urutan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ads.map((ad) => (
                <TableRow key={ad.id} data-testid={`admin-ad-row-${ad.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ad.imageUrl}
                        alt=""
                        className="h-12 w-20 rounded object-cover border border-jepang-border shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold line-clamp-1">
                          {ad.title || "Tanpa judul"}
                        </p>
                        {ad.linkUrl ? (
                          <p className="text-xs text-jepang-muted truncate max-w-[200px]">
                            {ad.linkUrl}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{getAdSlotLabel(ad.position)}</TableCell>
                  <TableCell>
                    <button type="button" onClick={() => handleToggleActive(ad)}>
                      <Badge variant={ad.isActive ? "success" : "muted"}>
                        {ad.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{ad.sortOrder}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/admin/ads/${ad.id}/edit`}>
                          <Pencil size={14} />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-jepang-red hover:text-jepang-red"
                        onClick={() => handleDelete(ad)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <ConfirmModal {...confirmProps} />
    </div>
  );
}
