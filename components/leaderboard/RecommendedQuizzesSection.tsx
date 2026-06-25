"use client";

import { useEffect, useState } from "react";
import { parseApiResponse } from "@/lib/fetch-api";
import Link from "next/link";
import CardCoverImage from "@/components/CardCoverImage";
import { BrainCircuit, Award, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { resolveThumbnailUrl } from "@/lib/image-placeholder";
import { cn } from "@/lib/utils";
import { MotionHoverScale } from "@/components/ui/motion";

type Quiz = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  questionCount?: number;
  pointsReward?: number;
  status?: string;
};

type RecommendedQuizzesSectionProps = {
  className?: string;
};

export default function RecommendedQuizzesSection({
  className,
}: RecommendedQuizzesSectionProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadQuizzes() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          status: "ACTIVE",
          sort: "pointsReward:desc",
          limit: "4",
        });
        const res = await fetch(`/api/quizzes?${params}`);
        if (!res.ok) throw new Error("Failed to load quizzes");
        const data = await parseApiResponse(res);
        const items = Array.isArray(data.quizzes) ? data.quizzes : [];

        if (!cancelled) {
          setQuizzes(items);
        }
      } catch {
        if (!cancelled) setQuizzes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadQuizzes();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section
        className={cn("py-12 px-4 bg-white", className)}
        data-testid="recommended-quizzes-loading"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center gap-2">
            <BrainCircuit size={24} strokeWidth={1.5} className="text-jepang-red" />
            <h2 className="font-heading text-2xl font-black tracking-tight">
              クイズ / Kuis Berhadiah
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, idx) => (
              <Card
                key={idx}
                className="h-full animate-pulse border border-jepang-border bg-white"
              >
                <div className="aspect-16/10 bg-jepang-border" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-20 rounded bg-jepang-border" />
                  <div className="h-5 w-full rounded bg-jepang-border" />
                  <div className="h-5 w-4/5 rounded bg-jepang-border" />
                  <div className="h-3 w-full rounded bg-jepang-border" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (quizzes.length === 0) {
    return null;
  }

  return (
    <section
      className={cn("py-12 px-4 bg-white", className)}
      data-testid="recommended-quizzes-section"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrainCircuit size={24} strokeWidth={1.5} className="text-jepang-red" />
            <h2 className="font-heading text-2xl font-black tracking-tight">
              クイズ / Kuis Berhadiah
            </h2>
          </div>
          <Link
            href="/quizzes"
            className="inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wider text-jepang-muted transition-colors hover:text-jepang-red"
            data-testid="recommended-quizzes-view-all"
          >
            Semua Kuis <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {quizzes.map((quiz) => {
            const thumbnailUrl = resolveThumbnailUrl(quiz);
            return (
              <Link
                key={quiz.id}
                href={`/quizzes/${quiz.slug}`}
                className="group block h-full"
                data-testid={`recommended-quiz-${quiz.slug}`}
              >
                <Card className="h-full overflow-hidden border border-jepang-border bg-white transition-colors hover:border-jepang-navy/30 hover:shadow-sm">
                  <div className="relative aspect-16/10 shrink-0 overflow-hidden bg-jepang-off-white">
                    <MotionHoverScale className="absolute inset-0">
                      <CardCoverImage
                        src={thumbnailUrl}
                        alt={quiz.title}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </MotionHoverScale>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="black">KUIS</Badge>
                      <span className="flex shrink-0 items-center gap-1 text-xs font-mono font-bold uppercase tracking-wider text-jepang-red">
                        <Award size={11} strokeWidth={1.5} /> +{quiz.pointsReward ?? 0} POIN
                      </span>
                    </div>
                    <h3 className="font-heading text-lg font-bold leading-tight tracking-tight transition-colors group-hover:text-jepang-red line-clamp-2">
                      {quiz.title}
                    </h3>
                    {quiz.description && (
                      <p className="line-clamp-2 text-sm leading-relaxed text-jepang-muted">
                        {quiz.description}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between border-t border-jepang-border pt-3 text-xs font-mono uppercase tracking-wider">
                      <span className="text-jepang-muted">
                        {quiz.questionCount ?? 0} PERTANYAAN
                      </span>
                      <span className="flex items-center gap-0.5 font-bold text-jepang-red transition-all group-hover:gap-1.5">
                        Ikuti <ChevronRight size={12} strokeWidth={2.5} />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
