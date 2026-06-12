"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminVideoCreatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    youtubeUrl: "",
    status: "DRAFT",
    isFeatured: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.youtubeUrl.trim()) {
      toast.error("Judul dan URL YouTube wajib diisi");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
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
      subtitle="Embed video YouTube untuk Jepangku TV di homepage dan halaman /tv."
      label="Jepangku TV"
      backHref="/admin/videos"
      backLabel="Daftar Video"
    >
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Judul *</label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Judul video"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">URL atau ID YouTube *</label>
              <Input
                value={form.youtubeUrl}
                onChange={(e) => setForm((f) => ({ ...f, youtubeUrl: e.target.value }))}
                placeholder="https://youtube.com/watch?v=... atau dQw4w9WgXcQ"
                required
              />
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
              <Button type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan Video"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/admin/videos")}>
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}
