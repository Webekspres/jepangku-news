"use client";

import { useEffect, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import { useRouter } from "next/navigation";
import { Plus, Megaphone, Image } from "lucide-react";
import { toast } from "sonner";
import AdminCard from "@/components/admin/AdminCard";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminStatCards from "@/components/admin/AdminStatCards";
import AdminAdsTable, {
  type AdminAdListItem,
} from "@/components/admin/ads/AdminAdsTable";
import { AdminFilterButtons, AdminToolbar } from "@/components/admin/AdminToolbar";
import { Button } from "@/components/ui/button";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import { ConfirmModal, useConfirm } from "@/components/ui/confirm-modal";
import { AD_SLOT_POSITIONS } from "@/lib/ads/constants";

const POSITION_FILTERS = [
  { value: "", label: "Semua" },
  ...AD_SLOT_POSITIONS.map((slot) => ({
    value: slot.value,
    label: slot.value,
  })),
];

export default function AdminAdsPage() {
  const [ads, setAds] = useState<AdminAdListItem[]>([]);
  const [positionFilter, setPositionFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ total: number; active: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const router = useRouter();
  const { confirm, confirmProps } = useConfirm();

  useEffect(() => {
    fetch("/api/admin/ads/stats")
      .then((r) => parseApiResponse(r))
      .then(setStats)
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    loadAds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionFilter]);

  const loadAds = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (positionFilter) params.set("position", positionFilter);
    const url = `/api/admin/ads${params.toString() ? `?${params}` : ""}`;
    const data = await fetch(url).then((r) => parseApiResponse(r));
    setAds(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleToggleActive = async (ad: AdminAdListItem) => {
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
    fetch("/api/admin/ads/stats")
      .then((r) => parseApiResponse(r))
      .then(setStats);
  };

  const handleDelete = (ad: AdminAdListItem) => {
    confirm({
      title: "Hapus Banner?",
      description: `"${ad.title || ad.position}" akan dihapus permanen.`,
      confirmLabel: "Ya, Hapus",
      variant: "danger",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/ads/${ad.id}`, { method: "DELETE" });
        const data = await parseApiResponse(res).catch(() => ({}));
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
        <AdminStatCards
          loading={statsLoading}
          skeletonCount={2}
          gridClassName="grid grid-cols-1 sm:grid-cols-2 gap-4"
          items={[
            {
              label: "Total Banner",
              value: stats?.total ?? 0,
              icon: Image,
              testId: "stat-total-banner",
            },
            {
              label: "Banner Aktif",
              value: stats?.active ?? 0,
              icon: Megaphone,
              testId: "stat-banner-aktif",
            },
          ]}
        />

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
            <AdminAdsTable
              ads={ads}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
            />
          )}
        </AdminCard>
      </AdminPageLayout>
    </>
  );
}
