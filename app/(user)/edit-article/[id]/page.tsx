"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Send, Upload, PenSquare } from "lucide-react";
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
import SectionHeader from "@/components/SectionHeader";
import RichTextEditor from "@/components/RichTextEditor";

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>()!;
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [article, setArticle] = useState<any>(null);
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

    fetch("/api/articles/my")
      .then((r) => r.json())
      .then((articles: any[]) => {
        const found = Array.isArray(articles)
          ? articles.find((a) => a.id === id)
          : null;
        if (found) {
          setArticle(found);
          setForm({
            title: found.title || "",
            excerpt: found.excerpt || "",
            content: found.content || "",
            coverImageUrl: found.coverImageUrl || "",
            categoryId: found.categoryId || "",
            tags: Array.isArray(found.tags)
              ? found.tags.map((t: any) => t.name ?? t).join(", ")
              : found.tags || "",
          });
        } else {
          router.push("/my-articles");
        }
        setFetching(false);
      });
  }, [id, router]);

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
    try {
      const payload = {
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        coverImageUrl: form.coverImageUrl || null,
        categoryId: form.categoryId || null,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        status,
      };
      const res = await fetch(`/api/articles/${article.slug}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error);
      }
      toast.success(
        status === "DRAFT"
          ? "Draft berhasil disimpan"
          : "Artikel berhasil dikirim untuk direview",
      );
      router.push("/my-articles");
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan artikel");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="bg-white min-h-screen">
        <div className="border-b border-jepang-border bg-jepang-off-white px-4 py-12">
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
    <div className="bg-white min-h-screen" data-testid="edit-article-page">
      <SectionHeader
        label="UBAH ARTIKEL"
        title="Edit Artikel"
        subtitle="Artikel akan direview ulang oleh admin setelah disubmit."
        icon={<PenSquare size={16} strokeWidth={1.5} />}
      />

      <div className="px-4 mx-auto max-w-7xl py-12">
        <div className="space-y-6">
          {/* Title */}
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
              data-testid="article-title-input"
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Ringkasan</Label>
            <Textarea
              id="excerpt"
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Deskripsi singkat artikel..."
              data-testid="article-excerpt-input"
            />
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm({ ...form, categoryId: v })}
              >
                <SelectTrigger data-testid="article-category-select">
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
                data-testid="article-tags-input"
              />
            </div>
          </div>

          {/* Cover Image */}
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
                data-testid="article-cover-input"
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
                    data-testid="article-cover-upload"
                  />
                </label>
              </Button>
            </div>
            {form.coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.coverImageUrl}
                alt="Preview cover artikel"
                className="mt-3 max-h-48 object-cover border border-jepang-border"
                data-testid="cover-preview"
              />
            )}
          </div>

          {/* Content */}
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

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-jepang-border">
            <Button
              variant="outline"
              onClick={() => handleSubmit("DRAFT")}
              disabled={loading}
              className="hover:bg-foreground hover:text-white"
              data-testid="save-draft-btn"
            >
              <Save size={14} strokeWidth={1.5} className="mr-1" />
              {loading ? "Menyimpan..." : "Simpan Draft"}
            </Button>
            <Button
              onClick={() => handleSubmit("PENDING_REVIEW")}
              disabled={loading}
              data-testid="submit-review-btn"
            >
              <Send size={14} strokeWidth={1.5} className="mr-1" />
              {loading ? "Mengirim..." : "Kirim untuk Review"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
