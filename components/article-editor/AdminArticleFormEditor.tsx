"use client";

/**
 * AdminArticleFormEditor — komponen reusable untuk buat & edit artikel (admin).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { parseApiResponse } from "@/lib/fetch-api";
import { toast } from "sonner";
import { Eye, Globe, Save } from "lucide-react";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import ArticleEditAside from "@/components/admin/ArticleEditAside";
import ArticleCoverUploadField from "@/components/article-editor/ArticleCoverUploadField";
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
import { AutosaveIndicator } from "@/components/ui/autosave-indicator";
import { useStagedImage } from "@/hooks/useStagedImage";
import { UnsavedChangesGuard } from "@/components/UnsavedChangesGuard";
import {
  newDraftClientId,
  useAutosave,
  type ArticleDraftInfo,
  type ArticleFormSnapshot,
  type StoredDraft,
} from "@/hooks/useAutosave";
import {
  buildDraftPayload,
  normaliseTags,
} from "@/lib/article-form-helpers";
import {
  defaultScheduleInputValue,
  isoToScheduleInput,
  scheduleInputToIso,
  getScheduleInputError,
} from "@/lib/articles/schedule-input";
import SchedulePublishInput from "@/components/admin/SchedulePublishInput";

export type AdminArticleFormMode = "create" | "edit";

export interface AdminArticleInitialData {
  slug?: string;
  status?: string;
  scheduledPublishAt?: string | null;
  title?: string;
  excerpt?: string;
  content?: string;
  coverImageUrl?: string;
  categoryId?: string;
  tags?: string | { name?: string }[] | string[];
}

export interface AdminArticleFormEditorProps {
  mode: AdminArticleFormMode;
  articleId?: string;
  initialData?: AdminArticleInitialData | null;
  fetching?: boolean;
}

const STORAGE_KEY = "jepangku:draft:admin-article-create";
const DRAFT_ENDPOINT = "/api/admin/articles";

async function flushAdminDraft(
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

function beaconAdminDraft(clientId: string, data: ArticleFormSnapshot): void {
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

function EditorSkeleton() {
  return (
    <AdminPageLayout
      backHref="/admin/articles"
      backLabel="Kembali ke Artikel"
      title="Memuat..."
    >
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 bg-jepang-border animate-pulse" />
        ))}
      </div>
    </AdminPageLayout>
  );
}

type ArticleFormFieldsProps = {
  form: ArticleFormSnapshot;
  setForm: React.Dispatch<React.SetStateAction<ArticleFormSnapshot>>;
  categories: { id: string; name: string }[];
  cover: ReturnType<typeof useStagedImage>;
  onFilePick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  showCoverHint?: boolean;
};

function ArticleFormFields({
  form,
  setForm,
  categories,
  cover,
  onFilePick,
  loading,
  showCoverHint,
}: ArticleFormFieldsProps) {
  return (
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
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="anime, manga, tokyo"
            data-testid="admin-article-tags"
          />
        </div>
      </div>

      <ArticleCoverUploadField
        cover={cover}
        committedUrl={form.coverImageUrl}
        onFilePick={onFilePick}
        loading={loading}
        uploadTestId="admin-article-cover"
        removeTestId="admin-article-cover-remove"
      >
        {showCoverHint && (
          <p className="text-xs text-jepang-muted">
            Gambar cover diunggah ke server saat artikel disimpan atau
            autosave ke server.
          </p>
        )}
      </ArticleCoverUploadField>

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
  );
}

export function AdminArticleFormEditor({
  mode,
  articleId,
  initialData: initialDataProp,
  fetching: fetchingProp = false,
}: AdminArticleFormEditorProps) {
  const router = useRouter();
  const { confirm, confirmProps } = useConfirm();

  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [articleSlug, setArticleSlug] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [form, setForm] = useState<ArticleFormSnapshot>({
    title: "",
    excerpt: "",
    content: "",
    coverImageUrl: "",
    categoryId: "",
    tags: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(mode === "edit");
  const [rejectNote, setRejectNote] = useState("");
  const [changeNote, setChangeNote] = useState("");
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [scheduledPublishAt, setScheduledPublishAt] = useState<string | null>(null);
  const [scheduleInput, setScheduleInput] = useState(defaultScheduleInputValue);

  const [clientId] = useState(newDraftClientId);
  const clientIdRef = useRef(clientId);
  const [restoreRecord, setRestoreRecord] = useState<StoredDraft | null>(null);

  const cover = useStagedImage({
    value: form.coverImageUrl,
    onValueChange: (url) => setForm((f) => ({ ...f, coverImageUrl: url })),
    purpose: "cover",
  });

  const formRef = useRef(form);
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const prepareSnapshot = useCallback(async (): Promise<ArticleFormSnapshot> => {
    const coverImageUrl =
      (await cover.commit()) || formRef.current.coverImageUrl;
    const next = { ...formRef.current, coverImageUrl };
    setForm(next);
    return next;
  }, [cover]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => parseApiResponse(r))
      .then((d: unknown) =>
        setCategories(
          Array.isArray(d) ? (d as { id: string; name: string }[]) : [],
        ),
      );
  }, []);

  const initialised = useRef(false);
  useEffect(() => {
    if (mode !== "edit" || !articleId) return;

    if (initialDataProp && !initialised.current) {
      initialised.current = true;
      setArticleSlug(initialDataProp.slug || "");
      setStatus(initialDataProp.status || "DRAFT");
      setScheduledPublishAt(initialDataProp.scheduledPublishAt ?? null);
      setScheduleInput(isoToScheduleInput(initialDataProp.scheduledPublishAt));
      setForm({
        title: initialDataProp.title || "",
        excerpt: initialDataProp.excerpt || "",
        content: initialDataProp.content || "",
        coverImageUrl: initialDataProp.coverImageUrl || "",
        categoryId: initialDataProp.categoryId || "",
        tags: normaliseTags(initialDataProp.tags),
      });
      cover.reset(initialDataProp.coverImageUrl || "");
      setFetching(false);
      return;
    }

    if (initialDataProp || initialised.current) return;

    fetch(`/api/admin/articles/${articleId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return parseApiResponse(r);
      })
      .then((article: AdminArticleInitialData) => {
        initialised.current = true;
        setArticleSlug(article.slug || "");
        setStatus(article.status || "DRAFT");
        setScheduledPublishAt(article.scheduledPublishAt ?? null);
        setScheduleInput(isoToScheduleInput(article.scheduledPublishAt));
        setForm({
          title: article.title || "",
          excerpt: article.excerpt || "",
          content: article.content || "",
          coverImageUrl: article.coverImageUrl || "",
          categoryId: article.categoryId || "",
          tags: normaliseTags(article.tags),
        });
        cover.reset(article.coverImageUrl || "");
        setFetching(false);
      })
      .catch(() => {
        toast.error("Gagal memuat artikel");
        router.push("/admin/articles");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, articleId, initialDataProp, router]);

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
    flushDraft: flushAdminDraft,
    beaconFlush: beaconAdminDraft,
    prepareSnapshot,
    disabled: mode !== "create" || loading,
  });

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

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const pickError = await cover.selectFile(file);
    if (pickError) toast.error(pickError);
  };

  const saveArticle = async (targetStatus: string, options?: { scheduledAt?: string }) => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Judul dan konten wajib diisi");
      return;
    }
    if (mode === "edit" && status !== "DRAFT" && !changeNote.trim()) {
      toast.error("Catatan perubahan wajib diisi");
      return;
    }
    if (targetStatus === "SCHEDULED") {
      const scheduleError = getScheduleInputError(scheduleInput);
      if (scheduleError) {
        toast.error(scheduleError);
        return;
      }
    }

    setLoading(true);
    try {
      const coverImageUrl = (await cover.commit()) || null;
      const parsedTags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      if (mode === "create") {
        const res = await fetch(DRAFT_ENDPOINT, {
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
            status: targetStatus,
            ...(targetStatus === "SCHEDULED"
              ? { scheduledPublishAt: options?.scheduledAt ?? scheduleInputToIso(scheduleInput) }
              : {}),
          }),
        });
        if (!res.ok) {
          const e = await parseApiResponse(res);
          throw new Error(e.error || "Gagal membuat artikel");
        }
        const article = (await parseApiResponse(res)) as ArticleDraftInfo;
        if (article?.id && article?.slug) {
          markSaved({ id: article.id, slug: article.slug });
        }
        clearStored();
        toast.success(
          targetStatus === "PUBLISHED"
            ? "Artikel dipublikasikan"
            : targetStatus === "SCHEDULED"
              ? "Artikel dijadwalkan tayang"
              : "Draft berhasil disimpan",
        );
        router.push("/admin/articles");
        return;
      }

      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          excerpt: form.excerpt,
          content: form.content,
          coverImageUrl,
          categoryId: form.categoryId || null,
          tags: parsedTags,
          status: targetStatus,
          changeNote: changeNote.trim(),
          ...(targetStatus === "SCHEDULED" || status === "SCHEDULED"
            ? { scheduledPublishAt: options?.scheduledAt ?? scheduleInputToIso(scheduleInput) }
            : {}),
        }),
      });
      if (!res.ok) {
        const e = await parseApiResponse(res);
        throw new Error(e.error || "Gagal memperbarui artikel");
      }
      const updated = await parseApiResponse(res);
      setStatus(updated.status || targetStatus);
      setScheduledPublishAt(updated.scheduledPublishAt ?? null);
      if (updated.scheduledPublishAt) {
        setScheduleInput(isoToScheduleInput(updated.scheduledPublishAt));
      }
      setArticleSlug(updated.slug || articleSlug);
      toast.success("Artikel diperbarui");
      setChangeNote("");
      setHistoryRefreshKey((k) => k + 1);
      if (targetStatus !== status) {
        router.push("/admin/articles");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal menyimpan artikel";
      const isUploadError =
        /upload|gambar|file|ukuran|format|dimensi/i.test(msg);
      toast.error(
        isUploadError ? `Gagal mengunggah gambar cover: ${msg}` : msg,
      );
    } finally {
      setLoading(false);
    }
  };

  const patchArticleContent = async () => {
    const coverImageUrl = (await cover.commit()) || null;
    const patchRes = await fetch(`/api/admin/articles/${articleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        coverImageUrl,
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
      throw new Error(e.message || e.error || "Gagal menyimpan artikel");
    }
  };

  const handleApprove = () => {
    confirm({
      title: "Publikasikan artikel sekarang?",
      description:
        "Perubahan konten akan disimpan, lalu artikel langsung tayang di situs.",
      confirmLabel: "Publikasikan Sekarang",
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
          await patchArticleContent();
          const res = await fetch(`/api/admin/articles/${articleId}/approve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mode: "immediate" }),
          });
          if (!res.ok) {
            const e = await parseApiResponse(res);
            throw new Error(e.error || "Gagal menyetujui artikel");
          }
          toast.success("Artikel dipublikasikan sekarang");
          router.push("/admin/articles");
        } catch (e: unknown) {
          toast.error(
            e instanceof Error ? e.message : "Gagal menyetujui artikel",
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleScheduleApprove = () => {
    const scheduleError = getScheduleInputError(scheduleInput);
    if (scheduleError) {
      toast.error(scheduleError);
      return;
    }
    confirm({
      title: "Jadwalkan artikel?",
      description:
        "Perubahan konten akan disimpan, lalu artikel dijadwalkan tayang pada waktu yang dipilih (WIB).",
      confirmLabel: "Jadwalkan",
      variant: "info",
      onConfirm: async () => {
        if (!form.title.trim() || !form.content.trim()) {
          toast.error("Judul dan konten wajib diisi");
          return;
        }
        if (!changeNote.trim()) {
          toast.error("Catatan perubahan wajib diisi sebelum menjadwalkan");
          return;
        }
        setLoading(true);
        try {
          await patchArticleContent();
          const res = await fetch(`/api/admin/articles/${articleId}/approve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mode: "schedule",
              scheduledPublishAt: scheduleInputToIso(scheduleInput),
            }),
          });
          if (!res.ok) {
            const e = await parseApiResponse(res);
            throw new Error(e.error || "Gagal menjadwalkan artikel");
          }
          toast.success("Artikel disetujui dan dijadwalkan");
          router.push("/admin/articles");
        } catch (e: unknown) {
          toast.error(
            e instanceof Error ? e.message : "Gagal menjadwalkan artikel",
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handlePublishNow = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}/publish-now`, {
        method: "POST",
      });
      if (!res.ok) {
        const e = await parseApiResponse(res);
        throw new Error(e.error || "Gagal mempublikasikan artikel");
      }
      toast.success("Artikel dipublikasikan");
      router.push("/admin/articles");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal mempublikasikan artikel");
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (status !== "SCHEDULED") return;
    if (!changeNote.trim()) {
      toast.error("Catatan perubahan wajib diisi");
      return;
    }
    await saveArticle("SCHEDULED", {
      scheduledAt: scheduleInputToIso(scheduleInput),
    });
  };

  const handleCancelSchedule = () => {
    confirm({
      title: "Batalkan jadwal tayang?",
      description: "Artikel akan kembali ke status draf dan tidak akan tayang otomatis.",
      confirmLabel: "Batalkan Jadwal",
      variant: "danger",
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/admin/articles/${articleId}/cancel-schedule`, {
            method: "POST",
          });
          if (!res.ok) {
            const e = await parseApiResponse(res);
            throw new Error(e.error || "Gagal membatalkan jadwal");
          }
          toast.success("Jadwal tayang dibatalkan");
          router.push("/admin/articles");
        } catch (e: unknown) {
          toast.error(e instanceof Error ? e.message : "Gagal membatalkan jadwal");
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
      const res = await fetch(`/api/admin/articles/${articleId}/reject`, {
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

  if (fetching || fetchingProp) {
    return <EditorSkeleton />;
  }

  const pageTitle = mode === "create" ? "Buat Artikel" : "Edit Artikel";
  const testId =
    mode === "create" ? "admin-article-create-page" : "admin-article-edit-page";

  return (
    <AdminPageLayout
      testId={testId}
      backHref="/admin/articles"
      backLabel="Kembali ke Artikel"
      title={pageTitle}
      subtitle={
        mode === "create"
          ? "Publikasikan langsung atau jadwalkan tayang artikel redaksi (WIB)."
          : undefined
      }
    >
      <ConfirmModal {...confirmProps} />
      <UnsavedChangesGuard enabled={cover.dirty && !loading} />

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

      {mode === "edit" ? (
        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <ArticleFormFields
            form={form}
            setForm={setForm}
            categories={categories}
            cover={cover}
            onFilePick={handleFilePick}
            loading={loading}
          />
          <aside className="space-y-6 xl:sticky xl:top-6">
            <ArticleEditAside
              articleId={articleId!}
              status={status}
              changeNote={changeNote}
              onChangeNoteChange={setChangeNote}
              onSaveChanges={() => saveArticle(status)}
              onApprove={handleApprove}
              onScheduleApprove={handleScheduleApprove}
              scheduleInput={scheduleInput}
              onScheduleInputChange={setScheduleInput}
              scheduledPublishAt={scheduledPublishAt}
              onPublish={() => saveArticle("PUBLISHED")}
              onPublishNow={handlePublishNow}
              onReschedule={handleReschedule}
              onCancelSchedule={handleCancelSchedule}
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
      ) : (
        <div className="space-y-6">
          <ArticleFormFields
            form={form}
            setForm={setForm}
            categories={categories}
            cover={cover}
            onFilePick={handleFilePick}
            loading={loading}
            showCoverHint
          />

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-6 border-t border-jepang-border">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 flex-wrap">
              <Button
                variant="outline"
                onClick={() => saveArticle("DRAFT")}
                disabled={loading}
                data-testid="admin-save-draft"
              >
                <Save size={14} strokeWidth={1.5} className="mr-1" />
                {loading ? "Menyimpan..." : "Simpan Draft"}
              </Button>
              <Button
                onClick={() => saveArticle("PUBLISHED")}
                disabled={loading}
                data-testid="admin-publish"
              >
                <Globe size={14} strokeWidth={1.5} className="mr-1" />
                {loading ? "Menyimpan..." : "Publikasikan Sekarang"}
              </Button>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <SchedulePublishInput
                  value={scheduleInput}
                  onChange={setScheduleInput}
                  disabled={loading}
                  testId="admin-create-schedule-input"
                />
                <Button
                  variant="outline"
                  onClick={() => saveArticle("SCHEDULED")}
                  disabled={loading || !!getScheduleInputError(scheduleInput)}
                  data-testid="admin-schedule-create"
                >
                  {loading ? "Menyimpan..." : "Jadwalkan Tayang"}
                </Button>
              </div>
              {draftId && (
                <Button
                  variant="outline"
                  asChild
                  data-testid="admin-view-draft-btn"
                >
                  <Link href={`/admin/articles/${draftId}`} target="_blank">
                    <Eye size={14} strokeWidth={1.5} className="mr-1" />
                    Lihat
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
      )}
    </AdminPageLayout>
  );
}
