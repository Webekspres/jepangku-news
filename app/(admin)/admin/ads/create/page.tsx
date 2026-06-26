"use client";

import { useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AdminCard from "@/components/admin/AdminCard";
import AdminPageShell from "@/components/admin/AdminPageShell";
import AdBannerUploadField from "@/components/admin/ads/AdBannerUploadField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AD_SLOT_POSITIONS } from "@/lib/ads/constants";

export default function AdminAdCreatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    position: "center",
    title: "",
    imageUrl: "",
    linkUrl: "",
    altText: "",
    isActive: true,
    startAt: "",
    endAt: "",
    sortOrder: "0",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl.trim()) {
      toast.error("URL gambar wajib diisi");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sortOrder: Number(form.sortOrder) || 0,
          startAt: form.startAt || null,
          endAt: form.endAt || null,
        }),
      });
      const data = await parseApiResponse(res);
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan banner");
      toast.success("Banner berhasil dibuat");
      router.push(`/admin/ads/${data.id}/edit`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan banner");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageShell
      title="Tambah Banner"
      subtitle="Banner statis untuk slot homepage dan kemitraan brand."
      label="Banner & Iklan"
      backHref="/admin/ads"
      backLabel="Daftar Banner"
    >
      <AdminCard>
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
                placeholder="Contoh: Partner JLPT Course"
              />
            </div>

            <AdBannerUploadField
              position={form.position}
              imageUrl={form.imageUrl}
              onImageUrlChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
            />

            <div>
              <label className="block text-sm font-semibold mb-1.5">URL tujuan (klik)</label>
              <Input
                value={form.linkUrl}
                onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Teks alt gambar</label>
              <Input
                value={form.altText}
                onChange={(e) => setForm((f) => ({ ...f, altText: e.target.value }))}
                placeholder="Deskripsi aksesibilitas banner"
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
                {saving ? "Menyimpan..." : "Simpan Banner"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/admin/ads")}>
                Batal
              </Button>
            </div>
          </form>
      </AdminCard>
    </AdminPageShell>
  );
}
