"use client";

import { useEffect, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import ArticleEditAside from "@/components/admin/ArticleEditAside";
import { ConfirmModal, useConfirm } from "@/components/ui/confirm-modal";
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
import { uploadMediaFile } from "@/lib/upload-media";

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
  const [rejectNote, setRejectNote] = useState("");
  const [changeNote, setChangeNote] = useState("");
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const { confirm, confirmProps } = useConfirm();

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => parseApiResponse(r))
      .then((d) => setCategories(Array.isArray(d) ? d : []));

    fetch(`/api/admin/articles/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return parseApiResponse(r);
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
      const data = await uploadMediaFile(file, "cover");
      setForm((f) => ({ ...f, coverImageUrl: data.url }));
      toast.success("Gambar berhasil diupload");
    } catch {
      toast.error("Upload gagal");
    } finally {
      setUploading(false);
    }
  };

  const saveArticle = async (targetStatus: string) => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Judul dan konten wajib diisi");
      return;
    }
    if (status !== "DRAFT" && !changeNote.trim()) {
      toast.error("Catatan perubahan wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "PATCH",
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
          changeNote: changeNote.trim(),
        }),
      });
      if (!res.ok) {
        const e = await parseApiResponse(res);
        throw new Error(e.error || "Gagal memperbarui artikel");
      }
      const updated = await parseApiResponse(res);
      setStatus(updated.status || targetStatus);
      setArticleSlug(updated.slug || articleSlug);
      toast.success("Artikel diperbarui");
      setChangeNote("");
      setHistoryRefreshKey((k) => k + 1);
      if (targetStatus !== status) {
        router.push("/admin/articles");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan artikel");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    confirm({
      title: "Setujui artikel?",
      description: "Perubahan konten akan disimpan, lalu artikel dipublikasikan.",
      confirmLabel: "Setujui",
      variant: "info",
      onConfirm: async () => {
        if (!form.title.trim() || !form.content.trim()) {
          toast.error("Judul dan konten wajib diisi");
          return;
        }
        if (!changeNote.trim()) {
          toast.error("Catatan perubahan wajib diisi sebelum menyetujui");
          return;
        }
        setLoading(true);
        try {
          const patchRes = await fetch(`/api/admin/articles/${id}`, {
            method: "PATCH",
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
              changeNote: changeNote.trim(),
            }),
          });
          if (!patchRes.ok) {
            const e = await parseApiResponse(patchRes);
            throw new Error(e.message || "Gagal menyimpan artikel");
          }
          const res = await fetch(`/api/admin/articles/${id}/approve`, {
            method: "POST",
          });
          if (!res.ok) {
            const e = await parseApiResponse(res);
            throw new Error(e.error || "Gagal menyetujui artikel");
          }
          toast.success("Artikel disetujui dan dipublikasikan");
          router.push("/admin/articles");
        } catch (e: unknown) {
          toast.error(e instanceof Error ? e.message : "Gagal menyetujui artikel");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleReject = async () => {
    if (!rejectNote.trim()) {
      toast.error("Catatan penolakan wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/articles/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: rejectNote.trim() }),
      });
      if (!res.ok) {
        const e = await parseApiResponse(res);
        throw new Error(e.error || "Gagal menolak artikel");
      }
      toast.success("Artikel berhasil ditolak");
      setRejectNote("");
      router.push("/admin/articles");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menolak artikel");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <AdminPageLayout
        backHref="/admin/articles"
        backLabel="Kembali ke Artikel"
        title="Edit Artikel"
      >
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-jepang-border animate-pulse" />
          ))}
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      testId="admin-article-edit-page"
      backHref="/admin/articles"
      backLabel="Kembali ke Artikel"
      title="Edit Artikel"
    >
      <ConfirmModal {...confirmProps} />
      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
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
        </div>

        <aside className="space-y-6 xl:sticky xl:top-6">
          <ArticleEditAside
            articleId={id}
            status={status}
            changeNote={changeNote}
            onChangeNoteChange={setChangeNote}
            onSaveChanges={() => saveArticle(status)}
            onApprove={handleApprove}
            onPublish={() => saveArticle("PUBLISHED")}
            onArchive={() => saveArticle("ARCHIVED")}
            onRepublish={() => saveArticle("PUBLISHED")}
            rejectNote={rejectNote}
            onRejectNoteChange={setRejectNote}
            onReject={handleReject}
            loading={loading}
            refreshKey={historyRefreshKey}
          />
        </aside>
      </div>
    </AdminPageLayout>
  );
}
