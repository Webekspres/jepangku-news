"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  PenSquare,
  Save,
  Send,
  Upload,
  Archive,
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

export default function AdminEditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [articleSlug, setArticleSlug] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    coverImageUrl: "",
    categoryId: "",
    tags: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []));

    fetch(`/api/admin/articles/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((article) => {
        setArticleSlug(article.slug || "");
        setStatus(article.status || "DRAFT");
        setForm({
          title: article.title || "",
          excerpt: article.excerpt || "",
          content: article.content || "",
          coverImageUrl: article.coverImageUrl || "",
          categoryId: article.categoryId || "",
          tags: Array.isArray(article.tags)
            ? article.tags.map((t: { name: string }) => t.name).join(", ")
            : "",
        });
        setFetching(false);
      })
      .catch(() => {
        toast.error("Gagal memuat artikel");
        router.push("/admin/articles");
      });
  }, [id, router]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const data = await fetch("/api/upload", { method: "POST", body: fd }).then(
        (r) => {
          if (!r.ok) throw new Error("Upload failed");
          return r.json();
        },
      );
      setForm((f) => ({ ...f, coverImageUrl: data.url }));
      toast.success("Gambar berhasil diupload");
    } catch {
      toast.error("Upload gagal");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (targetStatus: string) => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Judul dan konten wajib diisi");
      return;
    }
    if (!articleSlug) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/articles/${articleSlug}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          excerpt: form.excerpt,
          content: form.content,
          coverImageUrl: form.coverImageUrl || null,
          categoryId: form.categoryId || null,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          status: targetStatus,
          preserveSlug:
            status === "PUBLISHED" && targetStatus === "PUBLISHED",
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Gagal memperbarui artikel");
      }
      toast.success("Artikel diperbarui");
      router.push("/admin/articles");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan artikel");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="bg-white min-h-screen">
        <div className="border-b-2 border-foreground bg-jepang-off-white px-4 py-12">
          <div className="mx-auto max-w-7xl space-y-3">
            <div className="h-3 w-24 bg-jepang-border animate-pulse" />
            <div className="h-10 w-80 bg-jepang-border animate-pulse" />
          </div>
        </div>
        <div className="px-4 mx-auto max-w-7xl py-12 space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-jepang-border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen" data-testid="admin-article-edit-page">
      <section className="border-b-2 border-foreground bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl py-8">
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
            Edit Artikel
          </h1>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-12">
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
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
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
            {status !== "ARCHIVED" && (
              <Button
                variant="outline"
                onClick={() => handleSubmit("ARCHIVED")}
                disabled={loading}
                data-testid="admin-archive"
              >
                <Archive size={14} strokeWidth={1.5} className="mr-1" />
                Arsipkan
              </Button>
            )}
            {status === "ARCHIVED" && (
              <Button
                variant="outline"
                onClick={() => handleSubmit("PUBLISHED")}
                disabled={loading}
                data-testid="admin-republish"
              >
                <Send size={14} strokeWidth={1.5} className="mr-1" />
                Publikasikan Ulang
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
