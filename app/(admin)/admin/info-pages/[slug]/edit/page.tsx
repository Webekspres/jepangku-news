"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Save, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/RichTextEditor";
import SectionHeader from "@/components/SectionHeader";
import { useAuth } from "@/contexts/AuthContext";
import { INFO_PAGE_LABELS, isInfoPageSlug } from "@/lib/info-pages";

export default function AdminEditInfoPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    isPublished: true,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || (user as { role?: string }).role !== "ADMIN")) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!slug || !isInfoPageSlug(slug)) return;

    setFetching(true);
    fetch(`/api/admin/info-pages/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Halaman tidak ditemukan");
        return r.json();
      })
      .then((data) => {
        setForm({
          title: data.title || "",
          subtitle: data.subtitle || "",
          content: data.content || "",
          metaTitle: data.metaTitle || "",
          metaDescription: data.metaDescription || "",
          isPublished: data.isPublished ?? true,
        });
      })
      .catch(() => {
        toast.error("Gagal memuat halaman");
        router.push("/admin/info-pages");
      })
      .finally(() => setFetching(false));
  }, [slug, router]);

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Judul wajib diisi");
      return;
    }
    if (!form.content.trim()) {
      toast.error("Konten wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/info-pages/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menyimpan");
      }

      toast.success("Halaman berhasil disimpan");
      router.push("/admin/info-pages");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal menyimpan";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || (user as { role?: string }).role !== "ADMIN") {
    return null;
  }

  if (!isInfoPageSlug(slug)) {
    return (
      <div className="px-4 mx-auto max-w-7xl py-12">
        <p>Halaman tidak ditemukan.</p>
      </div>
    );
  }

  const pageLabel = INFO_PAGE_LABELS[slug];

  return (
    <div data-testid={`admin-edit-info-page-${slug}`}>
      <SectionHeader
        label="管理 / ADMIN"
        title={`Edit: ${pageLabel}`}
        subtitle={`Slug: /${slug}`}
        className="border-b border-jepang-border bg-jepang-navy text-white"
      />

      <div className="px-4 mx-auto max-w-4xl py-12">
        <div className="flex flex-wrap gap-3 mb-8">
          <Button variant="outline" asChild>
            <Link href="/admin/info-pages">
              <ArrowLeft size={14} strokeWidth={1.5} className="mr-1" />
              Kembali
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/${slug}`} target="_blank">
              <ExternalLink size={14} strokeWidth={1.5} className="mr-1" />
              Pratinjau
            </Link>
          </Button>
        </div>

        {fetching ? (
          <p className="text-jepang-muted">Memuat...</p>
        ) : (
          <div className="space-y-6 border border-jepang-border bg-white p-6">
            <div className="space-y-2">
              <Label>
                Judul <span className="text-jepang-red">*</span>
              </Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                data-testid="info-page-title"
              />
            </div>

            <div className="space-y-2">
              <Label>Subjudul</Label>
              <Input
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                placeholder="Tagline singkat di bawah judul"
                data-testid="info-page-subtitle"
              />
            </div>

            <div className="space-y-2">
              <Label>
                Konten <span className="text-jepang-red">*</span>
              </Label>
              <RichTextEditor
                value={form.content}
                onChange={(html) => setForm((f) => ({ ...f, content: html }))}
                placeholder="Tulis konten halaman di sini..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-jepang-border">
              <div className="space-y-2">
                <Label>Meta Title (SEO)</Label>
                <Input
                  value={form.metaTitle}
                  onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
                  placeholder="Opsional"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  className="flex h-10 w-full border border-jepang-border bg-white px-3 text-sm"
                  value={form.isPublished ? "published" : "draft"}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      isPublished: e.target.value === "published",
                    }))
                  }
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Meta Description (SEO)</Label>
              <Textarea
                value={form.metaDescription}
                onChange={(e) =>
                  setForm((f) => ({ ...f, metaDescription: e.target.value }))
                }
                placeholder="Opsional"
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-jepang-border">
              <Button onClick={handleSave} disabled={loading} data-testid="save-info-page">
                <Save size={14} strokeWidth={1.5} className="mr-1" />
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
