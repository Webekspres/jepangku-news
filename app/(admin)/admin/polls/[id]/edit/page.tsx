"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import { safeImageSrc } from "@/lib/safe-url";
import { useRouter, useParams } from "next/navigation";
import {
  commitStagedUrl,
  deleteMediaFile,
  stageFile,
} from "@/lib/upload-media";
import { toast } from "sonner";
import { Plus, Trash2, Upload, X, ImageIcon } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────── */
interface PollOption {
  id?: string;
  optionText: string;
  imageUrl: string;
}

interface PollQuestion {
  id?: string;
  questionText: string;
  imageUrl: string;
  options: PollOption[];
}

/* ─── Image upload hook ──────────────────────────────── */
// Files are staged locally (no upload) until the poll is saved, so swapping
// images repeatedly never leaves orphans in the R2 bucket.
function useImageUpload() {
  const [uploading] = useState<Record<string, boolean>>({});
  const upload = useCallback(
    async (file: File, _key: string, onSuccess: (url: string) => void) => {
      onSuccess(stageFile(file, "content"));
    },
    [],
  );
  return { upload, uploading };
}

/* ─── ImageField ─────────────────────────────────────── */
interface ImageFieldProps {
  value: string;
  uploadKey: string;
  uploading: Record<string, boolean>;
  onUrlChange: (url: string) => void;
  onUpload: (file: File, key: string, cb: (url: string) => void) => void;
  placeholder?: string;
  testId?: string;
}

function ImageField({
  value, uploadKey, uploading, onUrlChange, onUpload,
  placeholder = "URL gambar (opsional)", testId,
}: ImageFieldProps) {
  const isUploading = uploading[uploadKey];
  return (
    <div className="space-y-1.5">
      <div className="flex gap-2 items-start">
        <Input type="text" className="flex-1 text-sm" value={value}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder={placeholder} data-testid={testId} />
        <Button type="button" variant="outline" asChild disabled={isUploading} size="sm"
          className="cursor-pointer hover:bg-foreground hover:text-white shrink-0">
          <label>
            <Upload size={13} strokeWidth={1.5} />
            <input type="file" accept="image/*" className="hidden" disabled={isUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file, uploadKey, onUrlChange);
                e.target.value = "";
              }} />
          </label>
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="icon"
            onClick={() => onUrlChange("")} className="text-jepang-red shrink-0">
            <X size={13} />
          </Button>
        )}
      </div>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={safeImageSrc(value)} alt="Preview"
          className="mt-1 max-h-24 object-cover border border-jepang-border" />
      )}
    </div>
  );
}

/* ─── Defaults ───────────────────────────────────────── */
const DEFAULT_OPTION = (): PollOption => ({ optionText: "", imageUrl: "" });
const DEFAULT_QUESTION = (): PollQuestion => ({
  questionText: "", imageUrl: "",
  options: [DEFAULT_OPTION(), DEFAULT_OPTION()],
});

/* ─── Page ───────────────────────────────────────────── */
export default function AdminEditPollPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { upload, uploading } = useImageUpload();

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  // Image URLs that exist in R2 at load time; any dropped on save is deleted.
  const originalImageUrls = useRef<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    poll_type: "POLLING",
    thumbnail_url: "",
    status: "DRAFT",
    points_reward: 5,
    allow_guest_vote: false,
    show_result_before_vote: false,
  });

  const [questions, setQuestions] = useState<PollQuestion[]>([DEFAULT_QUESTION()]);

  /* ── Load existing data ── */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/polls/${id}`);
        if (!res.ok) throw new Error("Polling tidak ditemukan");
        const data = await parseApiResponse(res);

        setForm({
          title: data.title,
          description: data.description || "",
          poll_type: data.pollType,
          thumbnail_url: data.thumbnailUrl || "",
          status: data.status,
          points_reward: data.pointsReward,
          allow_guest_vote: data.allowGuestVote,
          show_result_before_vote: data.showResultBeforeVote,
        });

        if (Array.isArray(data.questions) && data.questions.length > 0) {
          setQuestions(
            data.questions.map((q: any) => ({
              id: q.id,
              questionText: q.questionText,
              imageUrl: q.imageUrl || "",
              options: (q.options || []).map((o: any) => ({
                id: o.id,
                optionText: o.optionText,
                imageUrl: o.imageUrl || "",
              })),
            })),
          );
        }

        const urls: string[] = [];
        if (data.thumbnailUrl) urls.push(data.thumbnailUrl);
        for (const q of data.questions ?? []) {
          if (q.imageUrl) urls.push(q.imageUrl);
          for (const o of q.options ?? []) {
            if (o.imageUrl) urls.push(o.imageUrl);
          }
        }
        originalImageUrls.current = urls;
      } catch (e: any) {
        toast.error(e.message || "Gagal memuat data polling");
        router.push("/admin/polls");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, router]);

  /* ── Question helpers ── */
  const addQuestion = () => setQuestions((q) => [...q, DEFAULT_QUESTION()]);
  const removeQuestion = (qi: number) =>
    setQuestions((q) => q.filter((_, i) => i !== qi));
  const updateQuestion = (qi: number, field: keyof PollQuestion, val: string) =>
    setQuestions((q) => {
      const next = [...q];
      (next[qi] as any)[field] = val;
      return next;
    });

  /* ── Option helpers ── */
  const addOption = (qi: number) =>
    setQuestions((q) => {
      const next = [...q];
      next[qi] = { ...next[qi], options: [...next[qi].options, DEFAULT_OPTION()] };
      return next;
    });
  const removeOption = (qi: number, oi: number) =>
    setQuestions((q) => {
      const next = [...q];
      next[qi] = { ...next[qi], options: next[qi].options.filter((_, i) => i !== oi) };
      return next;
    });
  const updateOption = (qi: number, oi: number, field: keyof PollOption, val: string) =>
    setQuestions((q) => {
      const next = [...q];
      const opts = [...next[qi].options];
      opts[oi] = { ...opts[oi], [field]: val };
      next[qi] = { ...next[qi], options: opts };
      return next;
    });

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error("Judul wajib diisi"); return; }
    for (let qi = 0; qi < questions.length; qi++) {
      const q = questions[qi];
      if (!q.questionText.trim()) { toast.error(`Pertanyaan ${qi + 1} belum diisi`); return; }
      if (q.options.length < 2) { toast.error(`Pertanyaan ${qi + 1} butuh minimal 2 opsi`); return; }
      if (q.options.some((o) => !o.optionText.trim())) {
        toast.error(`Semua opsi di pertanyaan ${qi + 1} wajib punya teks`); return;
      }
    }

    setLoading(true);
    try {
      const thumbnailUrl = (await commitStagedUrl(form.thumbnail_url)) || null;
      const committedQuestions = await Promise.all(
        questions.map(async (q, qi) => ({
          id: q.id,
          questionText: q.questionText,
          imageUrl: (await commitStagedUrl(q.imageUrl)) || null,
          sortOrder: qi,
          options: await Promise.all(
            q.options.map(async (o, oi) => ({
              id: o.id,
              optionText: o.optionText,
              imageUrl: (await commitStagedUrl(o.imageUrl)) || null,
              sortOrder: oi,
            })),
          ),
        })),
      );

      const res = await fetch(`/api/admin/polls/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          pollType: form.poll_type,
          thumbnailUrl,
          status: form.status,
          pointsReward: form.points_reward,
          allowGuestVote: form.allow_guest_vote,
          showResultBeforeVote: form.show_result_before_vote,
          questions: committedQuestions,
        }),
      });

      if (!res.ok) {
        const e = await parseApiResponse(res);
        throw new Error(e.error);
      }

      const finalUrls = new Set<string>();
      if (thumbnailUrl) finalUrls.add(thumbnailUrl);
      for (const q of committedQuestions) {
        if (q.imageUrl) finalUrls.add(q.imageUrl);
        for (const o of q.options) if (o.imageUrl) finalUrls.add(o.imageUrl);
      }
      for (const url of originalImageUrls.current) {
        if (!finalUrls.has(url)) deleteMediaFile(url).catch(() => {});
      }
      originalImageUrls.current = Array.from(finalUrls);

      toast.success("Polling berhasil diperbarui");
      router.push("/admin/polls");
    } catch (e: any) {
      toast.error(e.message || "Gagal memperbarui polling");
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading state ── */
  if (fetching) {
    return (
      <AdminPageLayout
        backHref="/admin/polls"
        backLabel="Kembali ke Daftar Polling"
        title="Edit Polling"
      >
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <SkeletonBox key={i} height="3rem" width="100%" />
          ))}
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      testId="admin-edit-poll-page"
      backHref="/admin/polls"
      backLabel="Kembali ke Daftar Polling"
      title="Edit Polling"
      subtitle="Perbarui informasi dan opsi polling/voting."
    >
      <div className="space-y-8">
        {/* ── Info dasar ── */}
        <section className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-red">
            INFO POLLING
          </p>

          {/* Tipe */}
          <div className="space-y-2">
            <Label>Tipe</Label>
            <div className="flex gap-2">
              <Button type="button" size="sm"
                variant={form.poll_type === "POLLING" ? "black" : "outline"}
                onClick={() => setForm({ ...form, poll_type: "POLLING" })}
                data-testid="type-polling">
                Polling
              </Button>
              <Button type="button" size="sm"
                variant={form.poll_type === "VOTING" ? "default" : "outline"}
                onClick={() => setForm({ ...form, poll_type: "VOTING" })}
                data-testid="type-voting">
                Voting
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Judul <span className="text-jepang-red">*</span></Label>
            <Input id="title" type="text" className="font-heading font-bold text-xl"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Judul polling..." data-testid="poll-title-input" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" rows={3} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Konteks atau penjelasan singkat..." data-testid="poll-description-input" />
          </div>

          <div className="space-y-2">
            <Label>Thumbnail</Label>
            <ImageField value={form.thumbnail_url} uploadKey="thumbnail" uploading={uploading}
              onUrlChange={(url) => setForm((f) => ({ ...f, thumbnail_url: url }))}
              onUpload={upload} placeholder="URL thumbnail atau upload..."
              testId="poll-thumbnail-input" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger data-testid="poll-status-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="DRAFT">Draf</SelectItem>
                  <SelectItem value="CLOSED">Ditutup</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="points-reward">Hadiah Poin</Label>
              <Input id="points-reward" type="number" min={0} value={form.points_reward}
                onChange={(e) => setForm({ ...form, points_reward: Number(e.target.value) })}
                data-testid="poll-points-input" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex items-center gap-3">
              <Switch id="guest-vote" checked={form.allow_guest_vote}
                onCheckedChange={(v: boolean) => setForm({ ...form, allow_guest_vote: v })}
                data-testid="poll-guest-vote-switch" />
              <Label htmlFor="guest-vote" className="cursor-pointer">Izinkan vote tanpa login</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="show-result" checked={form.show_result_before_vote}
                onCheckedChange={(v: boolean) => setForm({ ...form, show_result_before_vote: v })}
                data-testid="poll-show-result-switch" />
              <Label htmlFor="show-result" className="cursor-pointer">
                Tampilkan hasil sebelum vote
              </Label>
            </div>
          </div>
        </section>

        {/* ── Pertanyaan ── */}
        <section className="pt-6 border-t border-jepang-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                PERTANYAAN ({questions.length})
              </p>
              <p className="text-xs text-jepang-muted mt-0.5">
                Setiap pertanyaan memiliki opsi jawaban masing-masing.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addQuestion}
              className="hover:bg-foreground hover:text-white" data-testid="add-question-btn">
              <Plus size={13} /> Tambah Pertanyaan
            </Button>
          </div>

          {questions.map((q, qi) => (
            <Card key={qi} className="border border-jepang-border bg-jepang-off-white"
              data-testid={`question-card-${qi}`}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-red">
                    PERTANYAAN {qi + 1}
                  </p>
                  {questions.length > 1 && (
                    <Button type="button" variant="ghost" size="icon"
                      onClick={() => removeQuestion(qi)}
                      className="text-jepang-red hover:text-jepang-red"
                      data-testid={`remove-question-${qi}`}>
                      <Trash2 size={13} />
                    </Button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">
                    Teks Pertanyaan <span className="text-jepang-red">*</span>
                  </Label>
                  <Textarea rows={2} placeholder="Tulis pertanyaan..."
                    value={q.questionText}
                    onChange={(e) => updateQuestion(qi, "questionText", e.target.value)}
                    data-testid={`question-text-${qi}`} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Gambar Pertanyaan (opsional)</Label>
                  <ImageField value={q.imageUrl} uploadKey={`question-${qi}`} uploading={uploading}
                    onUrlChange={(url) => updateQuestion(qi, "imageUrl", url)}
                    onUpload={upload} testId={`question-image-${qi}`} />
                </div>

                <div className="space-y-3">
                  <Label className="text-xs">OPSI JAWABAN ({q.options.length})</Label>

                  {q.options.map((o, oi) => (
                    <div key={oi}
                      className={cn(
                        "border border-jepang-border bg-white p-3 space-y-2",
                        o.imageUrl && "border-foreground",
                      )}
                      data-testid={`option-card-${qi}-${oi}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-jepang-red text-sm">
                            {String.fromCharCode(65 + oi)}
                          </span>
                          {o.imageUrl && (
                            <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-jepang-muted border border-jepang-border px-1.5 py-0.5">
                              <ImageIcon size={9} /> GAMBAR
                            </span>
                          )}
                        </div>
                        {q.options.length > 2 && (
                          <Button type="button" variant="ghost" size="icon"
                            onClick={() => removeOption(qi, oi)}
                            className="text-jepang-red hover:text-jepang-red"
                            data-testid={`remove-option-${qi}-${oi}`}>
                            <Trash2 size={12} />
                          </Button>
                        )}
                      </div>

                      <Input type="text"
                        placeholder={`Opsi ${String.fromCharCode(65 + oi)}`}
                        value={o.optionText}
                        onChange={(e) => updateOption(qi, oi, "optionText", e.target.value)}
                        data-testid={`option-text-${qi}-${oi}`} />

                      <ImageField value={o.imageUrl} uploadKey={`option-${qi}-${oi}`}
                        uploading={uploading}
                        onUrlChange={(url) => updateOption(qi, oi, "imageUrl", url)}
                        onUpload={upload} testId={`option-image-${qi}-${oi}`} />
                    </div>
                  ))}

                  {q.options.length < 10 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => addOption(qi)}
                      className="text-jepang-red hover:text-jepang-red hover:bg-red-50"
                      data-testid={`add-option-${qi}`}>
                      <Plus size={12} className="mr-1" /> Tambah Opsi
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* ── Submit ── */}
        <div className="pt-6 border-t border-jepang-border flex gap-3">
          <Button type="button" onClick={handleSubmit} disabled={loading}
            data-testid="edit-poll-submit">
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/admin/polls")}
            disabled={loading} className="hover:bg-foreground hover:text-white">
            Batal
          </Button>
        </div>
      </div>
    </AdminPageLayout>
  );
}
