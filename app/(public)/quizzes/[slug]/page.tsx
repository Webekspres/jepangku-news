"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function QuizDetailPage() {
  const { slug } = useParams<{ slug: string }>()!;
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const isLoading = loading && !quiz;

  useEffect(() => {
    fetch(`/api/quizzes/${slug}`)
      .then((r) => {
        if (!r.ok) {
          router.push("/quizzes");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setQuiz(d);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Silakan masuk untuk mengirim kuis");
      router.push("/login");
      return;
    }
    if (Object.keys(answers).length !== quiz.questions.length) {
      toast.error("Jawab semua pertanyaan terlebih dahulu");
      return;
    }
    setSubmitting(true);
    try {
      const answerList = Object.entries(answers).map(
        ([question_id, selected_option_id]) => ({
          question_id,
          selected_option_id,
        }),
      );
      const data = await fetch(`/api/quizzes/${slug}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answerList }),
      }).then((r) => {
        if (!r.ok)
          return r.json().then((e) => {
            throw new Error(e.error);
          });
        return r.json();
      });
      setResult(data);
      toast.success(`+${data.pointsAwarded} poin didapat!`);
      refreshUser();
    } catch (e: any) {
      toast.error(e.message || "Gagal mengirim kuis");
    } finally {
      setSubmitting(false);
    }
  };

  if (!quiz && !loading) return null;

  if (result) {
    return (
      <div
        className="bg-jepang-off-white min-h-screen py-12"
        data-testid="quiz-result"
      >
        <div className="max-w-2xl mx-auto px-4">
          <Card className="border border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <Award
                  size={64}
                  strokeWidth={1.5}
                  className="mx-auto text-jepang-red mb-3"
                />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-red mb-2">
                  KUIS SELESAI
                </p>
                <h2 className="font-heading font-black text-4xl tracking-tighter">
                  {quiz.title}
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-4 my-8">
                <div className="text-center p-4 border border-jepang-border">
                  <p className="font-mono font-black text-4xl text-foreground">
                    {result.correctAnswers}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-jepang-muted mt-1">
                    Benar
                  </p>
                </div>
                <div className="text-center p-4 border border-jepang-border">
                  <p className="font-mono font-black text-4xl text-jepang-muted">
                    {result.totalQuestions}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-jepang-muted mt-1">
                    Total
                  </p>
                </div>
                <div className="text-center p-4 border border-jepang-red bg-jepang-red text-white">
                  <p className="font-mono font-black text-4xl">
                    +{result.pointsAwarded}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider mt-1">
                    Poin
                  </p>
                </div>
              </div>
              <div className="text-center">
                <p className="font-mono text-2xl mb-6">
                  SKOR:{" "}
                  <span className="font-black">
                    {Math.round(result.score)}%
                  </span>
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    asChild
                    data-testid="back-to-quizzes"
                  >
                    <Link href="/quizzes">KUIS LAIN</Link>
                  </Button>
                  <Button asChild data-testid="view-leaderboard">
                    <Link href="/leaderboard">LIHAT PERINGKAT</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen" data-testid="quiz-detail-page">
      <div className="px-4 mx-auto max-w-7xl py-12">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/quizzes"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted hover:text-jepang-red mb-6"
            data-testid="back-to-quizzes-link"
          >
            <ArrowLeft size={14} /> Kembali ke kuis
          </Link>
          <div className="mb-8">
            <Badge variant="red" className="mb-3 inline-block">
              KUIS
            </Badge>
            {isLoading ? (
            <div className="my-8 -mx-4 md:mx-0">
              <div className="h-72 w-full bg-jepang-red/10 animate-pulse" />
            </div>
          ) : (
            quiz.thumbnailUrl && (
              <div className="my-8 -mx-4 md:mx-0">
                <img
                  src={quiz.thumbnailUrl}
                  alt={quiz.title}
                  className="w-full max-h-150 object-cover"
                />
              </div>
            )
          )}
            <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tighter mb-3 mt-2">
              {isLoading ? (
                <div className="h-12 w-full max-w-3xl bg-jepang-red/10 animate-pulse" />
              ) : (
                quiz.title
              )}
            </h1>
            {isLoading ? (
              <div className="h-4 w-full bg-jepang-red/10 animate-pulse mb-4" />
            ) : (
              quiz.description && (
                <p className="text-jepang-muted text-lg">{quiz.description}</p>
              )
            )}
            <div className="flex items-center gap-4 mt-4 text-xs font-mono uppercase tracking-wider text-jepang-muted">
              <span>
                {isLoading ? (
                  <span className="inline-block h-4 w-10 bg-jepang-red/10 animate-pulse" />
                ) : (
                  `${quiz.questions?.length || 0} pertanyaan`
                )}
              </span>
              <span className="text-jepang-red font-bold">
                {isLoading ? (
                  <span className="inline-block h-4 w-16 bg-jepang-red/10 animate-pulse" />
                ) : (
                  `+${quiz.pointsReward} poin dasar`
                )}
              </span>
              <span className="text-jepang-red font-bold">
                {isLoading ? (
                  <span className="inline-block h-4 w-20 bg-jepang-red/10 animate-pulse" />
                ) : (
                  `+${quiz.correctAnswerPoints} per jawaban benar`
                )}
              </span>
            </div>
          </div>

          {!user && (
            <div
              className="bg-foreground text-white p-4 mb-8"
              data-testid="quiz-login-prompt"
            >
              <p className="text-sm">
                ⚠️{" "}
                <Link
                  href="/login"
                  className="text-jepang-red font-bold underline"
                >
                  Masuk
                </Link>{" "}
                untuk menjawab kuis dan mendapatkan poin!
              </p>
            </div>
          )}

          <div className="space-y-6">
            {isLoading
              ? [1, 2, 3].map((qIdx) => (
                  <Card key={qIdx} className="border border-foreground">
                    <CardContent className="p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-red mb-2">
                        PERTANYAAN{" "}
                        <span className="inline-block h-4 w-6 bg-jepang-red/10 animate-pulse" />
                      </p>
                      <div className="h-6 w-full bg-jepang-red/10 animate-pulse mb-4" />
                      <div className="space-y-2">
                        {[1, 2, 3].map((optionIdx) => (
                          <div
                            key={optionIdx}
                            className="w-full h-12 bg-jepang-red/10 animate-pulse"
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              : quiz.questions?.map((question: any, qIdx: number) => (
                  <Card
                    key={question.id}
                    className="border border-foreground"
                    data-testid={`question-${qIdx}`}
                  >
                    <CardContent className="p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-red mb-2">
                        PERTANYAAN {qIdx + 1}
                      </p>
                      <h3 className="font-heading font-bold text-xl mb-4">
                        {question.questionText}
                      </h3>
                      <div className="space-y-2">
                        {question.options?.map((option: any, oIdx: number) => (
                          <button
                            key={option.id}
                            onClick={() =>
                              setAnswers({
                                ...answers,
                                [question.id]: option.id,
                              })
                            }
                            className={`w-full text-left p-4 border transition-colors ${answers[question.id] === option.id ? "border-jepang-red bg-jepang-red text-white" : "border-jepang-border hover:border-foreground"}`}
                            data-testid={`question-${qIdx}-option-${oIdx}`}
                          >
                            <span className="font-mono font-bold mr-3">
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            {option.optionText}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>

          <div className="mt-8 sticky bottom-0 bg-white border-t-2 border-foreground p-4 -mx-4 md:mx-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted">
                {isLoading ? (
                  <span className="inline-block h-4 w-20 bg-jepang-red/10 animate-pulse" />
                ) : (
                  `${Object.keys(answers).length} / ${quiz.questions?.length || 0} JAWABAN`
                )}
              </p>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !user || isLoading}
                data-testid="submit-quiz-btn"
              >
                {submitting ? "MENGIRIM JAWABAN..." : "KIRIM JAWABAN"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
