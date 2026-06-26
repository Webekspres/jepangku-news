"use client";

import { useEffect, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import { useParams, useRouter } from "next/navigation";
import { useAuth, isAuthUser } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Save, Send, Upload, PenSquare, Globe } from "lucide-react";
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
import ContributorGate from "@/components/ContributorGate";
import RichTextEditor from "@/components/RichTextEditor";
import { useStagedImage } from "@/hooks/useStagedImage";
import { UnsavedChangesGuard } from "@/components/UnsavedChangesGuard";
import {
  canEditOnUserPortal,
  isAdminAuthor,
  submitSuccessMessage,
  userPortalEditSubtitle,
} from "@/lib/article-workflow";

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>()!;
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = isAuthUser(user) && isAdminAuthor(user);
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
  const [fetching, setFetching] = useState(true);

  const cover = useStagedImage({
    value: form.coverImageUrl,
    onValueChange: (url) => setForm((f) => ({ ...f, coverImageUrl: url })),
    purpose: "cover",
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => parseApiResponse(r))
      .then((d) => setCategories(Array.isArray(d) ? d : []));

    fetch("/api/articles/my")
      .then((r) => parseApiResponse(r))
      .then((articles: any[]) => {
        const found = Array.isArray(articles)
          ? articles.find((a) => a.id === id)
          : null;
        if (found) {
          if (!canEditOnUserPortal(found.status)) {
            toast.error("Artikel tidak dapat diedit pada status ini");
            router.replace("/my-articles");
            return;
          }
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

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) cover.selectFile(file);
    e.target.value = "";
  };

  const handleSubmit = async (status: string) => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Judul dan konten wajib diisi");
      return;
    }
    setLoading(true);
    try {
      const coverImageUrl = (await cover.commit()) || null;
      const payload = {
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        coverImageUrl,
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
        const e = await parseApiResponse(res);
        throw new Error(e.error);
      }
      toast.success(submitSuccessMessage(status as "DRAFT" | "PUBLISHED" | "PENDING_REVIEW", isAdmin));
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
    <ContributorGate>
    <UnsavedChangesGuard enabled={cover.dirty && !loading} />
    <div className="bg-white min-h-screen" data-testid="edit-article-page">
      <SectionHeader
        label="UBAH ARTIKEL"
        title="Edit Artikel"
        subtitle={userPortalEditSubtitle(isAdmin)}
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
                placeholder="URL gambar atau unggah..."
                data-testid="article-cover-input"
              />
              <Button
                variant="outline"
                asChild
                disabled={cover.busy}
                className="cursor-pointer hover:bg-foreground hover:text-white shrink-0"
              >
                <label>
                  <Upload size={14} strokeWidth={1.5} />
                  {cover.busy ? "Memproses..." : "Pilih Gambar"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFilePick}
                    disabled={cover.busy}
                    data-testid="article-cover-upload"
                  />
                </label>
              </Button>
            </div>
            <p className="text-xs text-jepang-muted">
              Gambar baru diunggah ke penyimpanan saat artikel disimpan.
            </p>
            {cover.hasImage && (
              <div className="mt-3 space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cover.previewUrl}
                  alt="Preview cover artikel"
                  className="max-h-48 object-cover border border-jepang-border"
                  data-testid="cover-preview"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={cover.busy || loading}
                  onClick={() => void cover.remove()}
                  className="text-jepang-red border-jepang-red hover:bg-jepang-red hover:text-white"
                  data-testid="article-cover-remove"
                >
                  Hapus Gambar
                </Button>
              </div>
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
            {isAdmin ? (
              <Button
                onClick={() => handleSubmit("PUBLISHED")}
                disabled={loading}
                data-testid="publish-article-btn"
              >
                <Globe size={14} strokeWidth={1.5} className="mr-1" />
                {loading ? "Mempublikasikan..." : "Publikasikan"}
              </Button>
            ) : (
              <Button
                onClick={() => handleSubmit("PENDING_REVIEW")}
                disabled={loading}
                data-testid="submit-review-btn"
              >
                <Send size={14} strokeWidth={1.5} className="mr-1" />
                {loading ? "Mengirim..." : "Kirim untuk Review"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
    </ContributorGate>
  );
}
