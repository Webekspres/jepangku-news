"use client";

/**
 * ArticleFormEditor — komponen reusable untuk submit & edit artikel.
 *
 * Mode "create" (submit-article):
 *   - useAutosave aktif (localStorage → DB flush saat unmount/pagehide)
 *   - ConfirmModal restore draft lokal
 *   - AutosaveIndicator di action bar
 *   - Tombol Pratinjau setelah draftId tersedia
 *
 * Mode "edit":
 *   - Tidak ada autosave (artikel sudah ada di DB)
 *   - UnsavedChangesGuard tetap aktif via cover.dirty
 *   - Fetch data artikel via onLoadArticle prop
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, isAuthUser } from "@/contexts/AuthContext";
import { parseApiResponse } from "@/lib/fetch-api";
import { toast } from "sonner";
import { Eye, Globe, PenSquare, Save, Send, Upload } from "lucide-react";
import Link from "next/link";
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
import { AutosaveIndicator } from "@/components/ui/autosave-indicator";
import { UnsavedChangesGuard } from "@/components/UnsavedChangesGuard";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  newDraftClientId,
  useAutosave,
  type ArticleDraftInfo,
  type ArticleFormSnapshot,
  type StoredDraft,
} from "@/hooks/useAutosave";
import { useStagedImage } from "@/hooks/useStagedImage";
import {
  isAdminAuthor,
  submitSuccessMessage,
  userPortalCreateSubtitle,
  userPortalEditSubtitle,
} from "@/lib/article-workflow";
import {
  buildDraftPayload,
  normaliseTags,
} from "@/lib/article-form-helpers";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ArticleFormMode = "create" | "edit";

export interface ArticleInitialData {
  /** Slug artikel — dibutuhkan saat mode edit untuk endpoint PUT. */
  slug: string;
  title?: string;
  excerpt?: string;
  content?: string;
  coverImageUrl?: string;
  categoryId?: string;
  /** Tags bisa berupa string koma-separated atau array objek/string. */
  tags?: string | { name?: string; [k: string]: unknown }[] | string[];
}

export interface ArticleFormEditorProps {
  mode: ArticleFormMode;
  /** Data awal untuk mode "edit". Tidak relevan untuk mode "create". */
  initialData?: ArticleInitialData | null;
  /**
   * Callback ketika halaman sedang loading data awal (mode "edit").
   * Jika `true`, komponen menampilkan skeleton loading.
   */
  fetching?: boolean;
}

// ---------------------------------------------------------------------------
// Konstanta autosave (hanya mode "create")
// ---------------------------------------------------------------------------

const STORAGE_KEY = "jepangku:draft:user-submit-article";
const DRAFT_ENDPOINT = "/api/articles/create";

async function flushDraftToDb(
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

function beaconDraftToDb(clientId: string, data: ArticleFormSnapshot): void {
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
// Loading skeleton (dipakai di kedua mode)
// ---------------------------------------------------------------------------

function EditorSkeleton() {
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

// ---------------------------------------------------------------------------
// Komponen utama
// ---------------------------------------------------------------------------

export function ArticleFormEditor({
  mode,
  initialData,
  fetching = false,
}: ArticleFormEditorProps) {
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = isAuthUser(user) && isAdminAuthor(user);

  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [form, setForm] = useState<ArticleFormSnapshot>({
    title: "",
    excerpt: "",
    content: "",
    coverImageUrl: "",
    categoryId: "",
    tags: "",
  });
  const [loading, setLoading] = useState(false);

  // Mode "create" — autosave state
  const [clientId] = useState<string>(newDraftClientId);
  const [restoreRecord, setRestoreRecord] = useState<StoredDraft | null>(null);

  // Ref untuk menyimpan clientId stabil lintas-render (mode create)
  const clientIdRef = useRef(clientId);
  const formRef = useRef(form);
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  // Inisialisasi form dari initialData (mode "edit")
  const initialised = useRef(false);
  useEffect(() => {
    if (mode === "edit" && initialData && !initialised.current) {
      initialised.current = true;
      setForm({
        title: initialData.title ?? "",
        excerpt: initialData.excerpt ?? "",
        content: initialData.content ?? "",
        coverImageUrl: initialData.coverImageUrl ?? "",
        categoryId: initialData.categoryId ?? "",
        tags: normaliseTags(initialData.tags),
      });
    }
  }, [mode, initialData]);

  // Fetch categories
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => parseApiResponse(r))
      .then((d: unknown) =>
        setCategories(Array.isArray(d) ? (d as { id: string; name: string }[]) : []),
      );
  }, []);

  // Redirect guest (mode create)
  useEffect(() => {
    if (mode === "create" && user === false) router.replace("/sign-in");
  }, [mode, user, router]);

  // Cover image
  const cover = useStagedImage({
    value: form.coverImageUrl,
    onValueChange: (url) => setForm((f) => ({ ...f, coverImageUrl: url })),
    purpose: "cover",
  });

  // Reset cover saat data artikel dimuat (mode edit)
  const coverResetDone = useRef(false);
  useEffect(() => {
    if (
      mode === "edit" &&
      initialData?.coverImageUrl !== undefined &&
      !coverResetDone.current
    ) {
      coverResetDone.current = true;
      cover.reset(initialData.coverImageUrl ?? "");
    }
  }, [mode, initialData?.coverImageUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const prepareSnapshot = useCallback(async (): Promise<ArticleFormSnapshot> => {
    const coverImageUrl =
      (await cover.commit()) || formRef.current.coverImageUrl;
    const next = { ...formRef.current, coverImageUrl };
    setForm(next);
    return next;
  }, [cover]);

  // ---------------------------------------------------------------------------
  // Autosave — hanya mode "create"
  // ---------------------------------------------------------------------------

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
    clientId: clientIdRef.current,
    storageKey: STORAGE_KEY,
    flushDraft: flushDraftToDb,
    beaconFlush: beaconDraftToDb,
    prepareSnapshot,
    disabled: mode !== "create" || loading,
  });

  // Tawarkan restore draft lokal (mode create)
  useEffect(() => {
    if (mode !== "create") return;
    const stored = loadStored();
    if (stored) setRestoreRecord(stored);
  }, [mode, loadStored]);

  const applyRestore = () => {
    if (!restoreRecord) return;
    setForm(restoreRecord.data);
    clientIdRef.current = restoreRecord.clientId;
    restore(restoreRecord);
    setRestoreRecord(null);
  };

  const declineRestore = () => {
    clearStored();
    setRestoreRecord(null);
  };

  // ---------------------------------------------------------------------------
  // File pick handler
  // ---------------------------------------------------------------------------

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) cover.selectFile(file);
    e.target.value = "";
  };

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

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

      if (mode === "create") {
        // Idempotent upsert — clientId = stable UUID, tidak akan duplikat.
        const res = await fetch("/api/articles/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: clientIdRef.current,
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
          throw new Error(e.error || "Gagal menyimpan artikel");
        }

        const article = (await parseApiResponse(res)) as ArticleDraftInfo & {
          slug?: string;
        };
        if (article?.id && article?.slug) {
          markSaved({ id: article.id, slug: article.slug });
        }
        clearStored();
      } else {
        // Mode edit — PUT ke slug artikel yang sudah ada.
        if (!initialData?.slug) throw new Error("Slug artikel tidak tersedia");

        const res = await fetch(`/api/articles/${initialData.slug}/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
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
          throw new Error(e.error || "Gagal menyimpan artikel");
        }
      }

      toast.success(
        submitSuccessMessage(
          status as "DRAFT" | "PUBLISHED" | "PENDING_REVIEW",
          isAdmin,
        ),
      );
      router.push("/my-articles");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan artikel");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Derived state untuk header
  // ---------------------------------------------------------------------------

  const headerLabel = mode === "create" ? "ARTIKEL BARU" : "UBAH ARTIKEL";
  const headerTitle =
    mode === "create"
      ? isAdmin
        ? "Buat Artikel Baru"
        : "Kirim Artikel Baru"
      : "Edit Artikel";
  const headerSubtitle =
    mode === "create"
      ? userPortalCreateSubtitle(isAdmin)
      : userPortalEditSubtitle(isAdmin);
  const testId =
    mode === "create" ? "submit-article-page" : "edit-article-page";

  // ---------------------------------------------------------------------------
  // Loading states
  // ---------------------------------------------------------------------------

  if (mode === "create" && user === null) return <EditorSkeleton />;
  if (mode === "create" && user === false) return null;
  if (mode === "edit" && fetching) return <EditorSkeleton />;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <ContributorGate>
      <UnsavedChangesGuard enabled={cover.dirty && !loading} />

      {/* Restore draft lokal — hanya mode create */}
      {mode === "create" && (
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
      )}

      <div
        className="bg-white min-h-screen"
        data-testid={testId}
      >
        <SectionHeader
          label={headerLabel}
          title={headerTitle}
          subtitle={headerSubtitle}
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
                    {categories.map((cat) => (
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
                {/* Pratinjau — hanya mode create, setelah draftId tersedia */}
                {mode === "create" && draftId && (
                  <Button
                    variant="outline"
                    asChild
                    data-testid="preview-draft-btn"
                  >
                    <Link
                      href={`/preview-article/${draftId}`}
                      target="_blank"
                    >
                      <Eye size={14} strokeWidth={1.5} className="mr-1" />
                      Pratinjau
                    </Link>
                  </Button>
                )}
              </div>

              {/* AutosaveIndicator — hanya mode create */}
              {mode === "create" && (
                <AutosaveIndicator
                  status={autosaveStatus}
                  lastSavedAt={lastSavedAt}
                  className="self-center"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </ContributorGate>
  );
}
