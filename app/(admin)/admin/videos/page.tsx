"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Star, Tv } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { confirm, confirmProps } = useConfirm();

  useEffect(() => {
    loadVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadVideos = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    const url = `/api/admin/videos${params.toString() ? `?${params}` : ""}`;
    const data = await fetch(url).then((r) => r.json());
    setVideos(Array.isArray(data) ? data : []);
    setLoading(false);
  };

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
        loadVideos();
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
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Gagal menghapus video");
        toast.success("Video dihapus");
        setVideos((prev) => prev.filter((v) => v.id !== videoId));
      },
    });
  };

  const handleToggleFeatured = async (video: AdminVideo) => {
    const res = await fetch(`/api/admin/videos/${video.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !video.isFeatured }),
    });
    if (!res.ok) {
      toast.error("Gagal mengubah status featured");
      return;
    }
    toast.success(video.isFeatured ? "Featured dihapus" : "Video dijadikan featured");
    loadVideos();
  };

  return (
    <div data-testid="admin-videos-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <p className="section-label mb-1">Konten</p>
          <h1 className="font-heading font-black text-3xl tracking-tighter flex items-center gap-2">
            <Tv size={28} className="text-jepang-red" />
            Jepangku TV
          </h1>
        </div>
        <Button onClick={() => router.push("/admin/videos/create")} data-testid="create-video-btn">
          <Plus size={16} className="mr-2" />
          Tambah Video
        </Button>
      </div>

      <Card className="mb-6 p-4">
        <div className="flex flex-wrap gap-2">
          {["", "DRAFT", "PUBLISHED", "ARCHIVED"].map((s) => (
            <button
              key={s || "all"}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider border transition-colors ${
                statusFilter === s
                  ? "bg-jepang-navy text-white border-jepang-navy"
                  : "border-jepang-border hover:border-jepang-navy"
              }`}
            >
              {s ? STATUS_LABEL[s] : "Semua"}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <SkeletonBox key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="p-12 text-center text-jepang-muted">
            Belum ada video. Tambah video pertama!
          </div>
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
                        video.isFeatured ? "text-jepang-red" : "text-jepang-muted hover:text-jepang-red"
                      }`}
                      title={video.isFeatured ? "Hapus featured" : "Jadikan featured"}
                      disabled={video.status !== "PUBLISHED"}
                    >
                      <Star size={16} fill={video.isFeatured ? "currentColor" : "none"} />
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
      </Card>

      <ConfirmModal {...confirmProps} />
    </div>
  );
}
