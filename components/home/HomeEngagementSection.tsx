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
import LazySectionSkeleton from "@/components/home/LazySectionSkeleton";
import ArticleCardSkeleton from "@/components/skeletons/ArticleCardSkeleton";
import LeaderboardRowSkeleton from "@/components/skeletons/LeaderboardRowSkeleton";
import { Badge } from "@/components/ui/badge";
import type {
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
    <LazySectionSkeleton minHeight={640} data-testid="home-engagement-loading">
      <section className="py-12">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
          </div>
        </div>
      </section>
      <section className="py-12 bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="bg-white border border-jepang-border">
            {[...Array(5)].map((_, idx) => (
              <LeaderboardRowSkeleton key={idx} />
            ))}
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
      <section className="py-12">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-8 pb-3 border-b border-jepang-border">
            <div>
              <p className="section-label mb-1">インタラクティブ / INTERAKTIF</p>
              <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tighter">
                Polling & Kuis
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-lg border border-jepang-border bg-white p-6 shadow-jepang">
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
        </div>
      </section>

      <section className="py-12 bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-8 pb-3 border-b border-jepang-border">
            <div>
              <p className="small-caps text-jepang-red mb-1">ランキング / PERINGKAT</p>
              <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tighter flex items-center gap-3">
                <Trophy size={32} strokeWidth={1.5} className="text-jepang-red" />
                Papan Peringkat {data.leaderboardPeriodLabel}
              </h2>
            </div>
            <Link
              href="/leaderboard"
              className="hidden md:inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wider hover:text-jepang-red transition-colors"
              data-testid="view-full-leaderboard"
            >
              SEMUA PERINGKAT <ArrowRight size={14} />
            </Link>
          </div>
          <p className="text-xs text-jepang-muted mb-3 text-center md:text-left">
            Format: poin minggu ini / total poin
          </p>
          <div className="bg-white border border-jepang-border">
            {leaderboard.length > 0 ? (
              leaderboard.map((entry, idx) => (
                <div
                  key={entry.userId}
                  className="flex items-center gap-4 px-6 py-4 border-b border-jepang-border last:border-b-0"
                  data-testid={`leaderboard-row-${idx}`}
                >
                  <span
                    className={`font-mono font-black text-2xl w-10 ${idx === 0 ? "text-jepang-red" : "text-jepang-black"}`}
                  >
                    #{entry.rank}
                  </span>
                  <LeaderboardAvatar
                    avatarUrl={entry.avatarUrl}
                    displayName={entry.displayName}
                  />
                  <div className="flex-1">
                    <AuthorLink
                      username={entry.username || null}
                      className="font-semibold block"
                    >
                      {entry.displayName}
                    </AuthorLink>
                    {entry.username ? (
                      <AuthorLink
                        username={entry.username}
                        className="text-xs text-jepang-muted font-mono block"
                      >
                        @{entry.username}
                      </AuthorLink>
                    ) : null}
                  </div>
                  <LeaderboardScore
                    period={entry.period}
                    periodPoints={entry.periodPoints}
                    totalPoints={entry.totalPoints}
                  />
                </div>
              ))
            ) : (
              <p className="text-center text-jepang-muted py-12">
                Belum ada data peringkat. Jadilah yang pertama!
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
