"use client";
export const dynamic = "force-dynamic";

import HomeHero from "@/components/home/HomeHero";
import HomeFeedSection from "@/components/home/HomeFeedSection";
import HomeTodaySection from "@/components/home/HomeTodaySection";
import CategoryEditorialSection from "@/components/home/CategoryEditorialSection";
import JepangkuTvSection from "@/components/home/JepangkuTvSection";
import AdBannerSlot from "@/components/home/AdBannerSlot";
import HomeLmsTeaser from "@/components/home/HomeLmsTeaser";
import HomeReactionsSection from "@/components/home/HomeReactionsSection";
import HomeEngagementSection from "@/components/home/HomeEngagementSection";
import LazySectionShell from "@/components/home/LazySectionShell";
import { useAdSlot } from "@/hooks/useAdSlot";
import { useLazySection } from "@/hooks/useLazySection";
import type {
  HomeCategoriesEditorialResponse,
  HomeEngagementResponse,
  HomeFeedResponse,
  HomeLmsTeaserResponse,
  HomeReactionsResponse,
  HomeTvResponse,
} from "@/lib/home/types";

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
    sentinelRef: adsSentinelRef,
    data: ads,
    isLoading: adsLoading,
    error: adsError,
  } = useAdSlot("homepage-mid");

  const {
    sentinelRef: lmsSentinelRef,
    data: lms,
    isLoading: lmsLoading,
    error: lmsError,
  } = useLazySection<HomeLmsTeaserResponse>("/api/home/lms-teaser");

  const {
    sentinelRef: reactionsSentinelRef,
    data: reactions,
    isLoading: reactionsLoading,
    error: reactionsError,
  } = useLazySection<HomeReactionsResponse>("/api/home/reactions");

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

  return (
    <div className="bg-white overflow-x-clip" data-testid="homepage">
      <LazySectionShell sectionId="feed">
        <HomeFeedSection
          featuredArticles={featuredArticles}
          trending={trending}
          featuredFallback={featuredFallback}
          loading={feedLoading}
          error={feedError}
        />
      </LazySectionShell>

      <LazySectionShell sectionId="hero">
        <HomeHero />
      </LazySectionShell>

      <LazySectionShell sectionId="today">
        <HomeTodaySection
          articles={todayArticles}
          trending={trending}
          todaySource={todaySource}
          loading={feedLoading}
        />
      </LazySectionShell>

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

      <LazySectionShell sectionId="tv" sentinelRef={tvSentinelRef}>
        <JepangkuTvSection data={tv} loading={tvLoading} error={tvError} />
      </LazySectionShell>

      <LazySectionShell sectionId="ads" sentinelRef={adsSentinelRef}>
        <AdBannerSlot data={ads} loading={adsLoading} error={adsError} />
      </LazySectionShell>

      <LazySectionShell sectionId="lms" sentinelRef={lmsSentinelRef}>
        <HomeLmsTeaser data={lms} loading={lmsLoading} error={lmsError} />
      </LazySectionShell>

      <LazySectionShell sectionId="reactions" sentinelRef={reactionsSentinelRef}>
        <HomeReactionsSection
          data={reactions}
          loading={reactionsLoading}
          error={reactionsError}
        />
      </LazySectionShell>

      <LazySectionShell
        sectionId="engagement"
        sentinelRef={engagementSentinelRef}
      >
        <HomeEngagementSection
          data={engagement}
          loading={engagementLoading}
          error={engagementError}
        />
      </LazySectionShell>
    </div>
  );
}
