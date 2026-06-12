"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import { AD_SLOT_POSITIONS } from "@/lib/ads/constants";

function toDatetimeLocal(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function AdminAdEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    position: "homepage-mid",
    title: "",
    imageUrl: "",
    linkUrl: "",
    altText: "",
    isActive: true,
    startAt: "",
    endAt: "",
    sortOrder: "0",
  });

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/admin/ads/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((ad) => {
        setForm({
          position: ad.position ?? "homepage-mid",
          title: ad.title ?? "",
          imageUrl: ad.imageUrl ?? "",
          linkUrl: ad.linkUrl ?? "",
          altText: ad.altText ?? "",
          isActive: Boolean(ad.isActive),
          startAt: toDatetimeLocal(ad.startAt),
          endAt: toDatetimeLocal(ad.endAt),
          sortOrder: String(ad.sortOrder ?? 0),
        });
      })
      .catch(() => toast.error("Banner tidak ditemukan"))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl.trim()) {
      toast.error("URL gambar wajib diisi");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/ads/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sortOrder: Number(form.sortOrder) || 0,
          startAt: form.startAt || null,
          endAt: form.endAt || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui banner");
      toast.success("Banner diperbarui");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui banner");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminPageShell title="Edit Banner" backHref="/admin/ads">
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
      title="Edit Banner"
      subtitle={`Slot: ${form.position}`}
      label="Banner & Iklan"
      backHref="/admin/ads"
      backLabel="Daftar Banner"
    >
      <Card>
        <CardContent className="pt-6">
          {form.imageUrl ? (
            <div className="mb-6 overflow-hidden rounded-lg border border-jepang-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.imageUrl} alt="Pratinjau banner" className="w-full h-auto max-h-48 object-cover" />
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Slot posisi *</label>
              <select
                value={form.position}
                onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                className="w-full rounded-md border border-jepang-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jepang-red"
              >
                {AD_SLOT_POSITIONS.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Judul internal</label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">URL gambar *</label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">URL tujuan (klik)</label>
              <Input
                value={form.linkUrl}
                onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Teks alt gambar</label>
              <Input
                value={form.altText}
                onChange={(e) => setForm((f) => ({ ...f, altText: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Mulai tampil</label>
                <Input
                  type="datetime-local"
                  value={form.startAt}
                  onChange={(e) => setForm((f) => ({ ...f, startAt: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Berakhir</label>
                <Input
                  type="datetime-local"
                  value={form.endAt}
                  onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Urutan</label>
                <Input
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="rounded border-jepang-border"
              />
              Aktif
            </label>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/admin/ads")}>
                Kembali
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}
