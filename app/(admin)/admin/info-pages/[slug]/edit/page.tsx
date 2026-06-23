"use client";

import { useEffect, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, ExternalLink } from "lucide-react";
import AdminCard from "@/components/admin/AdminCard";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/RichTextEditor";
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
        const err = await parseApiResponse(res);
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
      <AdminPageLayout title="Halaman tidak ditemukan">
        <p>Halaman tidak ditemukan.</p>
      </AdminPageLayout>
    );
  }

  const pageLabel = INFO_PAGE_LABELS[slug];

  return (
    <AdminPageLayout
      testId={`admin-edit-info-page-${slug}`}
      title={`Edit: ${pageLabel}`}
      subtitle={`Slug: /${slug}`}
      backHref="/admin/info-pages"
      headerActions={
        <Button variant="outline" size="sm" asChild>
          <Link href={`/${slug}`} target="_blank">
            <ExternalLink size={14} strokeWidth={1.5} className="mr-1" />
            Pratinjau
          </Link>
        </Button>
      }
    >
      {fetching ? (
        <p className="text-jepang-muted">Memuat...</p>
      ) : (
        <AdminCard variant="panel">
          <div className="space-y-6">
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
        </AdminCard>
      )}
    </AdminPageLayout>
  );
}
