"use client";

import Link from "next/link";
import { ArrowRight, Smile } from "lucide-react";
import ArticleCard from "@/components/ArticleCard";
import ReactionIcon from "@/components/reactions/ReactionIcon";
import LazySectionSkeleton from "@/components/home/LazySectionSkeleton";
import type { HomeReactedArticle, HomeReactionsResponse } from "@/lib/home/types";
import { cn } from "@/lib/utils";

type HomeReactionsSectionProps = {
  data: HomeReactionsResponse | null;
  loading: boolean;
  error: Error | null;
};

function ReactionsSkeleton() {
  return (
    <LazySectionSkeleton minHeight={560} data-testid="reactions-loading">
      <div className="grid grid-cols-5 sm:grid-cols-9 gap-2 mb-8 animate-pulse">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="h-16 bg-jepang-border rounded" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-72 bg-jepang-border rounded-lg" />
        ))}
      </div>
    </LazySectionSkeleton>
  );
}

function toArticleCardProps(article: HomeReactedArticle) {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverImageUrl: article.coverImageUrl,
    author: article.author,
    category: article.category,
  };
}

export default function HomeReactionsSection({
  data,
  loading,
  error,
}: HomeReactionsSectionProps) {
  if (error) {
    return (
      <section className="py-12 bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl text-center text-sm text-jepang-muted">
          Gagal memuat reaksi komunitas.
        </div>
      </section>
    );
  }

  if (loading || !data) {
    return (
      <section className="py-12 bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl">
          <ReactionsSkeleton />
        </div>
      </section>
    );
  }

  const periodLabel =
    data.period === "week" ? "7 hari terakhir" : "sepanjang waktu";

  return (
    <section className="py-12 bg-jepang-off-white" data-testid="home-reactions-section">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8 pb-3 border-b-2 border-jepang-red">
          <div>
            <p className="section-label mb-1">リアクション / REAKSI</p>
            <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tighter flex items-center gap-3">
              <Smile size={32} strokeWidth={1.5} className="text-jepang-red shrink-0" />
              <span className="section-title-gradient">Reaksi Komunitas</span>
            </h2>
            <p className="mt-2 text-sm text-jepang-muted">
              Artikel paling direaksi komunitas — {periodLabel}.
            </p>
          </div>
          <Link
            href="/articles"
            className="hidden md:inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wider hover:text-jepang-red transition-colors"
          >
            SEMUA ARTIKEL <ArrowRight size={14} />
          </Link>
        </div>

        <div
          className="mb-10 rounded-lg border border-jepang-border bg-white p-4 md:p-6"
          data-testid="home-reactions-emoji-bar"
        >
          <p className="text-[10px] font-mono uppercase tracking-wider text-jepang-muted mb-4">
            Reaksi komunitas {periodLabel}
            {data.globalTotal > 0 ? ` · ${data.globalTotal.toLocaleString("id-ID")} total` : ""}
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
            {data.emojiStats.map((stat) => (
              <div
                key={stat.type}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border border-jepang-border bg-jepang-off-white p-3",
                  stat.count > 0 && "border-jepang-red/20",
                )}
                data-testid={`home-reaction-stat-${stat.type}`}
              >
                {/* TODO: perbesar ukuran iconnya dan buat jadi link perkecil jarak count dan labelnya */}
                <ReactionIcon src={stat.iconSrc} size={32} />
                <span className="font-heading text-lg font-black tabular-nums">
                  {stat.count}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-jepang-muted">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {data.articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.articles.map((article) => (
              <div key={article.id} data-testid={`reacted-article-card-${article.slug}`}>
                <ArticleCard
                  article={toArticleCardProps(article)}
                  reactionBadge={{
                    iconSrc: article.dominantIconSrc,
                    label: article.dominantLabel,
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-jepang-border bg-white py-16 text-center">
            <p className="font-heading text-xl font-bold mb-2">Belum ada reaksi</p>
            <p className="text-sm text-jepang-muted mb-6">
              Baca artikel dan jadilah yang pertama memberi reaksi emoji!
            </p>
            <Link href="/articles" className="jepang-btn-primary inline-flex">
              Jelajahi Artikel
            </Link>
          </div>
        )}

        <div className="mt-8 flex justify-center md:hidden">
          <Link href="/articles" className="jepang-btn-primary inline-flex items-center gap-2">
            Semua Artikel <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
