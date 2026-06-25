"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import Link from "next/link";
import { MotionHoverScale } from "@/components/ui/motion";
import CardCoverImage from "@/components/CardCoverImage";
import { MessageSquare, Award, BarChart3, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SectionHeader from "@/components/SectionHeader";
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

/* ─── Poll Card ──────────────────────────────────────── */
function PollCard({ poll }: { poll: any }) {
  const totalVotes = poll.totalVotes || 0;
  const questionCount = poll.questionCount || 1;
  const thumbnailUrl = resolveThumbnailUrl(poll);

  const footer = (
    <div className="mt-auto flex items-center justify-between border-t border-jepang-border pt-3 text-xs font-mono uppercase tracking-wider">
      <span className="flex items-center gap-1 text-jepang-muted">
        <BarChart3 size={11} strokeWidth={1.5} /> {totalVotes} VOTES
        {questionCount > 1 && (
          <span className="ml-2 border border-jepang-border px-1.5 py-0.5 text-[10px]">
            {questionCount} PERTANYAAN
          </span>
        )}
      </span>
      <span className="flex items-center gap-0.5 font-bold text-jepang-red transition-all group-hover:gap-1.5">
        Ikuti <ChevronRight size={12} strokeWidth={2.5} />
      </span>
    </div>
  );

  const metaRow = (
    <div className="flex items-center justify-between gap-2">
      <Badge variant={poll.pollType === "VOTING" ? "red" : "black"}>
        {poll.pollType === "VOTING" ? "VOTING" : "POLLING"}
      </Badge>
      <span className="flex shrink-0 items-center gap-1 text-xs font-mono font-bold uppercase tracking-wider text-jepang-red">
        <Award size={11} strokeWidth={1.5} /> +{poll.pointsReward || 5} POIN
      </span>
    </div>
  );

  return (
    <Link
      href={`/polls/${poll.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg border border-jepang-border bg-white transition-colors hover:border-jepang-navy/30 hover:shadow-sm",
        interactiveBentoSpan(true),
      )}
      data-testid={`poll-card-${poll.slug}`}
    >
      <div className="relative aspect-16/10 shrink-0 overflow-hidden bg-jepang-off-white">
        <MotionHoverScale className="absolute inset-0">
          <CardCoverImage
            src={thumbnailUrl}
            alt={poll.title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </MotionHoverScale>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {metaRow}
        <h3 className="font-heading text-lg font-bold leading-tight tracking-tight group-hover:text-jepang-red transition-colors">
          {poll.title}
        </h3>
        {poll.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-jepang-muted">
            {poll.description}
          </p>
        )}
        {footer}
      </div>
    </Link>
  );
}

/* ─── Sidebar Panel ──────────────────────────────────── */
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

/* ─── Leaderboard Skeleton ───────────────────────────── */
function LeaderboardSkeleton() {
  return (
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
  );
}

/* ─── Popular Poll Skeleton ──────────────────────────── */
function PopularPollSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-10 w-10 animate-pulse rounded bg-jepang-border/60" />
          <div className="flex-1 space-y-1">
            <div className="h-3 w-3/4 animate-pulse rounded bg-jepang-border/60" />
            <div className="h-2 w-1/2 animate-pulse rounded bg-jepang-border/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Popular Poll Item ──────────────────────────────── */
function PopularPollItem({ poll, testId }: { poll: any; testId?: string }) {
  const thumbnailUrl = resolveThumbnailUrl(poll);
  const isVoting = poll.pollType === "VOTING";
  return (
    <li
      className="flex items-center gap-2 border-b border-jepang-border py-2.5 last:border-b-0"
      data-testid={testId}
    >
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-jepang-off-white">
        {thumbnailUrl ? (
          <CardCoverImage
            src={thumbnailUrl}
            alt={poll.title}
            sizes="40px"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-jepang-border">
            <BarChart3 size={16} className="text-jepang-muted" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Link
          href={`/polls/${poll.slug}`}
          className="block truncate text-xs font-semibold transition-colors hover:text-jepang-red"
        >
          {poll.title}
        </Link>
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[9px] font-mono uppercase tracking-wider font-bold ${
              isVoting ? "text-jepang-red" : "text-jepang-black"
            }`}
          >
            {isVoting ? "VOTING" : "POLLING"}
          </span>
          {poll.totalVotes > 0 && (
            <span className="text-[9px] font-mono uppercase tracking-wider text-jepang-muted">
              • {poll.totalVotes.toLocaleString("id-ID")} votes
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

/* ─── Sidebar Content ────────────────────────────────── */
function SidebarContent({
  leaderboard,
  leaderboardPeriodLabel,
  loadingLeaderboard,
  popularPolls,
  popularVotings,
  loadingPopular,
  prefix,
}: {
  leaderboard: HomeLeaderboardEntry[];
  leaderboardPeriodLabel: string;
  loadingLeaderboard: boolean;
  popularPolls: any[];
  popularVotings: any[];
  loadingPopular: boolean;
  prefix: string;
}) {
  return (
    <>
      {/* Peringkat */}
      <SidebarPanel
        label="ランキング / PERINGKAT"
        title={`Top ${leaderboardPeriodLabel}`}
        href="/leaderboard"
        testId={`${prefix}-leaderboard-section`}
      >
        {loadingLeaderboard ? (
          <LeaderboardSkeleton />
        ) : leaderboard.length > 0 ? (
          <ul>
            {leaderboard.map((entry, idx) => (
              <li
                key={entry.userId}
                className="flex items-center gap-2 border-b border-jepang-border py-2.5 last:border-b-0"
                data-testid={`${prefix}-leaderboard-${idx}`}
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

      {/* Polling Terpopuler */}
      <SidebarPanel
        label="人気 / POPULER"
        title="Polling Terpopuler"
        href="/polls"
        testId={`${prefix}-popular-polls-section`}
      >
        {loadingPopular ? (
          <PopularPollSkeleton />
        ) : popularPolls.length > 0 ? (
          <ul>
            {popularPolls.map((poll, idx) => (
              <PopularPollItem
                key={poll.id}
                poll={poll}
                testId={`${prefix}-popular-poll-${idx}`}
              />
            ))}
          </ul>
        ) : (
          <p className="py-4 text-center text-xs text-jepang-muted">
            Belum ada data polling populer.
          </p>
        )}
      </SidebarPanel>

      {/* Voting Terpopuler */}
      <SidebarPanel
        label="投票 / VOTING"
        title="Voting Terpopuler"
        href="/polls"
        testId={`${prefix}-popular-votings-section`}
      >
        {loadingPopular ? (
          <PopularPollSkeleton />
        ) : popularVotings.length > 0 ? (
          <ul>
            {popularVotings.map((poll, idx) => (
              <PopularPollItem
                key={poll.id}
                poll={poll}
                testId={`${prefix}-popular-voting-${idx}`}
              />
            ))}
          </ul>
        ) : (
          <p className="py-4 text-center text-xs text-jepang-muted">
            Belum ada data voting populer.
          </p>
        )}
      </SidebarPanel>
    </>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export default function PollListPage() {
  const [polls, setPolls] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 9;

  const [leaderboard, setLeaderboard] = useState<HomeLeaderboardEntry[]>([]);
  const [leaderboardPeriodLabel, setLeaderboardPeriodLabel] = useState("Minggu Ini");
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [popularPolls, setPopularPolls] = useState<any[]>([]);
  const [popularVotings, setPopularVotings] = useState<any[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  const {
    data: sidebarAd,
    isLoading: sidebarAdLoading,
    error: sidebarAdError,
  } = useAdSlot("article-sidebar", { immediate: true });

  useEffect(() => {
    loadPolls(1, true);
    loadLeaderboard();
    loadPopularPolls();
  }, []);

  const loadPolls = async (pageNum: number, reset = false) => {
    reset ? setLoading(true) : setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        status: "ACTIVE",
        limit: String(PER_PAGE),
        page: String(pageNum),
      });
      const data = await fetch(`/api/polls?${params}`).then((r) => parseApiResponse(r));
      const incoming: any[] = Array.isArray(data.polls) ? data.polls : [];

      if (reset) {
        setPolls(incoming);
      } else {
        setPolls((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          return [...prev, ...incoming.filter((p) => !ids.has(p.id))];
        });
      }
      setTotal(Number(data.total || 0));
      setPage(pageNum);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const params = new URLSearchParams({ period: "weekly", limit: "5" });
      const data = await fetch(`/api/leaderboard?${params}`).then((r) => parseApiResponse(r));
      setLeaderboard(Array.isArray(data.items) ? data.items : []);
      setLeaderboardPeriodLabel(data.periodLabel || "Minggu Ini");
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const loadPopularPolls = async () => {
    setLoadingPopular(true);
    try {
      // Ambil lebih banyak lalu sort by totalVotes di client
      const params = new URLSearchParams({ status: "ACTIVE", limit: "50", page: "1" });
      const data = await fetch(`/api/polls?${params}`).then((r) => parseApiResponse(r));
      const all: any[] = Array.isArray(data.polls) ? data.polls : [];
      const sorted = [...all].sort((a, b) => (b.totalVotes || 0) - (a.totalVotes || 0));

      setPopularPolls(
        sorted.filter((p) => p.pollType !== "VOTING").slice(0, 2),
      );
      setPopularVotings(
        sorted.filter((p) => p.pollType === "VOTING").slice(0, 2),
      );
    } finally {
      setLoadingPopular(false);
    }
  };

  const hasMore = polls.length < total;

  const sidebarProps = {
    leaderboard,
    leaderboardPeriodLabel,
    loadingLeaderboard,
    popularPolls,
    popularVotings,
    loadingPopular,
  };

  return (
    <div className="bg-white min-h-screen" data-testid="poll-list-page">
      <SectionHeader
        label="投票 / POLLING"
        title="Polling dan Voting"
        subtitle="Suarakan pendapatmu dan ikuti aktivitas voting komunitas Jepangku!"
      />

      <div className="px-4 mx-auto max-w-7xl py-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
          {/* ─── Main content ─── */}
          <main className="min-w-0">
            {loading ? (
              <InteractiveBentoSkeleton count={PER_PAGE} />
            ) : polls.length > 0 ? (
              <>
                <InteractiveBentoGrid>
                  {polls.map((poll: any) => (
                    <PollCard key={poll.id} poll={poll} />
                  ))}
                  {loadingMore && <InteractiveBentoLoadMoreSkeleton count={3} />}
                </InteractiveBentoGrid>

                {hasMore && (
                  <div className="mt-10 flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => loadPolls(page + 1)}
                      disabled={loadingMore}
                      data-testid="load-more"
                    >
                      {loadingMore ? "Memuat..." : "Muat Lebih Banyak"}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-24 text-center" data-testid="no-polls">
                <MessageSquare
                  size={48}
                  strokeWidth={1.5}
                  className="mx-auto mb-4 text-jepang-muted"
                />
                <p className="mb-2 font-heading text-2xl font-bold">
                  Tidak ada polling aktif
                </p>
                <p className="text-jepang-muted">
                  Coba lagi nanti untuk polling baru!
                </p>
              </div>
            )}
          </main>

          {/* ─── Desktop sidebar ─── */}
          <aside className="hidden h-full lg:block">
            <div className="sticky top-24">
              <div className="flex flex-col gap-4" data-testid="poll-sidebar">
                <SidebarContent {...sidebarProps} prefix="poll" />

                <SidebarPanel title="Tag Populer" testId="poll-tags-section">
                  <PopularTags limit={12} title={null} compact />
                </SidebarPanel>

                <SidebarAdSlot
                  data={sidebarAd}
                  loading={sidebarAdLoading}
                  error={sidebarAdError}
                />
              </div>
            </div>
          </aside>
        </div>

        {/* ─── Mobile sidebar ─── */}
        <div className="lg:hidden mt-8">
          <div className="flex flex-col gap-4" data-testid="poll-sidebar-mobile">
            <SidebarContent {...sidebarProps} prefix="poll-mobile" />

            <SidebarPanel title="Tag Populer" testId="poll-tags-section-mobile">
              <PopularTags limit={8} title={null} compact />
            </SidebarPanel>

            <SidebarAdSlot
              data={sidebarAd}
              loading={sidebarAdLoading}
              error={sidebarAdError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
