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
import { Plus, Trash2, Upload, X } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────── */
interface QuizOption {
  id?: string;
  option_text: string;
  image_url: string;
  is_correct: boolean;
}

interface QuizQuestion {
  id?: string;
  question_text: string;
  image_url: string;
  options: QuizOption[];
}

interface QuizForm {
  title: string;
  description: string;
  thumbnail_url: string;
  quiz_type: string;
  status: string;
  points_reward: number;
  correct_answer_points: number;
  allow_retry: boolean;
  show_result_immediately: boolean;
}

/* ─── Image upload helper ────────────────────────────── */
// Files are staged locally (no upload) until the quiz is saved, so swapping
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

/* ─── ImageUploadField ───────────────────────────────── */
interface ImageUploadFieldProps {
  label: string;
  value: string;
  uploadKey: string;
  uploading: Record<string, boolean>;
  onUrlChange: (url: string) => void;
  onUpload: (file: File, key: string, cb: (url: string) => void) => void;
  testId?: string;
}

function ImageUploadField({
  label, value, uploadKey, uploading, onUrlChange, onUpload, testId,
}: ImageUploadFieldProps) {
  const isUploading = uploading[uploadKey];
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2 items-start">
        <Input type="text" className="flex-1" value={value}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="URL gambar atau upload..." data-testid={testId} />
        <Button type="button" variant="outline" asChild disabled={isUploading}
          className="cursor-pointer hover:bg-foreground hover:text-white shrink-0">
          <label>
            <Upload size={14} strokeWidth={1.5} />
            {isUploading ? "Mengunggah..." : "Unggah"}
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
            <X size={14} />
          </Button>
        )}
      </div>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={safeImageSrc(value)} alt="Preview"
          className="mt-1 max-h-32 object-cover border border-jepang-border" />
      )}
    </div>
  );
}

/* ─── Defaults ───────────────────────────────────────── */
const DEFAULT_OPTION = (): QuizOption => ({
  option_text: "", image_url: "", is_correct: false,
});
const DEFAULT_QUESTION = (): QuizQuestion => ({
  question_text: "",
  image_url: "",
  options: [{ ...DEFAULT_OPTION(), is_correct: true }, DEFAULT_OPTION()],
});

/* ─── Page ───────────────────────────────────────────── */
export default function AdminEditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { upload, uploading } = useImageUpload();

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  // Image URLs that exist in R2 at load time; any dropped on save is deleted.
  const originalImageUrls = useRef<string[]>([]);

  const [form, setForm] = useState<QuizForm>({
    title: "",
    description: "",
    thumbnail_url: "",
    quiz_type: "trivia",
    status: "DRAFT",
    points_reward: 10,
    correct_answer_points: 5,
    allow_retry: false,
    show_result_immediately: true,
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>([DEFAULT_QUESTION()]);

  /* ── Load existing data ── */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/quizzes/${id}`);
        if (!res.ok) throw new Error("Kuis tidak ditemukan");
        const data = await parseApiResponse(res);

        setForm({
          title: data.title,
          description: data.description || "",
          thumbnail_url: data.thumbnailUrl || "",
          quiz_type: data.quizType,
          status: data.status,
          points_reward: data.pointsReward,
          correct_answer_points: data.correctAnswerPoints,
          allow_retry: data.allowRetry,
          show_result_immediately: data.showResultImmediately,
        });

        if (Array.isArray(data.questions) && data.questions.length > 0) {
          setQuestions(
            data.questions.map((q: any) => ({
              id: q.id,
              question_text: q.questionText,
              image_url: q.imageUrl || "",
              options: (q.options || []).map((o: any) => ({
                id: o.id,
                option_text: o.optionText,
                image_url: o.imageUrl || "",
                is_correct: o.isCorrect,
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
        toast.error(e.message || "Gagal memuat data kuis");
        router.push("/admin/quizzes");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, router]);

  /* ── Question helpers ── */
  const addQuestion = () => setQuestions((q) => [...q, DEFAULT_QUESTION()]);
  const removeQuestion = (idx: number) =>
    setQuestions((q) => q.filter((_, i) => i !== idx));
  const updateQuestion = (idx: number, field: keyof QuizQuestion, val: string) =>
    setQuestions((q) => {
      const next = [...q];
      (next[idx] as any)[field] = val;
      return next;
    });

  /* ── Option helpers ── */
  const addOption = (qIdx: number) =>
    setQuestions((q) => {
      const next = [...q];
      next[qIdx] = { ...next[qIdx], options: [...next[qIdx].options, DEFAULT_OPTION()] };
      return next;
    });
  const removeOption = (qIdx: number, oIdx: number) =>
    setQuestions((q) => {
      const next = [...q];
      const opts = next[qIdx].options.filter((_, i) => i !== oIdx);
      if (!opts.some((o) => o.is_correct) && opts.length > 0) opts[0].is_correct = true;
      next[qIdx] = { ...next[qIdx], options: opts };
      return next;
    });
  const updateOption = (qIdx: number, oIdx: number, field: keyof QuizOption, val: any) =>
    setQuestions((q) => {
      const next = [...q];
      const opts = next[qIdx].options.map((o, i) => {
        if (field === "is_correct") return { ...o, is_correct: i === oIdx };
        return i === oIdx ? { ...o, [field]: val } : o;
      });
      next[qIdx] = { ...next[qIdx], options: opts };
      return next;
    });

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error("Judul kuis wajib diisi"); return; }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) { toast.error(`Pertanyaan ${i + 1} belum diisi`); return; }
      if (q.options.some((o) => !o.option_text.trim())) {
        toast.error(`Semua opsi di pertanyaan ${i + 1} wajib diisi`); return;
      }
      if (!q.options.some((o) => o.is_correct)) {
        toast.error(`Pertanyaan ${i + 1} harus memiliki 1 jawaban benar`); return;
      }
    }

    setLoading(true);
    try {
      const thumbnailUrl = (await commitStagedUrl(form.thumbnail_url)) || null;
      const committedQuestions = await Promise.all(
        questions.map(async (q, i) => ({
          id: q.id,
          question_text: q.question_text,
          image_url: (await commitStagedUrl(q.image_url)) || null,
          sort_order: i,
          options: await Promise.all(
            q.options.map(async (o, j) => ({
              id: o.id,
              option_text: o.option_text,
              image_url: (await commitStagedUrl(o.image_url)) || null,
              is_correct: o.is_correct,
              sort_order: j,
            })),
          ),
        })),
      );

      const res = await fetch(`/api/admin/quizzes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          thumbnailUrl,
          quizType: form.quiz_type,
          status: form.status,
          pointsReward: form.points_reward,
          correctAnswerPoints: form.correct_answer_points,
          allowRetry: form.allow_retry,
          showResultImmediately: form.show_result_immediately,
          questions: committedQuestions,
        }),
      });

      if (!res.ok) {
        const e = await parseApiResponse(res);
        throw new Error(e.error);
      }

      // Remove R2 objects that are no longer referenced after this save.
      const finalUrls = new Set<string>();
      if (thumbnailUrl) finalUrls.add(thumbnailUrl);
      for (const q of committedQuestions) {
        if (q.image_url) finalUrls.add(q.image_url);
        for (const o of q.options) if (o.image_url) finalUrls.add(o.image_url);
      }
      for (const url of originalImageUrls.current) {
        if (!finalUrls.has(url)) deleteMediaFile(url).catch(() => {});
      }
      originalImageUrls.current = Array.from(finalUrls);

      toast.success("Kuis berhasil diperbarui");
      router.push("/admin/quizzes");
    } catch (e: any) {
      toast.error(e.message || "Gagal memperbarui kuis");
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading state ── */
  if (fetching) {
    return (
      <AdminPageLayout
        backHref="/admin/quizzes"
        backLabel="Kembali ke Daftar Kuis"
        title="Edit Kuis"
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
      testId="admin-edit-quiz-page"
      backHref="/admin/quizzes"
      backLabel="Kembali ke Daftar Kuis"
      title="Edit Kuis"
      subtitle="Perbarui informasi, pertanyaan, dan pilihan jawaban kuis."
    >
      <div className="space-y-8">
        {/* ── Info Kuis ── */}
        <section className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-red">
            INFO KUIS
          </p>

          <div className="space-y-2">
            <Label htmlFor="quiz-title">
              Judul Kuis <span className="text-jepang-red">*</span>
            </Label>
            <Input id="quiz-title" type="text" className="font-heading font-bold text-xl"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Judul kuis..." data-testid="quiz-title-input" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quiz-desc">Deskripsi</Label>
            <Textarea id="quiz-desc" rows={3} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Deskripsi singkat tentang kuis..." data-testid="quiz-description-input" />
          </div>

          <ImageUploadField label="Thumbnail" value={form.thumbnail_url}
            uploadKey="thumbnail" uploading={uploading}
            onUrlChange={(url) => setForm((f) => ({ ...f, thumbnail_url: url }))}
            onUpload={upload} testId="quiz-thumbnail-input" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Tipe Kuis</Label>
              <Select value={form.quiz_type} onValueChange={(v) => setForm({ ...form, quiz_type: v })}>
                <SelectTrigger data-testid="quiz-type-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="trivia">Trivia</SelectItem>
                  <SelectItem value="personality">Kepribadian</SelectItem>
                  <SelectItem value="knowledge">Pengetahuan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger data-testid="quiz-status-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="DRAFT">Draf</SelectItem>
                  <SelectItem value="INACTIVE">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points-reward">Poin Selesai Kuis</Label>
              <Input id="points-reward" type="number" min={0} value={form.points_reward}
                onChange={(e) => setForm({ ...form, points_reward: Number(e.target.value) })}
                data-testid="quiz-points-reward-input" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="correct-points">Poin per Jawaban Benar</Label>
              <Input id="correct-points" type="number" min={0} value={form.correct_answer_points}
                onChange={(e) => setForm({ ...form, correct_answer_points: Number(e.target.value) })}
                data-testid="quiz-correct-points-input" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex items-center gap-3">
              <Switch id="allow-retry" checked={form.allow_retry}
                onCheckedChange={(v: boolean) => setForm({ ...form, allow_retry: v })}
                data-testid="quiz-allow-retry-switch" />
              <Label htmlFor="allow-retry" className="cursor-pointer">Izinkan pengulangan kuis</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="show-result" checked={form.show_result_immediately}
                onCheckedChange={(v: boolean) => setForm({ ...form, show_result_immediately: v })}
                data-testid="quiz-show-result-switch" />
              <Label htmlFor="show-result" className="cursor-pointer">
                Tampilkan hasil segera setelah menjawab
              </Label>
            </div>
          </div>
        </section>

        {/* ── Pertanyaan ── */}
        <section className="pt-6 border-t border-jepang-border space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">
              PERTANYAAN ({questions.length})
            </p>
            <Button type="button" variant="outline" size="sm" onClick={addQuestion}
              className="hover:bg-foreground hover:text-white" data-testid="add-question-btn">
              <Plus size={14} /> Tambah Pertanyaan
            </Button>
          </div>

          {questions.map((q, qIdx) => (
            <Card key={qIdx} className="bg-jepang-off-white border border-jepang-border"
              data-testid={`question-form-${qIdx}`}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-red">
                    PERTANYAAN {qIdx + 1}
                  </p>
                  {questions.length > 1 && (
                    <Button type="button" variant="ghost" size="icon"
                      onClick={() => removeQuestion(qIdx)}
                      className="text-jepang-red hover:text-jepang-red"
                      data-testid={`remove-question-${qIdx}`}>
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Pertanyaan <span className="text-jepang-red">*</span></Label>
                  <Textarea rows={2} placeholder="Tulis pertanyaan..."
                    value={q.question_text}
                    onChange={(e) => updateQuestion(qIdx, "question_text", e.target.value)}
                    data-testid={`question-text-${qIdx}`} />
                </div>

                <ImageUploadField label="Gambar Pertanyaan (opsional)"
                  value={q.image_url} uploadKey={`question-${qIdx}`} uploading={uploading}
                  onUrlChange={(url) => updateQuestion(qIdx, "image_url", url)}
                  onUpload={upload} testId={`question-image-${qIdx}`} />

                <div className="space-y-3">
                  <Label>
                    Pilihan Jawaban{" "}
                    <span className="text-jepang-muted text-xs font-normal">
                      (● = jawaban benar)
                    </span>
                  </Label>

                  {q.options.map((o, oIdx) => (
                    <div key={oIdx}
                      className={cn(
                        "border border-jepang-border bg-white p-3 space-y-2",
                        o.is_correct && "border-jepang-red bg-red-50",
                      )}
                      data-testid={`option-card-${qIdx}-${oIdx}`}>
                      <div className="flex items-center gap-2">
                        <input type="radio" name={`correct-${qIdx}`} checked={o.is_correct}
                          onChange={() => updateOption(qIdx, oIdx, "is_correct", true)}
                          className="w-4 h-4 accent-jepang-red shrink-0"
                          title="Tandai sebagai jawaban benar"
                          data-testid={`correct-${qIdx}-${oIdx}`} />
                        <Input type="text" className="flex-1 bg-transparent"
                          placeholder={`Opsi ${String.fromCharCode(65 + oIdx)}`}
                          value={o.option_text}
                          onChange={(e) => updateOption(qIdx, oIdx, "option_text", e.target.value)}
                          data-testid={`option-text-${qIdx}-${oIdx}`} />
                        {q.options.length > 2 && (
                          <Button type="button" variant="ghost" size="icon"
                            onClick={() => removeOption(qIdx, oIdx)}
                            className="text-jepang-red hover:text-jepang-red shrink-0"
                            data-testid={`remove-option-${qIdx}-${oIdx}`}>
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                      <div className="pl-6">
                        <ImageUploadField label="Gambar Opsi (opsional)"
                          value={o.image_url} uploadKey={`option-${qIdx}-${oIdx}`}
                          uploading={uploading}
                          onUrlChange={(url) => updateOption(qIdx, oIdx, "image_url", url)}
                          onUpload={upload} testId={`option-image-${qIdx}-${oIdx}`} />
                      </div>
                    </div>
                  ))}

                  {q.options.length < 6 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => addOption(qIdx)}
                      className="text-jepang-red hover:text-jepang-red hover:bg-red-50"
                      data-testid={`add-option-${qIdx}`}>
                      <Plus size={13} className="mr-1" /> Tambah Opsi
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
            data-testid="edit-quiz-submit">
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/admin/quizzes")}
            disabled={loading} className="hover:bg-foreground hover:text-white">
            Batal
          </Button>
        </div>
      </div>
    </AdminPageLayout>
  );
}
