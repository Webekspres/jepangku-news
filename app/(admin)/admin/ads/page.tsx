"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import AdminCard from "@/components/admin/AdminCard";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import { AdminFilterButtons, AdminToolbar } from "@/components/admin/AdminToolbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const POSITION_FILTERS = [
  { value: "", label: "Semua" },
  ...AD_SLOT_POSITIONS.map((slot) => ({
    value: slot.value,
    label: slot.value,
  })),
];

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
    <>
      <ConfirmModal {...confirmProps} />

      <AdminPageLayout
        testId="admin-ads-page"
        label="Monetisasi"
        title={
          <>
            <Megaphone size={28} className="inline mr-2 text-jepang-red" />
            Banner & Iklan
          </>
        }
        headerActions={
          <Button onClick={() => router.push("/admin/ads/create")} data-testid="create-ad-btn">
            <Plus size={16} className="mr-2" />
            Tambah Banner
          </Button>
        }
      >
        {/* TODO: tambahkan card stats untuk mengetahui total banner dan total banner yang aktif */}
        {/* TODO: rapihkan UI tablenya agar UX nya nyaman tampilkan waktu aktif sampai waktu berakhir dan sisa hari, kemudian saya ingin ukuran lebar dan tinggi yang jelas sehingga ketiga gambar diupload ada crop gambar dulu, seperti saat upload foto profile, gunakan komponen yang sudah ada pastikan jelas pemisahan komponennya */}
        <AdminToolbar>
          <AdminFilterButtons
            options={POSITION_FILTERS}
            value={positionFilter}
            onChange={setPositionFilter}
          />
        </AdminToolbar>

        <AdminCard
          title={`${loading ? "..." : ads.length} BANNER`}
          variant="list"
          noPadding
        >
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <SkeletonBox key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : ads.length === 0 ? (
            <AdminEmptyState
              icon={Megaphone}
              title="Belum ada banner"
              description="Tambah banner pertama!"
            />
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
        </AdminCard>
      </AdminPageLayout>
    </>
  );
}
