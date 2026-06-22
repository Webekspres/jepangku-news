"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MotionHoverScale } from "@/components/ui/motion";
import CardCoverImage from "@/components/CardCoverImage";
import { Zap, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import {
  InteractiveBentoGrid,
  interactiveBentoSpan,
  resolveThumbnailUrl,
} from "@/components/interactive/InteractiveBentoGrid";
import InteractiveBentoSkeleton, {
  InteractiveBentoLoadMoreSkeleton,
} from "@/components/skeletons/InteractiveBentoSkeleton";
import { cn } from "@/lib/utils";

/* ─── Quiz Card ──────────────────────────────────────── */
function QuizCard({ quiz }: { quiz: any }) {
  const thumbnailUrl = resolveThumbnailUrl(quiz);

  const footer = (
    <div className="mt-auto flex items-center justify-between border-t border-jepang-border pt-3 text-xs font-mono uppercase tracking-wider">
      <span className="text-jepang-muted">{quiz.questionCount || 0} Q</span>
      <span className="flex items-center gap-1 font-bold text-jepang-red">
        <Award size={12} strokeWidth={1.5} /> +{quiz.pointsReward || 10} POIN
      </span>
    </div>
  );

  return (
    <Link
      href={`/quizzes/${quiz.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg border border-jepang-border bg-white transition-all hover:border-jepang-navy/30 hover:shadow-sm",
        interactiveBentoSpan(true),
      )}
      data-testid={`quiz-card-${quiz.slug}`}
    >
      <div className="relative aspect-16/10 shrink-0 overflow-hidden bg-jepang-off-white">
        <MotionHoverScale className="absolute inset-0">
          <CardCoverImage
            src={thumbnailUrl}
            alt={quiz.title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </MotionHoverScale>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <Badge variant="red" className="w-fit">
          QUIZ
        </Badge>
        <h3 className="line-clamp-2 font-heading text-xl font-bold transition-colors group-hover:text-jepang-red">
          {quiz.title}
        </h3>
        {quiz.description && (
          <p className="line-clamp-2 text-sm text-jepang-muted">
            {quiz.description}
          </p>
        )}
        {footer}
      </div>
    </Link>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  useEffect(() => {
    loadQuizzes(1, true);
  }, []);

  const loadQuizzes = async (pageNum: number, reset = false) => {
    reset ? setLoading(true) : setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        status: "ACTIVE",
        limit: String(PER_PAGE),
        page: String(pageNum),
      });
      const data = await fetch(`/api/quizzes?${params}`).then((r) => r.json());
      const incoming: any[] = Array.isArray(data.quizzes) ? data.quizzes : [];

      if (reset) {
        setQuizzes(incoming);
      } else {
        setQuizzes((prev) => {
          const ids = new Set(prev.map((q) => q.id));
          return [...prev, ...incoming.filter((q) => q.id && !ids.has(q.id))];
        });
      }

      setTotal(Number(data.total || 0));
      setPage(pageNum);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const hasMore = quizzes.length < total;

  const loadMore = () => {
    if (loadingMore || loading || !hasMore) return;
    loadQuizzes(page + 1);
  };

  return (
    <div className="bg-white min-h-screen" data-testid="quiz-list-page">
      <SectionHeader
        label="クイズ / Kuis"
        title="Tes pengetahuanmu"
        subtitle="Ikuti quiz tentang anime, manga, budaya Jepang, dan dapatkan poin!"
      />
      <div className="px-4 mx-auto max-w-7xl py-12">
        {loading ? (
          <InteractiveBentoSkeleton count={PER_PAGE} />
        ) : quizzes.length > 0 ? (
          <>
            <InteractiveBentoGrid>
              {quizzes.map((quiz: any) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
              {loadingMore && <InteractiveBentoLoadMoreSkeleton count={3} />}
            </InteractiveBentoGrid>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={loadMore}
                  disabled={loadingMore}
                  data-testid="load-more"
                >
                  {loadingMore ? "Memuat..." : "Muat Lebih Banyak"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-24 text-center" data-testid="no-quizzes">
            <Zap
              size={48}
              strokeWidth={1.5}
              className="mx-auto mb-4 text-jepang-muted"
            />
            <p className="mb-2 font-heading text-2xl font-bold">
              Belum ada kuis tersedia
            </p>
            <p className="text-jepang-muted">
              Check back soon for new quizzes!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
