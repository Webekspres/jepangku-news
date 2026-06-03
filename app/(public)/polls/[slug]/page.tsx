"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, BarChart3, Award, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────── */
interface PollOptionData {
  id: string;
  optionText: string;
  imageUrl: string | null;
  voteCount: number;
  percentage: number;
}

interface PollQuestionData {
  id: string;
  questionText: string;
  imageUrl: string | null;
  sortOrder: number;
  totalVotes: number;
  options: PollOptionData[];
}

interface PollData {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  pollType: string;
  pointsReward: number;
  questions: PollQuestionData[];
  totalVotes: number;
}

/* ─── Skeleton ───────────────────────────────────────── */
function QuestionSkeleton() {
  return (
    <div className="border border-jepang-border p-5 space-y-4 animate-pulse">
      <div className="h-5 w-2/3 bg-jepang-border" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-jepang-border overflow-hidden">
          <div className="relative p-4">
            <div className="absolute inset-0 bg-jepang-border/20" />
            <div className="relative flex items-center justify-between">
              <div className="h-4 w-1/2 bg-jepang-border" />
              <div className="h-4 w-12 bg-jepang-border" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export default function PollDetailPage() {
  const { slug } = useParams<{ slug: string }>()!;
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [poll, setPoll] = useState<PollData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // selectedVotes: { [questionId]: optionId }
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({});
  // votedQuestions: set of questionId yang sudah di-submit
  const [votedQuestions, setVotedQuestions] = useState<Set<string>>(new Set());

  const isLoading = loading && !poll;

  const fetchPoll = async () => {
    const res = await fetch(`/api/polls/${slug}`);
    if (!res.ok) { router.push("/polls"); return; }
    const data: PollData = await res.json();
    setPoll(data);
  };

  useEffect(() => {
    fetchPoll().finally(() => setLoading(false));
  }, [slug]);

  const selectOption = (questionId: string, optionId: string) => {
    if (votedQuestions.has(questionId)) return;
    setSelectedVotes((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmitAll = async () => {
    if (!user) {
      toast.error("Silakan masuk untuk memberikan suara");
      router.push("/login");
      return;
    }

    const toVote = poll!.questions
      .filter((q) => !votedQuestions.has(q.id) && selectedVotes[q.id])
      .map((q) => ({ questionId: q.id, optionId: selectedVotes[q.id] }));

    if (toVote.length === 0) {
      toast.error("Pilih setidaknya satu opsi terlebih dahulu");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/polls/${slug}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votes: toVote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.pointsAwarded > 0) {
        toast.success(`+${data.pointsAwarded} poin untuk voting!`);
        refreshUser();
      } else {
        toast.success("Suara berhasil dicatat!");
      }

      // Tandai pertanyaan yang sudah divote
      setVotedQuestions((prev) => {
        const next = new Set(prev);
        toVote.forEach((v) => next.add(v.questionId));
        return next;
      });

      await fetchPoll();
    } catch (e: any) {
      toast.error(e.message || "Gagal memberikan suara");
    } finally {
      setSubmitting(false);
    }
  };

  if (!poll && !loading) return null;

  const allAnswered =
    poll?.questions.every(
      (q) => votedQuestions.has(q.id) || selectedVotes[q.id],
    ) ?? false;

  const anyUnvoted =
    poll?.questions.some((q) => !votedQuestions.has(q.id)) ?? false;

  return (
    <div className="bg-white min-h-screen" data-testid="poll-detail-page">
      <div className="px-4 mx-auto max-w-7xl py-12">
        <div className="max-w-3xl mx-auto">
          {/* Back */}
          <Link
            href="/polls"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted hover:text-jepang-red mb-6"
            data-testid="back-to-polls"
          >
            <ArrowLeft size={14} /> Kembali ke Polls
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              {isLoading ? (
                <>
                  <div className="h-6 w-24 bg-jepang-border animate-pulse" />
                  <div className="h-6 w-28 bg-jepang-border animate-pulse" />
                </>
              ) : (
                <>
                  <Badge variant={poll!.pollType === "VOTING" ? "red" : "black"}>
                    {poll!.pollType}
                  </Badge>
                  <Badge className="text-jepang-red border-jepang-red">
                    <Award size={10} strokeWidth={1.5} className="mr-1" />
                    +{poll!.pointsReward} PTS
                  </Badge>
                </>
              )}
            </div>

            <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tighter mb-3">
              {isLoading ? (
                <div className="h-12 w-full bg-jepang-border animate-pulse" />
              ) : (
                poll!.title
              )}
            </h1>

            {isLoading ? (
              <div className="h-4 w-full bg-jepang-border animate-pulse" />
            ) : (
              poll!.description && (
                <p className="text-jepang-muted text-lg">{poll!.description}</p>
              )
            )}
          </div>

          {/* Thumbnail */}
          {isLoading ? (
            <div className="w-full aspect-video bg-jepang-border animate-pulse mb-8" />
          ) : poll!.thumbnailUrl ? (
            <div className="relative w-full aspect-video overflow-hidden mb-8">
              <Image
                src={poll!.thumbnailUrl}
                alt={poll!.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : null}

          {/* Questions */}
          <div className="space-y-6">
            {isLoading ? (
              <>
                <QuestionSkeleton />
                <QuestionSkeleton />
              </>
            ) : (
              poll!.questions.map((q, qIdx) => {
                const isVoted = votedQuestions.has(q.id);
                const selected = selectedVotes[q.id];

                return (
                  <Card
                    key={q.id}
                    className={cn(
                      "border shadow-[4px_4px_0px_0px_#000]",
                      isVoted
                        ? "border-jepang-red shadow-[4px_4px_0px_0px_#d90429]"
                        : "border-foreground",
                    )}
                    data-testid={`poll-question-${qIdx}`}
                  >
                    <CardContent className="p-6 space-y-4">
                      {/* Question header */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className="font-mono font-bold text-jepang-muted text-sm shrink-0 mt-0.5">
                              Q{qIdx + 1}
                            </span>
                            <p className="font-heading font-bold text-lg leading-snug">
                              {q.questionText}
                            </p>
                          </div>
                          {isVoted && (
                            <CheckCircle2
                              size={18}
                              className="text-jepang-red shrink-0 mt-0.5"
                              strokeWidth={2}
                            />
                          )}
                        </div>

                        {/* Question image */}
                        {q.imageUrl && (
                          <div className="relative w-full aspect-video overflow-hidden">
                            <Image
                              src={q.imageUrl}
                              alt={q.questionText}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>

                      {/* Options */}
                      <div className="space-y-2">
                        {q.options.map((opt, oIdx) => {
                          const pct = opt.percentage || 0;
                          const isSelected = selected === opt.id;
                          const showResult = isVoted;

                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => selectOption(q.id, opt.id)}
                              disabled={isVoted || submitting}
                              className={cn(
                                "w-full text-left border transition-colors overflow-hidden",
                                "disabled:cursor-default",
                                isVoted
                                  ? "border-jepang-border opacity-90"
                                  : isSelected
                                  ? "border-foreground"
                                  : "border-jepang-border hover:border-foreground",
                              )}
                              data-testid={`poll-option-${qIdx}-${oIdx}`}
                            >
                              {/* Option image */}
                              {opt.imageUrl && (
                                <div className="relative w-full h-36 overflow-hidden bg-jepang-off-white">
                                  <Image
                                    src={opt.imageUrl}
                                    alt={opt.optionText}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}

                              {/* Text + stats */}
                              <div className="relative p-4">
                                {showResult && (
                                  <Progress
                                    value={Math.round(pct)}
                                    className="absolute inset-0 h-full opacity-15"
                                  />
                                )}
                                <div className="relative flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <span
                                      className={cn(
                                        "font-mono font-bold text-sm shrink-0",
                                        isSelected && !isVoted
                                          ? "text-foreground"
                                          : "text-jepang-muted",
                                      )}
                                    >
                                      {String.fromCharCode(65 + oIdx)}
                                    </span>
                                    <span
                                      className={cn(
                                        "font-semibold text-sm",
                                        isSelected && !isVoted && "font-bold",
                                      )}
                                    >
                                      {opt.optionText}
                                    </span>
                                  </div>
                                  {showResult && (
                                    <div className="flex items-center gap-3 shrink-0">
                                      <span className="text-xs font-mono text-jepang-muted">
                                        {opt.voteCount} suara
                                      </span>
                                      <span className="text-base font-mono font-black text-jepang-red">
                                        {Math.round(pct)}%
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Per-question total votes (after voting) */}
                      {isVoted && (
                        <p className="text-xs font-mono text-jepang-muted flex items-center gap-1.5 pt-1">
                          <BarChart3 size={11} strokeWidth={1.5} />
                          {q.totalVotes} total suara pada pertanyaan ini
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Submit button */}
          {!isLoading && anyUnvoted && (
            <div className="mt-8">
              {!user ? (
                <div className="border border-jepang-border p-4 text-center">
                  <Link href="/login" className="text-jepang-red font-bold text-sm">
                    MASUK UNTUK MEMBERIKAN SUARA DAN DAPATKAN +{poll!.pointsReward} POIN
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitAll}
                  disabled={submitting || !allAnswered}
                  className={cn(
                    "w-full py-4 font-heading font-black text-lg tracking-tight transition-colors",
                    "border-2 border-foreground",
                    allAnswered && !submitting
                      ? "bg-foreground text-white hover:bg-jepang-red hover:border-jepang-red"
                      : "bg-white text-jepang-muted border-jepang-border cursor-not-allowed",
                  )}
                  data-testid="submit-votes-btn"
                >
                  {submitting
                    ? "Menyimpan..."
                    : allAnswered
                    ? "Kirim Semua Jawaban"
                    : `Pilih opsi untuk semua pertanyaan (${
                        Object.keys(selectedVotes).filter(
                          (qid) => !votedQuestions.has(qid),
                        ).length
                      }/${poll!.questions.filter((q) => !votedQuestions.has(q.id)).length})`}
                </button>
              )}
            </div>
          )}

          {/* All voted state */}
          {!isLoading && !anyUnvoted && poll!.questions.length > 0 && (
            <div className="mt-8 border border-jepang-red p-4 flex items-center gap-3">
              <CheckCircle2 size={20} className="text-jepang-red shrink-0" />
              <div>
                <p className="font-heading font-bold">Terima kasih sudah berpartisipasi!</p>
                <p className="text-sm text-jepang-muted">
                  Total {poll!.totalVotes} suara terkumpul di polling ini.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
