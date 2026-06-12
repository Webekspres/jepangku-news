"use client";
export const dynamic = "force-dynamic";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Eye,
  PenSquare,
  Save,
  Upload,
  Globe,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RichTextEditor from "@/components/RichTextEditor";
import { AutosaveIndicator } from "@/components/ui/autosave-indicator";
import NextLink from "next/link";
import {
  useAutosave,
  type ArticleDraftInfo,
  type ArticleFormSnapshot,
} from "@/hooks/useAutosave";

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

async function apiCreateDraft(data: ArticleFormSnapshot): Promise<ArticleDraftInfo> {
  const res = await fetch("/api/admin/articles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      coverImageUrl: data.coverImageUrl || null,
      categoryId: data.categoryId || null,
      tags: data.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status: "DRAFT",
    }),
  });
  if (!res.ok) {
    const e = await res.json();
    throw new Error(e.error || "Gagal membuat draft");
  }
  const article = await res.json();
  return { id: article.id, slug: article.slug };
}

async function apiUpdateDraft(
  id: string,
  data: ArticleFormSnapshot,
): Promise<void> {
  const res = await fetch(`/api/admin/articles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      coverImageUrl: data.coverImageUrl || null,
      categoryId: data.categoryId || null,
      tags: data.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    }),
  });
  if (!res.ok) {
    const e = await res.json();
    throw new Error(e.error || "Gagal menyimpan draft");
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminCreateArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState<ArticleFormSnapshot>({
    title: "",
    excerpt: "",
    content: "",
    coverImageUrl: "",
    categoryId: "",
    tags: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []));
  }, []);

  const createDraft = useCallback(apiCreateDraft, []);
  const updateDraft = useCallback(apiUpdateDraft, []);

  const { status: autosaveStatus, lastSavedAt, draftId, setDraftInfo, getDraftId } =
    useAutosave({
      data: form,
      createDraft,
      updateDraft,
      debounceMs: 3000,
      disabled: loading,
    });

  // -------------------------------------------------------------------------

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const data = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      }).then((r) => {
        if (!r.ok) throw new Error("Upload failed");
        return r.json();
      });
      setForm((f) => ({ ...f, coverImageUrl: data.url }));
      toast.success("Gambar berhasil diupload");
    } catch {
      toast.error("Upload gagal");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (status: string) => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Judul dan konten wajib diisi");
      return;
    }
    setLoading(true);

    const draftId = getDraftId();
    const parsedTags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      let res: Response;

      if (draftId) {
        // A draft already exists — update it with the final status
        res = await fetch(`/api/admin/articles/${draftId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            excerpt: form.excerpt,
            content: form.content,
            coverImageUrl: form.coverImageUrl || null,
            categoryId: form.categoryId || null,
            tags: parsedTags,
            status,
          }),
        });
      } else {
        // No draft yet — create fresh
        res = await fetch("/api/admin/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            excerpt: form.excerpt,
            content: form.content,
            coverImageUrl: form.coverImageUrl || null,
            categoryId: form.categoryId || null,
            tags: parsedTags,
            status,
          }),
        });
      }

      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Gagal membuat artikel");
      }

      const article = await res.json();

      // Sync autosave state so a late-firing timer doesn't create a duplicate
      if (article?.id && article?.slug) {
        setDraftInfo({ id: article.id, slug: article.slug });
      }

      toast.success(
        status === "PUBLISHED"
          ? "Artikel dipublikasikan"
          : status === "DRAFT"
            ? "Draft berhasil disimpan"
            : "Artikel disimpan",
      );
      router.push("/admin/articles");
    } catch (e: unknown) {
      toast.error(
        e instanceof Error ? e.message : "Gagal menyimpan artikel",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-white min-h-screen"
      data-testid="admin-article-create-page"
    >
      <section className="border-b border-jepang-border bg-jepang-off-white">
        <div className="w-full px-4 lg:px-6 py-8">
          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted hover:text-jepang-red mb-4"
          >
            <ArrowLeft size={14} /> Kembali ke Artikel
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-red mb-2 flex items-center gap-2">
            <PenSquare size={14} /> ADMIN
          </p>
          <h1 className="font-heading font-black text-4xl tracking-tighter">
            Buat Artikel
          </h1>
          <p className="text-jepang-muted mt-2 max-w-2xl">
            Konten redaksi dapat langsung dipublikasikan tanpa antrian review.
          </p>
        </div>
      </section>

      <div className="w-full px-4 lg:px-6 py-12">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Judul <span className="text-jepang-red">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              className="text-xl font-heading font-bold"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Judul artikel..."
              data-testid="admin-article-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Ringkasan</Label>
            <Textarea
              id="excerpt"
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Deskripsi singkat artikel..."
              data-testid="admin-article-excerpt"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm({ ...form, categoryId: v })}
              >
                <SelectTrigger data-testid="admin-article-category">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tag (pisahkan dengan koma)</Label>
              <Input
                id="tags"
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="anime, manga, tokyo"
                data-testid="admin-article-tags"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Gambar Cover</Label>
            <div className="flex gap-3 items-start">
              <Input
                type="text"
                className="flex-1"
                value={form.coverImageUrl}
                onChange={(e) =>
                  setForm({ ...form, coverImageUrl: e.target.value })
                }
                placeholder="URL gambar atau upload..."
                data-testid="admin-article-cover"
              />
              <Button
                variant="outline"
                asChild
                disabled={uploading}
                className="cursor-pointer hover:bg-foreground hover:text-white shrink-0"
              >
                <label>
                  <Upload size={14} strokeWidth={1.5} />
                  {uploading ? "Mengunggah..." : "Unggah"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                </label>
              </Button>
            </div>
            {form.coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.coverImageUrl}
                alt="Preview cover"
                className="mt-3 max-h-48 object-cover border border-jepang-border"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Konten <span className="text-jepang-red">*</span>
            </Label>
            <RichTextEditor
              value={form.content}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
              placeholder="Tulis konten artikel di sini..."
            />
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-6 border-t border-jepang-border">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 flex-wrap">
              <Button
                variant="outline"
                onClick={() => handleSubmit("DRAFT")}
                disabled={loading}
                data-testid="admin-save-draft"
              >
                <Save size={14} strokeWidth={1.5} className="mr-1" />
                {loading ? "Menyimpan..." : "Simpan Draft"}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSubmit("PENDING_REVIEW")}
                disabled={loading}
                data-testid="admin-save-pending"
              >
                <FileText size={14} strokeWidth={1.5} className="mr-1" />
                Antrian Review
              </Button>
              <Button
                onClick={() => handleSubmit("PUBLISHED")}
                disabled={loading}
                data-testid="admin-publish"
              >
                <Globe size={14} strokeWidth={1.5} className="mr-1" />
                {loading ? "Menyimpan..." : "Publikasikan"}
              </Button>
              {draftId && (
                <Button
                  variant="outline"
                  asChild
                  data-testid="admin-preview-draft-btn"
                >
                  <NextLink
                    href={`/preview-article/${draftId}`}
                    target="_blank"
                  >
                    <Eye size={14} strokeWidth={1.5} className="mr-1" />
                    Pratinjau
                  </NextLink>
                </Button>
              )}
            </div>
            <AutosaveIndicator
              status={autosaveStatus}
              lastSavedAt={lastSavedAt}
              className="self-center"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
