"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import ArticleCardSkeleton from "@/components/skeletons/ArticleCardSkeleton";
import TrendingArticleSkeleton from "@/components/skeletons/TrendingArticleSkeleton";
import LazySectionSkeleton from "@/components/home/LazySectionSkeleton";
import type { HomeArticle } from "@/lib/home/article-include";
import { ArrowRight, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type HomeFeedSectionProps = {
  featuredArticles: HomeArticle[];
  trending: HomeArticle[];
  featuredFallback: HomeArticle | null;
  loading: boolean;
  error: Error | null;
};

export default function HomeFeedSection({
  featuredArticles,
  trending,
  featuredFallback,
  loading,
  error,
}: HomeFeedSectionProps) {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const slideCount = featuredArticles.length;

  const goPrevFeatured = () => {
    setFeaturedIndex((prev) => (prev === 0 ? slideCount - 1 : prev - 1));
  };

  const goNextFeatured = () => {
    setFeaturedIndex((prev) => (prev === slideCount - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    setFeaturedIndex(0);
  }, [slideCount]);

  useEffect(() => {
    if (slideCount <= 1) return;

    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev === slideCount - 1 ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [slideCount]);

  return (
    <section
      className="pt-10 pb-8 md:pt-12 md:pb-10 bg-white"
      aria-labelledby="home-feed-heading"
    >
      <div className="px-4 mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-4 mb-6 md:mb-8 pb-3 border-b-2 border-jepang-red">
          <div>
            <p className="small-caps text-jepang-red mb-1">特集 / UNGGULAN</p>
            <h2
              id="home-feed-heading"
              className="font-heading font-black text-3xl md:text-4xl tracking-tighter section-title-gradient"
            >
              Berita Pilihan & Trending
            </h2>
          </div>
          <Link
            href="/trending"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wider hover:text-jepang-red transition-colors shrink-0"
            data-testid="view-all-trending-header"
          >
            Lihat Trending <ArrowRight size={14} />
          </Link>
        </div>

        {error ? (
          <p className="text-center text-sm text-jepang-red py-8">
            Gagal memuat berita utama. Muat ulang halaman.
          </p>
        ) : loading ? (
          <LazySectionSkeleton minHeight={440} data-testid="homepage-loading">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-stretch">
              <ArticleCardSkeleton variant="featured" />
              <div className="rounded-lg border border-jepang-border bg-white p-5 shadow-jepang">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-jepang-border">
                  <TrendingUp
                    size={18}
                    strokeWidth={1.5}
                    className="text-jepang-red"
                  />
                  <h3 className="small-caps">Sedang Tren</h3>
                </div>
                <div className="space-y-0">
                  {[...Array(5)].map((_, idx) => (
                    <TrendingArticleSkeleton key={idx} />
                  ))}
                </div>
              </div>
            </div>
          </LazySectionSkeleton>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-stretch">
            <div className="min-w-0 flex flex-col">
              {slideCount > 0 ? (
                <div className="relative flex-1 overflow-hidden rounded-lg border border-jepang-border shadow-jepang">
                  <div
                    className="flex h-full transition-transform duration-700 ease-in-out"
                    style={{
                      transform: `translateX(-${featuredIndex * 100}%)`,
                    }}
                  >
                    {featuredArticles.map((article, idx) => (
                      <div key={article.id} className="w-full shrink-0">
                        <ArticleCard
                          article={article}
                          variant="featured"
                          priority={idx === 0}
                        />
                      </div>
                    ))}
                  </div>

                  {slideCount > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={goPrevFeatured}
                        className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-jepang-border bg-white/90 text-jepang-navy shadow-sm backdrop-blur-sm transition-colors hover:bg-jepang-navy hover:text-white cursor-pointer"
                        aria-label="Artikel sebelumnya"
                      >
                        <ChevronLeft size={20} strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        onClick={goNextFeatured}
                        className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-jepang-border bg-white/90 text-jepang-navy shadow-sm backdrop-blur-sm transition-colors hover:bg-jepang-navy hover:text-white cursor-pointer"
                        aria-label="Artikel berikutnya"
                      >
                        <ChevronRight size={20} strokeWidth={1.5} />
                      </button>
                      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
                        {featuredArticles.map((article, idx) => (
                          <button
                            key={article.id}
                            type="button"
                            onClick={() => setFeaturedIndex(idx)}
                            className={cn(
                              "h-2 rounded-full transition-all",
                              idx === featuredIndex
                                ? "w-6 bg-jepang-red"
                                : "w-2 bg-white/60 hover:bg-white",
                            )}
                            aria-label={`Slide ${idx + 1}`}
                            aria-current={idx === featuredIndex}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : featuredFallback ? (
                <div className="flex-1 overflow-hidden rounded-lg border border-jepang-border shadow-jepang">
                  <ArticleCard
                    article={featuredFallback}
                    variant="featured"
                    priority
                  />
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-jepang-border bg-jepang-off-white p-10 text-center text-sm text-jepang-muted min-h-[280px] lg:min-h-[460px]">
                  Tidak ada artikel pilihan utama tersedia.
                </div>
              )}
            </div>

            <aside className="flex flex-col rounded-lg border border-jepang-border bg-white p-5 shadow-jepang lg:min-h-[460px]">
              <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-jepang-border">
                <div className="flex items-center gap-2">
                  <TrendingUp
                    size={18}
                    strokeWidth={1.5}
                    className="text-jepang-red shrink-0"
                  />
                  <h3 className="small-caps">トレンド / Sedang Tren</h3>
                </div>
                <Link
                  href="/trending"
                  className="sm:hidden text-[10px] font-mono uppercase tracking-wider text-jepang-muted hover:text-jepang-red transition-colors"
                  data-testid="view-all-trending"
                >
                  Semua →
                </Link>
              </div>

              <div className="flex-1 space-y-0">
                {trending.slice(0, 5).map((article, idx) => {
                  const thumbnailUrl = article.coverImageUrl;

                  return (
                    <div
                      key={article.id}
                      className="flex items-center gap-3 py-3 border-b border-jepang-border last:border-b-0"
                    >
                      <span className="font-mono font-black text-xl md:text-2xl text-jepang-red w-8 shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <Link
                        href={`/articles/${article.slug}`}
                        className="relative shrink-0 overflow-hidden rounded-sm bg-jepang-off-white w-[72px] h-14 md:w-20 md:h-16"
                        data-testid={`trending-thumbnail-${article.slug}`}
                      >
                        {thumbnailUrl ? (
                          <Image
                            src={thumbnailUrl}
                            alt={article.title}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-jepang-muted uppercase tracking-wider">
                            —
                          </div>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/articles/${article.slug}`}
                          className="font-heading font-bold text-sm leading-snug hover:text-jepang-red transition-colors line-clamp-2"
                          data-testid={`trending-${article.slug}`}
                        >
                          {article.title}
                        </Link>
                        <p className="text-[10px] text-jepang-muted font-mono uppercase tracking-wider mt-1">
                          {article.weeklyViewCount || 0} views / minggu
                        </p>
                      </div>
                    </div>
                  );
                })}
                {trending.length === 0 && (
                  <p className="text-sm text-jepang-muted text-center py-8">
                    Belum ada artikel tren
                  </p>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
