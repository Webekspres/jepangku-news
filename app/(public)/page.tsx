"use client";
export const dynamic = "force-dynamic";

import LeaderboardRowSkeleton from "@/components/skeletons/LeaderboardRowSkeleton";
import ArticleCardSkeleton from "@/components/skeletons/ArticleCardSkeleton";
import AuthorLink from "@/components/AuthorLink";
import LeaderboardAvatar from "@/components/leaderboard/LeaderboardAvatar";
import HomeHero from "@/components/home/HomeHero";
import HomeFeedSection from "@/components/home/HomeFeedSection";
import HomeTodaySection from "@/components/home/HomeTodaySection";
import CategoryEditorialSection from "@/components/home/CategoryEditorialSection";
import JepangkuTvSection from "@/components/home/JepangkuTvSection";
import HomePlaceholderSection from "@/components/home/HomePlaceholderSection";
import LazySectionShell from "@/components/home/LazySectionShell";
import LazySectionSkeleton from "@/components/home/LazySectionSkeleton";
import { useLazySection } from "@/hooks/useLazySection";
import type {
  HomeCategoriesEditorialResponse,
  HomeEngagementResponse,
  HomeFeedResponse,
  HomeTvResponse,
} from "@/lib/home/types";
import {
  ArrowRight,
  Trophy,
  Zap,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const {
    data: feed,
    isLoading: feedLoading,
    error: feedError,
  } = useLazySection<HomeFeedResponse>("/api/home/feed", { immediate: true });

  const {
    sentinelRef: editorialSentinelRef,
    data: editorial,
    isLoading: editorialLoading,
    error: editorialError,
  } = useLazySection<HomeCategoriesEditorialResponse>(
    "/api/home/categories-editorial",
  );

  const {
    sentinelRef: tvSentinelRef,
    data: tv,
    isLoading: tvLoading,
    error: tvError,
  } = useLazySection<HomeTvResponse>("/api/home/tv");

  const {
    sentinelRef: engagementSentinelRef,
    data: engagement,
    isLoading: engagementLoading,
    error: engagementError,
  } = useLazySection<HomeEngagementResponse>("/api/home/engagement");

  const featuredArticles = feed?.featuredArticles ?? [];
  const trending = feed?.trending ?? [];
  const todayArticles = feed?.todayArticles ?? [];
  const todaySource = feed?.todaySource ?? "today";
  const featuredFallback = feed?.featuredFallback ?? null;

  const polls = engagement?.polls ?? [];
  const quizzes = engagement?.quizzes ?? [];
  const leaderboard = engagement?.leaderboard ?? [];

  return (
    <div className="bg-white" data-testid="homepage">
      {/* §1 Featured + Trending — Wave 1 */}
      <LazySectionShell sectionId="feed">
        <HomeFeedSection
          featuredArticles={featuredArticles}
          trending={trending}
          featuredFallback={featuredFallback}
          loading={feedLoading}
          error={feedError}
        />
      </LazySectionShell>

      {/* §2 Hero Ekosistem — static, no API */}
      <LazySectionShell sectionId="hero">
        <HomeHero />
      </LazySectionShell>

      {/* §3 Artikel Hari Ini — Wave 1 (same feed payload) */}
      <LazySectionShell sectionId="today">
        <HomeTodaySection
          articles={todayArticles}
          todaySource={todaySource}
          loading={feedLoading}
        />
      </LazySectionShell>

      {/* §4 Kategori editorial — Wave 2 lazy */}
      <LazySectionShell
        sectionId="categories-editorial"
        sentinelRef={editorialSentinelRef}
      >
        <CategoryEditorialSection
          data={editorial}
          loading={editorialLoading}
          error={editorialError}
        />
      </LazySectionShell>

      {/* §5 Jepangku TV — Wave 3 lazy */}
      <LazySectionShell sectionId="tv" sentinelRef={tvSentinelRef}>
        <JepangkuTvSection data={tv} loading={tvLoading} error={tvError} />
      </LazySectionShell>

      {/* §6–§8 placeholders */}
      <LazySectionShell sectionId="ads">
        <HomePlaceholderSection sectionId="ads" />
      </LazySectionShell>

      <LazySectionShell sectionId="lms">
        <HomePlaceholderSection sectionId="lms" />
      </LazySectionShell>

      <LazySectionShell sectionId="reactions">
        <HomePlaceholderSection sectionId="reactions" />
      </LazySectionShell>

      {/* §9–10 Polling, Kuis & Leaderboard — Wave 4 lazy */}
      <LazySectionShell
        sectionId="engagement"
        sentinelRef={engagementSentinelRef}
      >
        {engagementError ? (
          <p className="text-center text-sm text-jepang-muted py-12">
            Gagal memuat polling dan peringkat.
          </p>
        ) : engagementLoading || !engagement ? (
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
        ) : (
          <>
            <section className="py-12">
              <div className="px-4 mx-auto max-w-7xl">
                <div className="flex items-end justify-between mb-8 pb-3 border-b border-jepang-border">
                  <div>
                    <p className="section-label mb-1">
                      インタラクティブ / INTERAKTIF
                    </p>
                    <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tighter">
                      Polling & Kuis
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-lg border border-jepang-border bg-white p-6 shadow-jepang">
                    <div className="flex items-start gap-3 mb-4 pb-3 border-b border-jepang-border">
                      <MessageSquare
                        size={18}
                        strokeWidth={1.5}
                        className="mt-0.5 shrink-0 text-jepang-red"
                      />
                      <div className="min-w-0">
                        <p className="section-label mb-1">Polling</p>
                        {polls.length > 0 ? (
                          <h3 className="font-heading font-bold text-xl tracking-tight line-clamp-2">
                            {polls[0].title}
                          </h3>
                        ) : (
                          <h3 className="font-heading font-bold text-xl tracking-tight">
                            Poll Aktif
                          </h3>
                        )}
                      </div>
                    </div>
                    {polls.length > 0 ? (
                      <div>
                        <span className="jepang-badge mb-3">
                          {polls[0].pollType?.replace(/_/g, " ")}
                        </span>
                        <p className="text-sm text-jepang-muted mb-4">
                          {polls[0].questionCount || 0} pertanyaan ·{" "}
                          {polls[0].totalVotes || 0} suara
                        </p>
                        <Link
                          href={`/polls/${polls[0].slug}`}
                          className="jepang-btn-primary inline-block"
                          data-testid="homepage-poll-cta"
                        >
                          Pilih Sekarang
                        </Link>
                      </div>
                    ) : (
                      <p className="text-sm text-jepang-muted py-8 text-center">
                        Tidak ada jajak pendapat aktif. Segera periksa kembali!
                      </p>
                    )}
                  </div>

                  <div className="rounded-lg bg-jepang-navy p-6 text-white shadow-jepang">
                    <div className="flex items-start gap-3 mb-4 pb-3 border-b border-white/10">
                      <Zap
                        size={18}
                        strokeWidth={1.5}
                        className="mt-0.5 shrink-0 text-jepang-red"
                      />
                      <div className="min-w-0">
                        <p className="section-label mb-1">Kuis</p>
                        {quizzes.length > 0 ? (
                          <h3 className="font-heading font-bold text-xl tracking-tight line-clamp-2">
                            {quizzes[0].title}
                          </h3>
                        ) : (
                          <h3 className="font-heading font-bold text-xl tracking-tight">
                            Uji Pengetahuanmu
                          </h3>
                        )}
                      </div>
                    </div>
                    {quizzes.length > 0 ? (
                      <div>
                        <span className="jepang-badge-red mb-3">Kuis</span>
                        <p className="text-sm text-zinc-400 mb-4">
                          {quizzes[0].questionCount || 0} pertanyaan · +10 poin
                        </p>
                        <Link
                          href={`/quizzes/${quizzes[0].slug}`}
                          className="jepang-btn-primary inline-block"
                          data-testid="homepage-quiz-cta"
                        >
                          Mulai Kuis
                        </Link>
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400 py-8 text-center">
                        Belum ada kuis yang tersedia.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="py-12 bg-jepang-off-white">
              <div className="px-4 mx-auto max-w-7xl">
                <div className="flex items-end justify-between mb-8 pb-3 border-b border-jepang-border">
                  <div>
                    <p className="small-caps text-jepang-red mb-1">
                      ランキング / PERINGKAT
                    </p>
                    <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tighter flex items-center gap-3">
                      <Trophy
                        size={32}
                        strokeWidth={1.5}
                        className="text-jepang-red"
                      />
                      Papan Peringkat Mingguan
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
                <div className="bg-white border border-jepang-border">
                  {leaderboard.length > 0 ? (
                    leaderboard.slice(0, 5).map((entry, idx) => (
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
                        <div className="text-right">
                          <p className="font-mono font-black text-xl text-jepang-red">
                            {entry.totalXp}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-jepang-muted">
                            POIN
                          </p>
                        </div>
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
          </>
        )}
      </LazySectionShell>
    </div>
  );
}
