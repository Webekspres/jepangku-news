"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Star, Tv, FileVideo, Eye, FileEdit } from "lucide-react";
import { toast } from "sonner";
import AdminCard from "@/components/admin/AdminCard";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminStatCards from "@/components/admin/AdminStatCards";
import { AdminFilterButtons, AdminToolbar } from "@/components/admin/AdminToolbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import { ConfirmModal, useConfirm } from "@/components/ui/confirm-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AdminVideo = {
  id: string;
  title: string;
  slug: string;
  youtubeId: string;
  status: string;
  isFeatured: boolean;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
};

const STATUS_BADGE: Record<string, "success" | "warning" | "red" | "muted" | "black"> = {
  PUBLISHED: "success",
  DRAFT: "muted",
  ARCHIVED: "black",
};

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: "Terbit",
  DRAFT: "Draf",
  ARCHIVED: "Arsip",
};

const STATUS_FILTERS = [
  { value: "", label: "Semua" },
  { value: "DRAFT", label: "Draf" },
  { value: "PUBLISHED", label: "Terbit" },
  { value: "ARCHIVED", label: "Arsip" },
];

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ total: number; published: number; draft: number } | null>(
    null,
  );
  const [statsLoading, setStatsLoading] = useState(true);
  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(null);
  const featuredDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const { confirm, confirmProps } = useConfirm();

  useEffect(() => {
    fetch("/api/admin/videos/stats")
      .then((r) => parseApiResponse(r))
      .then(setStats)
      .finally(() => setStatsLoading(false));
  }, []);

  const loadVideos = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    const url = `/api/admin/videos${params.toString() ? `?${params}` : ""}`;
    const data = await fetch(url, { cache: "no-store" }).then((r) => parseApiResponse(r));
    setVideos(Array.isArray(data) ? data : []);
  }, [statusFilter]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadVideos().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [loadVideos]);

  const handlePublish = (videoId: string, title: string) => {
    confirm({
      title: "Terbitkan Video?",
      description: `"${title}" akan tampil di homepage dan halaman /tv.`,
      confirmLabel: "Ya, Terbitkan",
      variant: "info",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/videos/${videoId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "PUBLISHED" }),
        });
        if (!res.ok) throw new Error("Gagal menerbitkan video");
        toast.success("Video berhasil diterbitkan");
        setVideos((prev) =>
          prev.map((v) =>
            v.id === videoId
              ? { ...v, status: "PUBLISHED", publishedAt: new Date().toISOString() }
              : v,
          ),
        );
        fetch("/api/admin/videos/stats")
          .then((r) => parseApiResponse(r))
          .then(setStats);
      },
    });
  };

  const handleDelete = (videoId: string, title: string) => {
    confirm({
      title: "Hapus Video?",
      description: `"${title}" akan dihapus permanen. Hanya video draf yang bisa dihapus.`,
      confirmLabel: "Ya, Hapus",
      variant: "danger",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/videos/${videoId}`, { method: "DELETE" });
        const data = await parseApiResponse(res).catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Gagal menghapus video");
        toast.success("Video dihapus");
        setVideos((prev) => prev.filter((v) => v.id !== videoId));
      },
    });
  };

  const handleToggleFeatured = (video: AdminVideo) => {
    if (video.status !== "PUBLISHED" || togglingFeaturedId === video.id) return;

    if (featuredDebounceRef.current) {
      clearTimeout(featuredDebounceRef.current);
    }

    const nextFeatured = !video.isFeatured;
    setTogglingFeaturedId(video.id);

    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === video.id) return { ...v, isFeatured: nextFeatured };
        if (nextFeatured) return { ...v, isFeatured: false };
        return v;
      }),
    );

    featuredDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/videos/${video.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isFeatured: nextFeatured }),
        });
        const data = await parseApiResponse(res).catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Gagal mengubah status featured");

        if (data.video) {
          setVideos((prev) => {
            const updated = data.video as AdminVideo;
            return prev.map((v) => {
              if (v.id === updated.id) return { ...v, isFeatured: updated.isFeatured };
              if (updated.isFeatured) return { ...v, isFeatured: false };
              return v;
            });
          });
        }

        toast.success(
          nextFeatured ? "Video dijadikan featured" : "Featured dihapus",
        );
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Gagal mengubah featured");
        loadVideos();
      } finally {
        setTogglingFeaturedId(null);
      }
    }, 300);
  };

  return (
    <>
      <ConfirmModal {...confirmProps} />

      <AdminPageLayout
        testId="admin-videos-page"
        label="Konten"
        title={
          <>
            <Tv size={28} className="inline mr-2 text-jepang-red" />
            Jepangku TV
          </>
        }
        headerActions={
          <Button onClick={() => router.push("/admin/videos/create")} data-testid="create-video-btn">
            <Plus size={16} className="mr-2" />
            Tambah Video
          </Button>
        }
      >
        <AdminStatCards
          loading={statsLoading}
          skeletonCount={3}
          gridClassName="grid grid-cols-1 sm:grid-cols-3 gap-4"
          items={[
            {
              label: "Total Video",
              value: stats?.total ?? 0,
              icon: FileVideo,
              onClick: () => setStatusFilter(""),
              testId: "stat-total-video",
            },
            {
              label: "Terbit",
              value: stats?.published ?? 0,
              icon: Eye,
              onClick: () => setStatusFilter("PUBLISHED"),
              testId: "stat-video-terbit",
            },
            {
              label: "Draf",
              value: stats?.draft ?? 0,
              icon: FileEdit,
              onClick: () => setStatusFilter("DRAFT"),
              testId: "stat-video-draft",
            },
          ]}
        />
        <AdminToolbar>
          <AdminFilterButtons
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </AdminToolbar>

        <AdminCard
          title={`${loading ? "..." : videos.length} VIDEO`}
          variant="list"
          noPadding
        >
          {loading && videos.length === 0 ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <SkeletonBox key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : videos.length === 0 ? (
            <AdminEmptyState
              icon={Tv}
              title="Belum ada video"
              description="Tambah video pertama!"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video) => (
                  <TableRow key={video.id} data-testid={`admin-video-row-${video.id}`}>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="font-semibold line-clamp-1">{video.title}</p>
                        <p className="text-xs text-jepang-muted font-mono">{video.youtubeId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE[video.status] ?? "muted"}>
                        {STATUS_LABEL[video.status] ?? video.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(video)}
                        className={`p-1 rounded transition-colors ${
                          video.isFeatured
                            ? "text-jepang-red"
                            : "text-jepang-muted hover:text-jepang-red"
                        } ${togglingFeaturedId === video.id ? "opacity-50 pointer-events-none" : ""}`}
                        title={video.isFeatured ? "Hapus featured" : "Jadikan featured"}
                        disabled={video.status !== "PUBLISHED"}
                      >
                        <Star
                          size={16}
                          fill={video.isFeatured ? "currentColor" : "none"}
                        />
                      </button>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{video.viewCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {video.status === "DRAFT" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePublish(video.id, video.title)}
                          >
                            Terbitkan
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/admin/videos/${video.id}/edit`}>
                            <Pencil size={14} />
                          </Link>
                        </Button>
                        {video.status === "DRAFT" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-jepang-red hover:text-jepang-red"
                            onClick={() => handleDelete(video.id, video.title)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
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
