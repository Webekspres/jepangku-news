"use client";

import { useEffect, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Eye,
  Save,
  Upload,
  Globe,
} from "lucide-react";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
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
import { useStagedImage } from "@/hooks/useStagedImage";
import { UnsavedChangesGuard } from "@/components/UnsavedChangesGuard";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import NextLink from "next/link";
import {
  useAutosave,
  newDraftClientId,
  type ArticleFormSnapshot,
  type StoredDraft,
} from "@/hooks/useAutosave";

const STORAGE_KEY = "jepangku:draft:admin-article-create";
const DRAFT_ENDPOINT = "/api/admin/articles";

// ---------------------------------------------------------------------------
// API helpers — every write is an idempotent upsert keyed by the client id.
// ---------------------------------------------------------------------------

function buildDraftPayload(
  clientId: string,
  data: ArticleFormSnapshot,
  status: string,
) {
  return {
    id: clientId,
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    coverImageUrl: data.coverImageUrl || null,
    categoryId: data.categoryId || null,
    tags: data.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    status,
  };
}

async function flushDraft(
  clientId: string,
  data: ArticleFormSnapshot,
): Promise<void> {
  const res = await fetch(DRAFT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildDraftPayload(clientId, data, "DRAFT")),
  });
  if (!res.ok) {
    const e = await parseApiResponse(res);
    throw new Error(e.error || "Gagal menyimpan draft");
  }
}

function beaconDraft(clientId: string, data: ArticleFormSnapshot): void {
  try {
    const blob = new Blob(
      [JSON.stringify(buildDraftPayload(clientId, data, "DRAFT"))],
      { type: "application/json" },
    );
    navigator.sendBeacon(DRAFT_ENDPOINT, blob);
  } catch {
    /* best effort */
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
  const [clientId, setClientId] = useState(newDraftClientId);
  const [restoreRecord, setRestoreRecord] = useState<StoredDraft | null>(null);

  const cover = useStagedImage({
    value: form.coverImageUrl,
    onValueChange: (url) => setForm((f) => ({ ...f, coverImageUrl: url })),
    purpose: "cover",
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => parseApiResponse(r))
      .then((d) => setCategories(Array.isArray(d) ? d : []));
  }, []);

  const {
    status: autosaveStatus,
    lastSavedAt,
    draftId,
    loadStored,
    restore,
    clearStored,
    markSaved,
  } = useAutosave({
    data: form,
    clientId,
    storageKey: STORAGE_KEY,
    flushDraft,
    beaconFlush: beaconDraft,
    disabled: loading,
  });

  // Offer to recover a locally-saved draft from a previous session.
  useEffect(() => {
    const stored = loadStored();
    if (stored) setRestoreRecord(stored);
  }, [loadStored]);

  const applyRestore = () => {
    if (!restoreRecord) return;
    setForm(restoreRecord.data);
    setClientId(restoreRecord.clientId);
    restore(restoreRecord);
    setRestoreRecord(null);
  };

  const declineRestore = () => {
    clearStored();
    setRestoreRecord(null);
  };

  // -------------------------------------------------------------------------

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

    const parsedTags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const coverImageUrl = (await cover.commit()) || null;

      // Idempotent upsert by client id — never creates a duplicate even if a
      // background flush already persisted this draft.
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: clientId,
          title: form.title,
          excerpt: form.excerpt,
          content: form.content,
          coverImageUrl,
          categoryId: form.categoryId || null,
          tags: parsedTags,
          status,
        }),
      });

      if (!res.ok) {
        const e = await parseApiResponse(res);
        throw new Error(e.error || "Gagal membuat artikel");
      }

      const article = await parseApiResponse(res);

      // Sync autosave state and clear the local backup — it's safely in the DB.
      if (article?.id && article?.slug) {
        markSaved({ id: article.id, slug: article.slug });
      }
      clearStored();

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
    <AdminPageLayout
      testId="admin-article-create-page"
      backHref="/admin/articles"
      backLabel="Kembali ke Artikel"
      title="Buat Artikel"
      subtitle="Konten redaksi dapat langsung dipublikasikan tanpa antrian review."
    >
        <UnsavedChangesGuard enabled={cover.dirty && !loading} />
        <ConfirmModal
          open={!!restoreRecord}
          onOpenChange={(open) => {
            if (!open) declineRestore();
          }}
          title="Pulihkan draf lokal?"
          description="Ada draf yang tersimpan otomatis di perangkat ini dan belum tentu tersimpan ke server. Pulihkan untuk melanjutkan, atau mulai dari awal."
          confirmLabel="Pulihkan Draf"
          cancelLabel="Mulai Baru"
          variant="info"
          onConfirm={applyRestore}
        />
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
                placeholder="URL gambar atau unggah..."
                data-testid="admin-article-cover"
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
                  alt="Preview cover"
                  className="max-h-48 object-cover border border-jepang-border"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={cover.busy}
                  onClick={() => void cover.remove()}
                  className="text-jepang-red border-jepang-red hover:bg-jepang-red hover:text-white"
                  data-testid="admin-article-cover-remove"
                >
                  Hapus Gambar
                </Button>
              </div>
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
                  data-testid="admin-view-draft-btn"
                >
                  <NextLink
                    href={`/admin/articles/${draftId}`}
                    target="_blank"
                  >
                    <Eye size={14} strokeWidth={1.5} className="mr-1" />
                    Lihat
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
    </AdminPageLayout>
  );
}
