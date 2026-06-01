"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
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

export default function AdminCreateQuiz() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    thumbnail_url: "",
    status: "ACTIVE",
  });

  const [questions, setQuestions] = useState([
    {
      question_text: "",
      options: [
        { option_text: "", is_correct: true },
        { option_text: "", is_correct: false },
      ],
    },
  ]);

  const [loading, setLoading] = useState(false);

  const addQuestion = () =>
    setQuestions([
      ...questions,
      {
        question_text: "",
        options: [
          { option_text: "", is_correct: true },
          { option_text: "", is_correct: false },
        ],
      },
    ]);

  const removeQuestion = (idx: number) =>
    setQuestions(questions.filter((_, i) => i !== idx));

  const updateQuestion = (idx: number, val: string) => {
    const q = [...questions];
    q[idx].question_text = val;
    setQuestions(q);
  };

  const addOption = (qIdx: number) => {
    const q = [...questions];
    q[qIdx].options.push({ option_text: "", is_correct: false });
    setQuestions(q);
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    const q = [...questions];
    q[qIdx].options = q[qIdx].options.filter((_, i) => i !== oIdx);
    setQuestions(q);
  };

  const updateOption = (
    qIdx: number,
    oIdx: number,
    field: string,
    val: any,
  ) => {
    const q = [...questions];

    if (field === "is_correct") {
      q[qIdx].options.forEach((o, i) => {
        o.is_correct = i === oIdx;
      });
    } else {
      (q[qIdx].options[oIdx] as any)[field] = val;
    }

    setQuestions(q);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Judul kuis wajib diisi");
      return;
    }

    if (
      questions.some(
        (q) =>
          !q.question_text.trim() ||
          q.options.some((o) => !o.option_text.trim()),
      )
    ) {
      toast.error("Semua pertanyaan dan opsi jawaban wajib diisi");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, questions }),
      });

      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error);
      }

      toast.success("Kuis berhasil dibuat");
      router.push("/admin");
    } catch (e: any) {
      toast.error(e.message || "Gagal membuat kuis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen" data-testid="admin-create-quiz-page">
      <section className="border-b-2 border-foreground bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl py-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted hover:text-jepang-red mb-4"
          >
            <ArrowLeft size={14} /> Kembali ke Dashboard
          </Link>

          <h1 className="font-heading font-black text-4xl tracking-tighter">
            Buat Kuis
          </h1>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="quiz-title">Judul Kuis *</Label>

          <Input
            id="quiz-title"
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            data-testid="quiz-title-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quiz-desc">Deskripsi</Label>

          <Textarea
            id="quiz-desc"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            data-testid="quiz-description-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quiz-thumb">URL Thumbnail</Label>

          <Input
            id="quiz-thumb"
            type="text"
            value={form.thumbnail_url}
            onChange={(e) =>
              setForm({ ...form, thumbnail_url: e.target.value })
            }
            data-testid="quiz-thumbnail-input"
          />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>

          <Select
            value={form.status}
            onValueChange={(v) => setForm({ ...form, status: v })}
          >
            <SelectTrigger data-testid="quiz-status-select">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ACTIVE">Aktif</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="INACTIVE">Tidak Aktif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-6 border-t border-jepang-border">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">
              PERTANYAAN
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={addQuestion}
              data-testid="add-question-btn"
            >
              <Plus size={14} /> Tambah Pertanyaan
            </Button>
          </div>

          {questions.map((q, qIdx) => (
            <Card
              key={qIdx}
              className="bg-jepang-off-white border border-jepang-border mb-3"
              data-testid={`question-form-${qIdx}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-red">
                    PERTANYAAN {qIdx + 1}
                  </p>

                  {questions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(qIdx)}
                      className="text-jepang-red"
                      data-testid={`remove-question-${qIdx}`}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>

                <Input
                  type="text"
                  className="mb-3"
                  placeholder="Tulis pertanyaan..."
                  value={q.question_text}
                  onChange={(e) => updateQuestion(qIdx, e.target.value)}
                  data-testid={`question-text-${qIdx}`}
                />

                <div className="space-y-2">
                  {q.options.map((o, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={o.is_correct}
                        onChange={() =>
                          updateOption(qIdx, oIdx, "is_correct", true)
                        }
                        className="w-4 h-4 accent-jepang-red"
                        data-testid={`correct-${qIdx}-${oIdx}`}
                      />

                      <Input
                        type="text"
                        className="flex-1"
                        placeholder={`Opsi ${String.fromCharCode(65 + oIdx)}`}
                        value={o.option_text}
                        onChange={(e) =>
                          updateOption(
                            qIdx,
                            oIdx,
                            "option_text",
                            e.target.value,
                          )
                        }
                        data-testid={`option-text-${qIdx}-${oIdx}`}
                      />

                      {q.options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(qIdx, oIdx)}
                          className="text-jepang-red"
                          data-testid={`remove-option-${qIdx}-${oIdx}`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addOption(qIdx)}
                    className="text-jepang-red hover:text-jepang-red"
                    data-testid={`add-option-${qIdx}`}
                  >
                    + Tambah Opsi
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="pt-6 border-t border-jepang-border">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            data-testid="create-quiz-submit"
          >
            {loading ? "Membuat..." : "Buat Kuis"}
          </Button>
        </div>
      </div>
    </div>
  );
}
