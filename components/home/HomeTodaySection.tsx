"use client";

import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import ArticleCardSkeleton from "@/components/skeletons/ArticleCardSkeleton";
import LazySectionSkeleton from "@/components/home/LazySectionSkeleton";
import SidebarAdSlot from "@/components/home/SidebarAdSlot";
import TrendingArticlesPanel from "@/components/home/TrendingArticlesPanel";
import PopularTags from "@/components/PopularTags";
import { useAdSlot } from "@/hooks/useAdSlot";
import type { HomeArticle } from "@/lib/home/article-include";
import { ArrowRight } from "lucide-react";

const TODAY_ARTICLE_LIMIT = 6;

type HomeTodaySectionProps = {
  articles: HomeArticle[];
  trending: HomeArticle[];
  loading: boolean;
};

export default function HomeTodaySection({
  articles,
  trending,
  loading,
}: HomeTodaySectionProps) {
  const {
    data: sidebarAd,
    isLoading: sidebarAdLoading,
    error: sidebarAdError,
  } = useAdSlot("sidebar", { immediate: true });

  const displayArticles = [...articles]
    .sort((a, b) => {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, TODAY_ARTICLE_LIMIT);

  return (
    <section className="py-10 md:py-12 bg-jepang-off-white border-t border-jepang-border">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-4 mb-6 md:mb-8 pb-3 border-b-2 border-jepang-red">
          <div>
            <p className="small-caps text-jepang-red mb-1">今日 / Hari ini</p>
            <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tighter section-title-gradient">
              Artikel Terbaru
            </h2>
          </div>
          <Link
            href="/articles"
            className="hidden md:inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wider hover:text-jepang-red transition-colors shrink-0"
            data-testid="view-all-articles"
          >
            Lihat Semua <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <LazySectionSkeleton minHeight={720}>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(TODAY_ARTICLE_LIMIT)].map((_, idx) => (
                  <ArticleCardSkeleton key={idx} variant="grid" />
                ))}
              </div>
              <aside className="hidden lg:block">
                <div className="h-64 animate-pulse rounded-lg bg-jepang-border/60" />
              </aside>
            </div>
          </LazySectionSkeleton>
        ) : displayArticles.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 items-start lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid grid-cols-1 gap-3 items-start sm:grid-cols-2 lg:grid-cols-2">
              {displayArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  variant="grid"
                />
              ))}
            </div>

            <aside className="hidden lg:block">
              <div
                className="flex flex-col gap-6 lg:sticky lg:top-24"
                data-testid="home-today-sidebar"
              >
                <TrendingArticlesPanel
                  articles={trending.slice(0, 5)}
                  loading={loading}
                  testIdPrefix="home-today-trending"
                />

                <div
                  className="rounded-lg border-2 border-jepang-red/20 bg-white p-6 shadow-jepang"
                  aria-label="Topik populer"
                  data-testid="home-today-hot-topics"
                >
                  <PopularTags
                    limit={12}
                    title="ホット / Tag Populer"
                    variant="prominent"
                    className="w-full text-xs"
                  />
                </div>

                <SidebarAdSlot
                  data={sidebarAd}
                  loading={sidebarAdLoading}
                  error={sidebarAdError}
                  testId="home-today-sidebar-ad"
                />
              </div>
            </aside>
          </div>
        ) : (
          <p className="text-center text-jepang-muted py-12">
            Belum ada artikel. Segera periksa kembali!
          </p>
        )}
      </div>
    </section>
  );
}
