"use client";

import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import ArticleCardSkeleton from "@/components/skeletons/ArticleCardSkeleton";
import LazySectionSkeleton from "@/components/home/LazySectionSkeleton";
import SidebarAdSlot from "@/components/home/SidebarAdSlot";
import PopularTags from "@/components/PopularTags";
import { useLazySection } from "@/hooks/useLazySection";
import type { HomeArticle } from "@/lib/home/article-include";
import type { HomeAdResponse } from "@/lib/home/types";
import { ArrowRight } from "lucide-react";

const TODAY_ARTICLE_LIMIT = 6;

type HomeTodaySectionProps = {
  articles: HomeArticle[];
  todaySource: "today" | "fallback";
  loading: boolean;
};

export default function HomeTodaySection({
  articles,
  todaySource,
  loading,
}: HomeTodaySectionProps) {
  const {
    data: sidebarAd,
    isLoading: sidebarAdLoading,
    error: sidebarAdError,
  } = useLazySection<HomeAdResponse>("/api/home/ads?slot=homepage-sidebar", {
    immediate: true,
  });

  const displayArticles = articles.slice(0, TODAY_ARTICLE_LIMIT);

  return (
    <section className="py-10 md:py-12 bg-jepang-off-white border-t border-jepang-border">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-4 mb-6 md:mb-8 pb-3 border-b-2 border-jepang-red">
          <div>
            <p className="small-caps text-jepang-red mb-1">今日 / HARI INI</p>
            <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tighter section-title-gradient">
              Artikel Hari Ini
            </h2>
            {!loading && todaySource === "fallback" ? (
              <p className="mt-2 text-sm text-jepang-muted">
                Belum cukup artikel hari ini — menampilkan yang terbaru.
              </p>
            ) : null}
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
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 lg:col-span-2">
                {[...Array(TODAY_ARTICLE_LIMIT)].map((_, idx) => (
                  <ArticleCardSkeleton key={idx} />
                ))}
              </div>
              <aside className="hidden lg:block lg:col-span-1">
                <div className="h-64 animate-pulse rounded-lg bg-jepang-border/60" />
              </aside>
            </div>
          </LazySectionSkeleton>
        ) : displayArticles.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 lg:col-span-2">
              {displayArticles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  priority={index === 0}
                />
              ))}
            </div>

            <aside className="lg:col-span-1">
              <div
                className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start"
                data-testid="home-today-sidebar"
              >
                <div
                  className="rounded-lg border border-jepang-border bg-white p-5 shadow-jepang"
                  aria-label="Topik populer"
                  data-testid="home-today-hot-topics"
                >
                  <PopularTags
                    limit={12}
                    title="ホット / HOT TOPIC"
                    className="w-full"
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
