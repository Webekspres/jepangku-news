"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ChevronRight,
  MessageSquare,
  Trophy,
  Zap,
} from "lucide-react";
import AuthorLink from "@/components/AuthorLink";
import LeaderboardAvatar from "@/components/leaderboard/LeaderboardAvatar";
import LeaderboardScore from "@/components/leaderboard/LeaderboardScore";
import SidebarAdSlot from "@/components/home/SidebarAdSlot";
import LazySectionSkeleton from "@/components/home/LazySectionSkeleton";
import { Badge } from "@/components/ui/badge";
import { useLazySection } from "@/hooks/useLazySection";
import type {
  HomeAdResponse,
  HomeEngagementResponse,
  HomePollSummary,
  HomeQuizSummary,
} from "@/lib/home/types";

type HomeEngagementSectionProps = {
  data: HomeEngagementResponse | null;
  loading: boolean;
  error: Error | null;
};

const HOME_POLL_LIMIT = 3;
const HOME_QUIZ_LIMIT = 3;
const LEADERBOARD_LIMIT = 5;

function EngagementSkeleton() {
  return (
    <LazySectionSkeleton minHeight={720} data-testid="home-engagement-loading">
      <section className="py-12 bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div className="space-y-6 lg:col-span-3">
              <div className="h-48 animate-pulse rounded-lg bg-jepang-border/60" />
              <div className="h-48 animate-pulse rounded-lg bg-jepang-border/60" />
            </div>
            <div className="space-y-4 lg:col-span-1">
              <div className="h-64 animate-pulse rounded-lg bg-jepang-border/60" />
              <div className="h-40 animate-pulse rounded-lg bg-jepang-border/60" />
            </div>
          </div>
        </div>
      </section>
    </LazySectionSkeleton>
  );
}

function PollListItem({
  poll,
  isPrimary,
}: {
  poll: HomePollSummary;
  isPrimary?: boolean;
}) {
  return (
    <Link
      href={`/polls/${poll.slug}`}
      className="group flex items-start gap-3 border-b border-jepang-border px-1 py-4 last:border-b-0 transition-colors hover:bg-jepang-off-white/80"
      data-testid={isPrimary ? "homepage-poll-cta" : `homepage-poll-item-${poll.slug}`}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant={poll.pollType === "VOTING" ? "red" : "black"}>
            {poll.pollType === "VOTING" ? "VOTING" : "POLLING"}
          </Badge>
          <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-jepang-muted">
            <BarChart3 size={11} strokeWidth={1.5} />
            {poll.totalVotes} suara
          </span>
        </div>
        <h3 className="font-heading text-base font-bold leading-snug tracking-tight line-clamp-2 group-hover:text-jepang-red transition-colors">
          {poll.title}
        </h3>
        <p className="mt-1 text-xs text-jepang-muted">
          {poll.questionCount} pertanyaan
        </p>
      </div>
      <ChevronRight
        size={18}
        className="mt-1 shrink-0 text-jepang-muted transition-transform group-hover:translate-x-0.5 group-hover:text-jepang-red"
      />
    </Link>
  );
}

function QuizListItem({
  quiz,
  isPrimary,
}: {
  quiz: HomeQuizSummary;
  isPrimary?: boolean;
}) {
  return (
    <Link
      href={`/quizzes/${quiz.slug}`}
      className="group flex items-start gap-3 border-b border-white/10 px-1 py-4 last:border-b-0 transition-colors hover:bg-white/5"
      data-testid={isPrimary ? "homepage-quiz-cta" : `homepage-quiz-item-${quiz.slug}`}
    >
      <div className="min-w-0 flex-1">
        <Badge variant="red" className="mb-2 w-fit">
          Kuis
        </Badge>
        <h3 className="font-heading text-base font-bold leading-snug tracking-tight line-clamp-2 group-hover:text-jepang-orange transition-colors">
          {quiz.title}
        </h3>
        <p className="mt-1 text-xs text-zinc-400">
          {quiz.questionCount} pertanyaan · +10 poin
        </p>
      </div>
      <ChevronRight
        size={18}
        className="mt-1 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-jepang-orange"
      />
    </Link>
  );
}

export default function HomeEngagementSection({
  data,
  loading,
  error,
}: HomeEngagementSectionProps) {
  const {
    data: sidebarAd,
    isLoading: sidebarAdLoading,
    error: sidebarAdError,
  } = useLazySection<HomeAdResponse>("/api/home/ads?slot=homepage-sidebar", {
    immediate: true,
  });

  if (error) {
    return (
      <p className="text-center text-sm text-jepang-muted py-12">
        Gagal memuat polling dan peringkat.
      </p>
    );
  }

  if (loading || !data) {
    return <EngagementSkeleton />;
  }

  const polls = data.polls.slice(0, HOME_POLL_LIMIT);
  const quizzes = data.quizzes.slice(0, HOME_QUIZ_LIMIT);
  const leaderboard = data.leaderboard.slice(0, LEADERBOARD_LIMIT);

  return (
    <div data-testid="home-engagement-section">
      <section className="py-12 bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-8 pb-3 border-b-2 border-jepang-red">
            <div>
              <p className="section-label mb-1">インタラクティブ / INTERAKTIF</p>
              <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tighter section-title-gradient">
                Polling, Kuis & Peringkat
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div className="flex flex-col gap-6 lg:col-span-3">
              <div className="rounded-lg border border-jepang-border bg-white p-6">
                <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-jepang-border">
                  <div className="flex items-start gap-3 min-w-0">
                    <MessageSquare
                      size={18}
                      strokeWidth={1.5}
                      className="mt-0.5 shrink-0 text-jepang-red"
                    />
                    <div>
                      <p className="section-label mb-1">Polling</p>
                      <h3 className="font-heading font-bold text-xl tracking-tight">
                        Poll Aktif
                      </h3>
                    </div>
                  </div>
                  <Link
                    href="/polls"
                    className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-jepang-muted hover:text-jepang-red transition-colors shrink-0"
                  >
                    Semua <ArrowRight size={12} />
                  </Link>
                </div>

                {polls.length > 0 ? (
                  <div>
                    {polls.map((poll, index) => (
                      <PollListItem key={poll.id} poll={poll} isPrimary={index === 0} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-jepang-muted py-8 text-center">
                    Tidak ada jajak pendapat aktif. Segera periksa kembali!
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-jepang-border sm:hidden">
                  <Link href="/polls" className="jepang-btn-primary inline-flex items-center gap-2">
                    Semua Polling <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              <div className="rounded-lg bg-jepang-navy p-6 text-white shadow-jepang">
                <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                  <div className="flex items-start gap-3 min-w-0">
                    <Zap
                      size={18}
                      strokeWidth={1.5}
                      className="mt-0.5 shrink-0 text-jepang-red"
                    />
                    <div>
                      <p className="section-label mb-1">Kuis</p>
                      <h3 className="font-heading font-bold text-xl tracking-tight">
                        Uji Pengetahuanmu
                      </h3>
                    </div>
                  </div>
                  <Link
                    href="/quizzes"
                    className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors shrink-0"
                  >
                    Semua <ArrowRight size={12} />
                  </Link>
                </div>

                {quizzes.length > 0 ? (
                  <div>
                    {quizzes.map((quiz, index) => (
                      <QuizListItem key={quiz.id} quiz={quiz} isPrimary={index === 0} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400 py-8 text-center">
                    Belum ada kuis yang tersedia.
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-white/10 sm:hidden">
                  <Link
                    href="/quizzes"
                    className="jepang-btn-primary inline-flex items-center gap-2"
                  >
                    Semua Kuis <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            <aside className="lg:col-span-1">
              <div className="flex flex-col gap-6 lg:sticky lg:top-24">
                <div
                  className="rounded-lg border border-jepang-border bg-white shadow-jepang"
                  data-testid="home-leaderboard-sidebar"
                >
                <div className="flex items-center justify-between gap-2 border-b border-jepang-border px-4 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Trophy size={16} strokeWidth={1.5} className="shrink-0 text-jepang-red" />
                    <h3 className="font-heading text-sm font-bold tracking-tight truncate">
                      Peringkat {data.leaderboardPeriodLabel}
                    </h3>
                  </div>
                  <Link
                    href="/leaderboard"
                    className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-jepang-muted hover:text-jepang-red transition-colors"
                    data-testid="view-full-leaderboard"
                  >
                    Semua
                  </Link>
                </div>

                {leaderboard.length > 0 ? (
                  <ul>
                    {leaderboard.map((entry, idx) => (
                      <li
                        key={entry.userId}
                        className="flex items-center gap-2 border-b border-jepang-border px-3 py-3 last:border-b-0"
                        data-testid={`leaderboard-row-${idx}`}
                      >
                        <span
                          className={`font-mono font-black text-sm w-6 shrink-0 ${
                            idx === 0 ? "text-jepang-red" : "text-jepang-black"
                          }`}
                        >
                          #{entry.rank}
                        </span>
                        <LeaderboardAvatar
                          avatarUrl={entry.avatarUrl}
                          displayName={entry.displayName}
                        />
                        <div className="min-w-0 flex-1">
                          <AuthorLink
                            username={entry.username || null}
                            className="block truncate text-sm font-semibold"
                          >
                            {entry.displayName}
                          </AuthorLink>
                        </div>
                        <LeaderboardScore
                          period={entry.period}
                          periodPoints={entry.periodPoints}
                          totalPoints={entry.totalPoints}
                          compact
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-sm text-jepang-muted py-8 px-3">
                    Belum ada data peringkat.
                  </p>
                )}
                </div>

                <SidebarAdSlot
                  data={sidebarAd}
                  loading={sidebarAdLoading}
                  error={sidebarAdError}
                  testId="homepage-sidebar-ad"
                />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
