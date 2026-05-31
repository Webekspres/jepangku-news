"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Zap, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import SectionHeader from "@/components/SectionHeader";
import PollQuizCardSkeleton from "@/components/skeletons/PollQuizCardSkeleton";
import { Button } from "@/components/ui/button";

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

  const loadQuizzes = async (pageNum: number, reset: boolean = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams();
      params.set("status", "ACTIVE");
      params.set("limit", String(PER_PAGE));
      params.set("page", String(pageNum));

      const data = await fetch(`/api/quizzes?${params}`).then((r) => r.json());

      const incomingQuizzes = Array.isArray(data.quizzes || data)
        ? data.quizzes || data
        : [];

      if (reset) {
        setQuizzes(incomingQuizzes);
      } else {
        setQuizzes((prev) => {
          const existingIds = new Set(prev.map((quiz) => quiz.id));
          const uniqueIncoming = incomingQuizzes.filter(
            (quiz: any) => quiz.id && !existingIds.has(quiz.id),
          );
          return [...prev, ...uniqueIncoming];
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => (
              <PollQuizCardSkeleton key={idx} />
            ))}
          </div>
        ) : quizzes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz: any) => (
                <Link
                  key={quiz.id}
                  href={`/quizzes/${quiz.slug}`}
                  className="group block h-full"
                  data-testid={`quiz-card-${quiz.slug}`}
                >
                  <Card className="group h-full bg-white border border-jepang-border hover:border-foreground transition-all">
                    {quiz.thumbnailUrl ? (
                      <div className="relative aspect-video overflow-hidden bg-jepang-off-white">
                        <Image
                          src={quiz.thumbnailUrl}
                          alt={quiz.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-foreground flex items-center justify-center">
                        <Zap
                          size={48}
                          strokeWidth={1.5}
                          className="text-jepang-red"
                        />
                      </div>
                    )}
                    <CardContent className="p-5 pt-4">
                      <Badge variant="red" className="mb-3 inline-block">
                        QUIZ
                      </Badge>
                      <h3 className="font-heading font-bold text-xl mb-2 group-hover:text-jepang-red transition-colors line-clamp-2">
                        {quiz.title}
                      </h3>
                      {quiz.description && (
                        <p className="text-sm text-jepang-muted line-clamp-2 mb-3">
                          {quiz.description}
                        </p>
                      )}
                      <div className="pt-3 border-t border-jepang-border flex items-center justify-between text-xs font-mono uppercase tracking-wider">
                        <span className="text-jepang-muted">
                          {quiz.questionCount || 0} Q
                        </span>
                        <span className="flex items-center gap-1 text-jepang-red font-bold">
                          <Award size={12} strokeWidth={1.5} /> +
                          {quiz.pointsReward || 10} PTS
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

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
          <div className="text-center py-24" data-testid="no-quizzes">
            <Zap
              size={48}
              strokeWidth={1.5}
              className="mx-auto mb-4 text-jepang-muted"
            />
            <p className="font-heading font-bold text-2xl mb-2">
              No quizzes available
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
