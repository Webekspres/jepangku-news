"use client";
export const dynamic = "force-dynamic";

import { useCallback, useEffect, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import { useRouter } from "next/navigation";
import { useAuth, isAuthUser } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Eye, Save, Send, Upload, PenSquare, Globe } from "lucide-react";
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
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import ContributorGate from "@/components/ContributorGate";
import RichTextEditor from "@/components/RichTextEditor";
import { AutosaveIndicator } from "@/components/ui/autosave-indicator";
import {
  useAutosave,
  type ArticleDraftInfo,
  type ArticleFormSnapshot,
} from "@/hooks/useAutosave";
import { uploadMediaFile } from "@/lib/upload-media";
import {
  isAdminAuthor,
  submitSuccessMessage,
  userPortalCreateSubtitle,
} from "@/lib/article-workflow";

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

async function apiCreateDraft(data: ArticleFormSnapshot): Promise<ArticleDraftInfo> {
  const res = await fetch("/api/articles/create", {
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
    const e = await parseApiResponse(res);
    throw new Error(e.error || "Gagal membuat draft");
  }
  const article = await parseApiResponse(res);
  return { id: article.id, slug: article.slug };
}

async function apiUpdateDraft(
  id: string,
  data: ArticleFormSnapshot,
): Promise<void> {
  const res = await fetch(`/api/articles/drafts/${id}`, {
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
    const e = await parseApiResponse(res);
    throw new Error(e.error || "Gagal menyimpan draft");
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SubmitArticlePage() {
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = isAuthUser(user) && isAdminAuthor(user);

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

  // Redirect if not logged in
  useEffect(() => {
    if (user === false) router.replace("/sign-in");
  }, [user, router]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => parseApiResponse(r))
      .then((d) => setCategories(Array.isArray(d) ? d : []));
  }, []);

  // Stable callbacks for useAutosave (wrapped in useCallback so the refs
  // inside the hook stay current without the hook re-subscribing).
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
      const data = await uploadMediaFile(file, "cover");
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
        res = await fetch(`/api/articles/drafts/${draftId}`, {
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
        res = await fetch("/api/articles/create", {
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
        const e = await parseApiResponse(res);
        throw new Error(e.error || "Gagal menyimpan artikel");
      }

      const article = await parseApiResponse(res);

      // Sync autosave state so a late-firing timer doesn't create a duplicate
      if (article?.id && article?.slug) {
        setDraftInfo({ id: article.id, slug: article.slug });
      }

      toast.success(submitSuccessMessage(status as "DRAFT" | "PUBLISHED" | "PENDING_REVIEW", isAdmin));
      router.push("/my-articles");
    } catch (e: unknown) {
      toast.error(
        e instanceof Error ? e.message : "Gagal menyimpan artikel",
      );
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Loading skeleton while auth resolves
  // -------------------------------------------------------------------------

  if (user === null) {
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

  if (user === false) return null;

  return (
    <ContributorGate>
    <div className="bg-white min-h-screen" data-testid="submit-article-page">
      <SectionHeader
        label="ARTIKEL BARU"
        title={isAdmin ? "Buat Artikel Baru" : "Kirim Artikel Baru"}
        subtitle={userPortalCreateSubtitle(isAdmin)}
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
            <div className="flex flex-col sm:flex-row gap-3 flex-1 flex-wrap">
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
              {draftId && (
                <Button
                  variant="outline"
                  asChild
                  data-testid="preview-draft-btn"
                >
                  <Link href={`/preview-article/${draftId}`} target="_blank">
                    <Eye size={14} strokeWidth={1.5} className="mr-1" />
                    Pratinjau
                  </Link>
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
    </ContributorGate>
  );
}
