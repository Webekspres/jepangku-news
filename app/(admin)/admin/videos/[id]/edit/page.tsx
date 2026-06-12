"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";

export default function AdminVideoEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    youtubeUrl: "",
    status: "DRAFT",
    isFeatured: false,
  });

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/admin/videos/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((video) => {
        setSlug(video.slug);
        setForm({
          title: video.title ?? "",
          description: video.description ?? "",
          youtubeUrl: video.youtubeId ?? "",
          status: video.status ?? "DRAFT",
          isFeatured: Boolean(video.isFeatured),
        });
      })
      .catch(() => toast.error("Video tidak ditemukan"))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.youtubeUrl.trim()) {
      toast.error("Judul dan URL YouTube wajib diisi");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/videos/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui video");
      toast.success("Video diperbarui");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui video");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminPageShell title="Edit Video" backHref="/admin/videos">
        <div className="space-y-4 max-w-2xl">
          <SkeletonBox className="h-10 w-full" />
          <SkeletonBox className="h-10 w-full" />
          <SkeletonBox className="h-32 w-full" />
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Edit Video"
      subtitle={slug ? `Slug: ${slug}` : undefined}
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
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">URL atau ID YouTube *</label>
              <Input
                value={form.youtubeUrl}
                onChange={(e) => setForm((f) => ({ ...f, youtubeUrl: e.target.value }))}
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
                    disabled={form.status !== "PUBLISHED"}
                  />
                  Featured di homepage
                </label>
              </div>
            </div>

            {slug && form.status === "PUBLISHED" ? (
              <p className="text-sm text-jepang-muted">
                Pratinjau publik:{" "}
                <Link href={`/tv/${slug}`} className="text-jepang-red hover:underline" target="_blank">
                  /tv/{slug}
                </Link>
              </p>
            ) : null}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/admin/videos")}>
                Kembali
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}
