"use client";
export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Save,
  Send,
  Upload,
  Bold,
  Italic,
  List as ListIcon,
  PenSquare,
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
import SectionHeader from "@/components/SectionHeader";

export default function SubmitArticlePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
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
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Redirect jika belum login
  useEffect(() => {
    if (user === false) {
      router.replace("/login");
    }
  }, [user, router]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []));
  }, []);

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

  const insertFormatting = (tag: string) => {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart,
      end = ta.selectionEnd;
    const sel = form.content.substring(start, end);
    const map: Record<string, string> = {
      bold: `<strong>${sel || "bold text"}</strong>`,
      italic: `<em>${sel || "italic text"}</em>`,
      h2: `<h2>${sel || "Heading"}</h2>`,
      h3: `<h3>${sel || "Subheading"}</h3>`,
      ul: `<ul><li>${sel || "List item"}</li></ul>`,
      p: `<p>${sel || "Paragraph"}</p>`,
    };
    const inserted = map[tag] || sel;
    const newContent =
      form.content.substring(0, start) +
      inserted +
      form.content.substring(end);
    setForm((f) => ({ ...f, content: newContent }));
    // Restore focus & cursor after state update
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + inserted.length;
      ta.setSelectionRange(pos, pos);
    });
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
      const res = await fetch("/api/articles/create", {
        method: "POST",
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

  // Skeleton saat user masih loading
  if (user === null) {
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

  if (user === false) return null;

  return (
    <div className="bg-white min-h-screen" data-testid="submit-article-page">
      <SectionHeader
        label="NEW ARTICLE"
        title="Submit Artikel Baru"
        subtitle="Bagikan cerita atau berita Jepang. Artikel akan direview admin sebelum tayang."
        icon={<PenSquare size={36} strokeWidth={1.5} />}
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
                  {uploading ? "Mengupload..." : "Upload"}
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
            {/* Formatting toolbar */}
            <div className="border border-jepang-border bg-jepang-off-white p-2 flex flex-wrap gap-1">
              {(
                [
                  ["h2", "H2"],
                  ["h3", "H3"],
                  ["bold", <Bold key="b" size={14} strokeWidth={2} />],
                  ["italic", <Italic key="i" size={14} strokeWidth={2} />],
                  ["p", "P"],
                  ["ul", <ListIcon key="l" size={14} strokeWidth={2} />],
                ] as [string, React.ReactNode][]
              ).map(([tag, label]) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => insertFormatting(tag)}
                  className="px-3 py-1 hover:bg-white border border-transparent hover:border-jepang-border text-sm font-bold transition-colors"
                  data-testid={`format-${tag}`}
                  title={tag}
                >
                  {label}
                </button>
              ))}
            </div>
            <Textarea
              ref={contentRef}
              className="font-mono text-sm border-t-0 rounded-t-none"
              rows={16}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="<p>Tulis artikel menggunakan tag HTML...</p>"
              data-testid="article-content-input"
            />
            <p className="text-xs text-jepang-muted font-mono">
              Gunakan tag HTML: &lt;p&gt;, &lt;h2&gt;, &lt;h3&gt;,
              &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;&lt;li&gt;
            </p>
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
