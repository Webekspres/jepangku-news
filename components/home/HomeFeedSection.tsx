"use client";

import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import ArticleCard from "@/components/ArticleCard";
import ArticleCardSkeleton from "@/components/skeletons/ArticleCardSkeleton";
import TrendingArticlesPanel from "@/components/home/TrendingArticlesPanel";
import TrendingArticleSkeleton from "@/components/skeletons/TrendingArticleSkeleton";
import LazySectionSkeleton from "@/components/home/LazySectionSkeleton";
import type { HomeArticle } from "@/lib/home/article-include";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type HomeFeedSectionProps = {
  featuredArticles: HomeArticle[];
  trending: HomeArticle[];
  featuredFallback: HomeArticle | null;
  loading: boolean;
  error: Error | null;
};

const DRAG_THRESHOLD_PX = 48;

export default function HomeFeedSection({
  featuredArticles,
  trending,
  featuredFallback,
  loading,
  error,
}: HomeFeedSectionProps) {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef({ startX: 0, active: false, dragged: false });
  const slideCount = featuredArticles.length;

  const goPrevFeatured = () => {
    setFeaturedIndex((prev) => (prev === 0 ? slideCount - 1 : prev - 1));
  };

  const goNextFeatured = () => {
    setFeaturedIndex((prev) => (prev === slideCount - 1 ? 0 : prev + 1));
  };

  const finishDrag = (clientX: number) => {
    if (!dragStateRef.current.active) return;

    const { startX, dragged } = dragStateRef.current;
    const delta = clientX - startX;

    if (delta < -DRAG_THRESHOLD_PX) goNextFeatured();
    else if (delta > DRAG_THRESHOLD_PX) goPrevFeatured();

    dragStateRef.current = { startX: 0, active: false, dragged };
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleCarouselPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (slideCount <= 1) return;

    dragStateRef.current = {
      startX: event.clientX,
      active: true,
      dragged: false,
    };
    setIsDragging(true);
  };

  const handleCarouselPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active) return;

    const delta = event.clientX - dragStateRef.current.startX;
    if (Math.abs(delta) > 5 && !dragStateRef.current.dragged) {
      dragStateRef.current.dragged = true;
      // Capture the pointer only once a real drag begins, otherwise a plain
      // tap stays retargeted to the card link so navigation keeps working.
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setDragOffset(delta);
  };

  const handleCarouselPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    finishDrag(event.clientX);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleCarouselClickCapture = (event: MouseEvent) => {
    if (!dragStateRef.current.dragged) return;

    event.preventDefault();
    event.stopPropagation();
    dragStateRef.current.dragged = false;
  };

  useEffect(() => {
    setFeaturedIndex(0);
  }, [slideCount]);

  useEffect(() => {
    if (slideCount <= 1 || isDragging) return;

    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev === slideCount - 1 ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [slideCount, isDragging]);

  return (
    <section
      className="pt-10 pb-8 md:pt-12 md:pb-10 bg-white"
      aria-labelledby="home-feed-heading"
    >
      <div className="px-4 mx-auto max-w-7xl">
        {error ? (
          <p className="text-center text-sm text-jepang-red py-8">
            Gagal memuat berita utama. Muat ulang halaman.
          </p>
        ) : loading ? (
          <LazySectionSkeleton minHeight={440} data-testid="homepage-loading">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-stretch">
              <ArticleCardSkeleton variant="featured" />
              <div className="rounded-lg border border-jepang-border bg-white p-5 lg:min-h-[460px]">
                <div className="mb-4 h-6 w-40 animate-pulse rounded bg-jepang-border" />
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
                <div className="flex flex-col">
                  <div
                    className="relative flex-1 overflow-hidden rounded-lg border border-jepang-border shadow-jepang touch-pan-y"
                    onClickCapture={handleCarouselClickCapture}
                  >
                    <motion.div
                      className={cn(
                        "flex h-full select-none",
                        slideCount > 1 &&
                          (isDragging ? "cursor-grabbing" : "cursor-grab"),
                      )}
                      style={{ touchAction: "pan-y pinch-zoom" }}
                      onPointerDown={handleCarouselPointerDown}
                      onPointerMove={handleCarouselPointerMove}
                      onPointerUp={handleCarouselPointerUp}
                      onPointerCancel={handleCarouselPointerUp}
                      animate={{
                        x: isDragging
                          ? `calc(-${featuredIndex * 100}% + ${dragOffset}px)`
                          : `-${featuredIndex * 100}%`,
                      }}
                      transition={
                        isDragging
                          ? { duration: 0 }
                          : { duration: 0.7, ease: [0.32, 0.72, 0, 1] }
                      }
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
                    </motion.div>

                    {slideCount > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={goPrevFeatured}
                          className="absolute left-0 top-[50%] z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white shadow-none backdrop-blur-sm transition-colors hover:border-white/35 hover:bg-black/55 md:flex cursor-pointer"
                          aria-label="Artikel sebelumnya"
                        >
                          <ChevronLeft size={18} strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          onClick={goNextFeatured}
                          className="absolute right-0 top-[50%] z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white shadow-none backdrop-blur-sm transition-colors hover:border-white/35 hover:bg-black/55 md:flex cursor-pointer"
                          aria-label="Artikel berikutnya"
                        >
                          <ChevronRight size={18} strokeWidth={2} />
                        </button>
                      </>
                    )}
                  </div>

                  {slideCount > 1 && (
                    <div
                      className="flex items-center justify-center gap-1.5 pt-2"
                      role="tablist"
                      aria-label="Slide berita utama"
                    >
                      {featuredArticles.map((article, idx) => (
                        <button
                          key={article.id}
                          type="button"
                          role="tab"
                          onClick={() => setFeaturedIndex(idx)}
                          className="flex items-center justify-center p-1"
                          aria-label={`Slide ${idx + 1}`}
                          aria-selected={idx === featuredIndex}
                        >
                          <span
                            className={cn(
                              "block rounded-full transition-all duration-300",
                              idx === featuredIndex
                                ? "h-1.5 w-5 bg-jepang-red"
                                : "h-1.5 w-1.5 bg-jepang-border hover:bg-jepang-muted",
                            )}
                            aria-hidden
                          />
                        </button>
                      ))}
                    </div>
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

            <TrendingArticlesPanel articles={trending.slice(0, 5)} className="lg:min-h-[460px]" />
          </div>
        )}
      </div>
    </section>
  );
}
