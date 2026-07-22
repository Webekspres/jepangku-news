"use client";

import { useState } from "react";
import { parseApiResponse } from "@/lib/fetch-api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AdminCard from "@/components/admin/AdminCard";
import AdminPageShell from "@/components/admin/AdminPageShell";
import RichTextEditor from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseVideoUrl, PLATFORM_LABELS } from "@/lib/video/platform";

const VIDEO_URL_PLACEHOLDER =
  "https://youtube.com/watch?v=... · https://facebook.com/watch/?v=... · https://tiktok.com/@user/video/... · dll";

export default function AdminVideoCreatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    videoUrl: "",
    status: "DRAFT",
    isFeatured: false,
  });

  // Preview deteksi platform secara real-time
  const parsedPreview = form.videoUrl.trim() ? parseVideoUrl(form.videoUrl.trim()) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.videoUrl.trim()) {
      toast.error("Judul dan URL video wajib diisi");
      return;
    }

    if (!parsedPreview) {
      toast.error(
        "URL video tidak valid. Masukkan URL YouTube, Facebook, TikTok, Instagram, atau URL video lainnya.",
      );
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await parseApiResponse(res);
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan video");
      toast.success("Video berhasil dibuat");
      router.push(`/admin/videos/${data.id}/edit`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan video");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageShell
      title="Tambah Video"
      subtitle="Tambah video dari YouTube, Facebook, TikTok, Instagram, atau platform lain ke Jepangku TV."
      label="Jepangku TV"
      backHref="/admin/videos"
      backLabel="Daftar Video"
      testId="admin-create-video-page"
    >
      <AdminCard>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Judul *</label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Judul video"
              required
              data-testid="video-title-input"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">URL Video *</label>
            <Input
              value={form.videoUrl}
              onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
              placeholder={VIDEO_URL_PLACEHOLDER}
              required
              data-testid="video-url-input"
            />
            {/* Deteksi platform real-time */}
            {form.videoUrl.trim() && (
              <p
                className={`mt-1.5 text-xs font-semibold ${
                  parsedPreview ? "text-green-600" : "text-red-500"
                }`}
              >
                {parsedPreview
                  ? `✓ Terdeteksi: ${PLATFORM_LABELS[parsedPreview.platform]}${
                      !parsedPreview.supportsEmbed
                        ? " — akan ditampilkan sebagai link-out (embed tidak didukung)"
                        : ""
                    }`
                  : "✗ URL tidak dikenali. Pastikan format URL benar dan diawali http/https."}
              </p>
            )}
            <p className="mt-1 text-xs text-jepang-muted">
              Platform yang didukung: YouTube, Facebook, TikTok, Instagram (link-out), atau URL video
              lainnya.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-1.5">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              className="w-full rounded-md border border-jepang-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jepang-red"
              placeholder="Deskripsi singkat (opsional)"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Konten artikel</label>
            <RichTextEditor
              value={form.content}
              onChange={(content) => setForm((f) => ({ ...f, content }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full rounded-md border border-jepang-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jepang-red"
              >
                <option value="DRAFT">Draf</option>
                <option value="PUBLISHED">Terbit</option>
                <option value="ARCHIVED">Arsip</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                  className="rounded border-jepang-border"
                />
                Jadikan featured di homepage
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving} data-testid="create-video-submit">
              {saving ? "Menyimpan..." : "Simpan Video"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/videos")}
            >
              Batal
            </Button>
          </div>
        </form>
      </AdminCard>
    </AdminPageShell>
  );
}
