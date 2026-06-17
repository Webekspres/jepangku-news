"use client";

import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import ArticleCardSkeleton from "@/components/skeletons/ArticleCardSkeleton";
import LazySectionSkeleton from "@/components/home/LazySectionSkeleton";
import type { HomeArticle } from "@/lib/home/article-include";
import { ArrowRight } from "lucide-react";

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
          <LazySectionSkeleton minHeight={360}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {[...Array(3)].map((_, idx) => (
                <ArticleCardSkeleton key={idx} />
              ))}
            </div>
          </LazySectionSkeleton>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {articles.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                priority={index === 0}
              />
            ))}
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
