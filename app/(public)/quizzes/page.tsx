"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import Link from "next/link";
import { MotionHoverScale } from "@/components/ui/motion";
import CardCoverImage from "@/components/CardCoverImage";
import { Zap, Award, TrendingUp } from "lucide-react";
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
import PopularTags from "@/components/PopularTags";
import SidebarAdSlot from "@/components/home/SidebarAdSlot";
import { useAdSlot } from "@/hooks/useAdSlot";
import { cn } from "@/lib/utils";
import AuthorLink from "@/components/AuthorLink";
import LeaderboardAvatar from "@/components/leaderboard/LeaderboardAvatar";
import LeaderboardScore from "@/components/leaderboard/LeaderboardScore";
import type { HomeLeaderboardEntry } from "@/lib/home/types";

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
function SidebarPanel({
  label,
  title,
  href,
  children,
  testId,
}: {
  label?: string;
  title: string;
  href?: string;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <div
      className="rounded-lg border border-jepang-border bg-white p-4"
      data-testid={testId}
    >
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-jepang-border pb-2">
        <div className="min-w-0">
          {label ? <p className="section-label mb-0.5 text-[10px]">{label}</p> : null}
          <h3 className="truncate font-heading text-sm font-bold tracking-tight">{title}</h3>
        </div>
        {href ? (
          <Link
            href={href}
            className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-jepang-muted transition-colors hover:text-jepang-red"
          >
            Semua
          </Link>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [popularQuizzes, setPopularQuizzes] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<HomeLeaderboardEntry[]>([]);
  const [leaderboardPeriodLabel, setLeaderboardPeriodLabel] = useState("Minggu Ini");
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;
  
  // Use the article-sidebar ad slot for quizzes page
  const {
    data: sidebarAd,
    isLoading: sidebarAdLoading,
    error: sidebarAdError,
  } = useAdSlot("article-sidebar", { immediate: true });

  useEffect(() => {
    loadQuizzes(1, true);
    loadPopularQuizzes();
    loadLeaderboard();
  }, []);

  const loadQuizzes = async (pageNum: number, reset = false) => {
    reset ? setLoading(true) : setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        status: "ACTIVE",
        limit: String(PER_PAGE),
        page: String(pageNum),
      });
      const data = await fetch(`/api/quizzes?${params}`).then((r) => parseApiResponse(r));
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

  const loadPopularQuizzes = async () => {
    setLoadingPopular(true);
    try {
      const params = new URLSearchParams({
        status: "ACTIVE",
        limit: "5",
        sort: "participantCount:desc",
      });
      const data = await fetch(`/api/quizzes?${params}`).then((r) => parseApiResponse(r));
      setPopularQuizzes(Array.isArray(data.quizzes) ? data.quizzes : []);
    } finally {
      setLoadingPopular(false);
    }
  };

  const loadLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const params = new URLSearchParams({
        period: "weekly",
        limit: "5",
      });
      const data = await fetch(`/api/leaderboard?${params}`).then((r) => parseApiResponse(r));
      setLeaderboard(Array.isArray(data.items) ? data.items : []);
      setLeaderboardPeriodLabel(data.periodLabel || "Minggu Ini");
    } finally {
      setLoadingLeaderboard(false);
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
          <main className="min-w-0">
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
          </main>

          <aside className="hidden h-full lg:block">
            <div className="sticky top-24">
              <div className="flex flex-col gap-4" data-testid="quiz-sidebar">
                {/* Peringkat */}
                <SidebarPanel
                  label="ランキング / PERINGKAT"
                  title={`Top ${leaderboardPeriodLabel}`}
                  href="/leaderboard"
                  testId="quiz-leaderboard-section"
                >
                  {loadingLeaderboard ? (
                    <div className="space-y-2">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="h-7 w-7 animate-pulse rounded-full bg-jepang-border/60" />
                          <div className="flex-1 space-y-1">
                            <div className="h-3 w-3/4 animate-pulse rounded bg-jepang-border/60" />
                            <div className="h-2 w-1/2 animate-pulse rounded bg-jepang-border/60" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : leaderboard.length > 0 ? (
                    <ul>
                      {leaderboard.map((entry, idx) => (
                        <li
                          key={entry.userId}
                          className="flex items-center gap-2 border-b border-jepang-border py-2.5 last:border-b-0"
                          data-testid={`quiz-leaderboard-${idx}`}
                        >
                          <span
                            className={`w-5 shrink-0 font-mono text-xs font-black ${
                              idx === 0 ? "text-jepang-red" : "text-jepang-black"
                            }`}
                          >
                            #{entry.rank}
                          </span>
                          <LeaderboardAvatar
                            avatarUrl={entry.avatarUrl}
                            displayName={entry.displayName}
                            size="sm"
                          />
                          <div className="min-w-0 flex-1">
                            <AuthorLink
                              username={entry.username || null}
                              className="block truncate text-xs font-semibold"
                            >
                              {entry.displayName}
                            </AuthorLink>
                            <LeaderboardScore
                              period={entry.period}
                              periodPoints={entry.periodPoints}
                              totalPoints={entry.totalPoints}
                              compact
                            />
                          </div>
                          {idx === 0 ? (
                            <Award size={12} className="shrink-0 text-jepang-red" />
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="py-4 text-center text-xs text-jepang-muted">
                      Belum ada data peringkat.
                    </p>
                  )}
                </SidebarPanel>

                {/* Kuis yang paling banyak diikuti */}
                <SidebarPanel
                  label="人気 / POPULER"
                  title="Kuis Terpopuler"
                  testId="popular-quizzes-section"
                >
                  {loadingPopular ? (
                    <div className="space-y-2">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="h-10 w-10 animate-pulse rounded bg-jepang-border/60" />
                          <div className="flex-1 space-y-1">
                            <div className="h-3 w-3/4 animate-pulse rounded bg-jepang-border/60" />
                            <div className="h-2 w-1/2 animate-pulse rounded bg-jepang-border/60" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : popularQuizzes.length > 0 ? (
                    <ul>
                      {popularQuizzes.map((quiz, idx) => (
                        <li
                          key={quiz.id}
                          className="flex items-center gap-2 border-b border-jepang-border py-2.5 last:border-b-0"
                          data-testid={`popular-quiz-${idx}`}
                        >
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-jepang-off-white">
                            {quiz.thumbnailUrl || quiz.coverImageUrl ? (
                              <CardCoverImage
                                src={resolveThumbnailUrl(quiz)}
                                alt={quiz.title}
                                sizes="40px"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-jepang-border">
                                <TrendingUp size={16} className="text-jepang-muted" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/quizzes/${quiz.slug}`}
                              className="block truncate text-xs font-semibold transition-colors hover:text-jepang-red"
                            >
                              {quiz.title}
                            </Link>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-mono uppercase tracking-wider text-jepang-muted">
                                {quiz.questionCount || 0} Q
                              </span>
                              <span className="text-[9px] font-mono uppercase tracking-wider text-jepang-red">
                                +{quiz.pointsReward || 10} POIN
                              </span>
                              {quiz.participantCount > 0 && (
                                <span className="text-[9px] font-mono uppercase tracking-wider text-jepang-muted">
                                  • {quiz.participantCount.toLocaleString("id-ID")} peserta
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="py-4 text-center text-xs text-jepang-muted">
                      Belum ada data kuis populer.
                    </p>
                  )}
                </SidebarPanel>

                {/* Iklan */}
                  <SidebarAdSlot
                    data={sidebarAd}
                    loading={sidebarAdLoading}
                    error={sidebarAdError}
                  />
              </div>
            </div>
          </aside>

          {/* Mobile sidebar */}
          <div className="lg:hidden mt-8">
            <div className="flex flex-col gap-4" data-testid="quiz-sidebar-mobile">
              {/* Peringkat */}
              <SidebarPanel
                label="ランキング / PERINGKAT"
                title={`Top ${leaderboardPeriodLabel}`}
                href="/leaderboard"
                testId="quiz-leaderboard-section-mobile"
              >
                {loadingLeaderboard ? (
                  <div className="space-y-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-7 w-7 animate-pulse rounded-full bg-jepang-border/60" />
                        <div className="flex-1 space-y-1">
                          <div className="h-3 w-3/4 animate-pulse rounded bg-jepang-border/60" />
                          <div className="h-2 w-1/2 animate-pulse rounded bg-jepang-border/60" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : leaderboard.length > 0 ? (
                  <ul>
                    {leaderboard.map((entry, idx) => (
                      <li
                        key={entry.userId}
                        className="flex items-center gap-2 border-b border-jepang-border py-2.5 last:border-b-0"
                        data-testid={`quiz-leaderboard-mobile-${idx}`}
                      >
                        <span
                          className={`w-5 shrink-0 font-mono text-xs font-black ${
                            idx === 0 ? "text-jepang-red" : "text-jepang-black"
                          }`}
                        >
                          #{entry.rank}
                        </span>
                        <LeaderboardAvatar
                          avatarUrl={entry.avatarUrl}
                          displayName={entry.displayName}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <AuthorLink
                            username={entry.username || null}
                            className="block truncate text-xs font-semibold"
                          >
                            {entry.displayName}
                          </AuthorLink>
                          <LeaderboardScore
                            period={entry.period}
                            periodPoints={entry.periodPoints}
                            totalPoints={entry.totalPoints}
                            compact
                          />
                        </div>
                        {idx === 0 ? (
                          <Award size={12} className="shrink-0 text-jepang-red" />
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-4 text-center text-xs text-jepang-muted">
                    Belum ada data peringkat.
                  </p>
                )}
              </SidebarPanel>

              {/* Kuis yang paling banyak diikuti */}
              <SidebarPanel
                label="人気 / POPULER"
                title="Kuis Terpopuler"
                testId="popular-quizzes-section-mobile"
              >
                {loadingPopular ? (
                  <div className="space-y-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-10 w-10 animate-pulse rounded bg-jepang-border/60" />
                        <div className="flex-1 space-y-1">
                          <div className="h-3 w-3/4 animate-pulse rounded bg-jepang-border/60" />
                          <div className="h-2 w-1/2 animate-pulse rounded bg-jepang-border/60" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : popularQuizzes.length > 0 ? (
                  <ul>
                    {popularQuizzes.map((quiz, idx) => (
                      <li
                        key={quiz.id}
                        className="flex items-center gap-2 border-b border-jepang-border py-2.5 last:border-b-0"
                        data-testid={`popular-quiz-mobile-${idx}`}
                      >
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-jepang-off-white">
                          {quiz.thumbnailUrl || quiz.coverImageUrl ? (
                            <CardCoverImage
                              src={resolveThumbnailUrl(quiz)}
                              alt={quiz.title}
                              sizes="40px"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-jepang-border">
                              <TrendingUp size={16} className="text-jepang-muted" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/quizzes/${quiz.slug}`}
                            className="block truncate text-xs font-semibold transition-colors hover:text-jepang-red"
                          >
                            {quiz.title}
                          </Link>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-jepang-muted">
                              {quiz.questionCount || 0} Q
                            </span>
                            <span className="text-[9px] font-mono uppercase tracking-wider text-jepang-red">
                              +{quiz.pointsReward || 10} POIN
                            </span>
                            {quiz.participantCount > 0 && (
                              <span className="text-[9px] font-mono uppercase tracking-wider text-jepang-muted">
                                • {quiz.participantCount.toLocaleString("id-ID")} peserta
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-4 text-center text-xs text-jepang-muted">
                    Belum ada data kuis populer.
                  </p>
                )}
              </SidebarPanel>

              {/* Rekomendasi tag artikel populer */}
              <SidebarPanel title="Tag Populer" testId="popular-tags-section-mobile">
                <PopularTags limit={8} title={null} compact />
              </SidebarPanel>

              {/* Iklan placeholder */}
                <SidebarAdSlot
                  data={sidebarAd}
                  loading={sidebarAdLoading}
                  error={sidebarAdError}
                  testId="home-today-sidebar-ad"
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
