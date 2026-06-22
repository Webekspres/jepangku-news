"use client";

import Link from "next/link";
import CardCoverImage from "@/components/CardCoverImage";
import { ArrowRight, TrendingUp } from "lucide-react";
import { resolveThumbnailUrl } from "@/lib/image-placeholder";
import { cn } from "@/lib/utils";

export type TrendingArticleItem = {
  id: string;
  slug: string;
  title: string;
  coverImageUrl?: string | null;
  cover_image_url?: string | null;
  weeklyViewCount?: number;
  weekly_view_count?: number;
};

type TrendingArticlesPanelProps = {
  articles: TrendingArticleItem[];
  loading?: boolean;
  className?: string;
  testIdPrefix?: string;
};

function getCoverUrl(article: TrendingArticleItem) {
  return resolveThumbnailUrl(article);
}

function getWeeklyViews(article: TrendingArticleItem) {
  return article.weeklyViewCount ?? article.weekly_view_count ?? 0;
}

export default function TrendingArticlesPanel({
  articles,
  loading = false,
  className,
  testIdPrefix = "trending",
}: TrendingArticlesPanelProps) {
  return (
    <aside
      className={cn(
        "flex flex-col rounded-lg border border-jepang-border bg-white p-5",
        className,
      )}
      aria-label="Artikel sedang tren"
      data-testid={`${testIdPrefix}-panel`}
    >
      <div className="mb-4 flex items-center justify-between gap-2 border-b border-jepang-border pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp
            size={18}
            strokeWidth={1.5}
            className="shrink-0 text-jepang-red"
          />
          <h3 className="small-caps">トレンド / Sedang Tren</h3>
        </div>
        <Link
          href="/trending"
          className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wider transition-colors hover:text-jepang-red"
          data-testid={`${testIdPrefix}-view-all`}
        >
          Semua <ArrowRight size={10} />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3" data-testid={`${testIdPrefix}-loading`}>
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="flex animate-pulse items-center gap-3 py-2">
              <div className="h-8 w-8 shrink-0 rounded bg-jepang-border" />
              <div className="h-14 w-20 shrink-0 rounded-sm bg-jepang-border" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-full rounded bg-jepang-border" />
                <div className="h-3 w-2/3 rounded bg-jepang-border" />
              </div>
            </div>
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="flex-1 space-y-0">
          {articles.map((article, idx) => {
            const thumbnailUrl = getCoverUrl(article);

            return (
              <div
                key={article.id}
                className="flex items-center gap-3 border-b border-jepang-border py-3 last:border-b-0"
              >
                <span className="w-6 shrink-0 font-mono text-lg font-black text-jepang-red">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <Link
                  href={`/articles/${article.slug}`}
                  className="relative h-14 w-[72px] shrink-0 overflow-hidden rounded-sm bg-jepang-off-white md:h-16 md:w-20"
                  data-testid={`${testIdPrefix}-thumbnail-${article.slug}`}
                >
                  <CardCoverImage
                    src={thumbnailUrl}
                    alt={article.title}
                    sizes="70px"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/articles/${article.slug}`}
                    className="line-clamp-2 font-heading text-sm font-bold leading-snug transition-colors hover:text-jepang-red"
                    data-testid={`${testIdPrefix}-link-${article.slug}`}
                  >
                    {article.title}
                  </Link>
                  <p className="mt-1 font-mono text-[10px] tracking-wider text-zinc-600">
                    {getWeeklyViews(article).toLocaleString("id-ID")} views
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p
          className="py-8 text-center text-sm text-jepang-muted"
          data-testid={`${testIdPrefix}-empty`}
        >
          Belum ada artikel tren
        </p>
      )}
    </aside>
  );
}
