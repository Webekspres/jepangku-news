"use client";

import { useEffect, useState } from "react";
import SidebarAdSlot from "@/components/home/SidebarAdSlot";
import TrendingArticlesPanel, {
  type TrendingArticleItem,
} from "@/components/home/TrendingArticlesPanel";
import PopularTags from "@/components/PopularTags";
import { useAdSlot } from "@/hooks/useAdSlot";

type ArticleSidebarProps = {
  /** Sembunyikan artikel yang sedang dibaca dari daftar trending */
  excludeArticleSlug?: string;
};

const TRENDING_LIMIT = 5;

export default function ArticleSidebarAd({
  excludeArticleSlug,
}: ArticleSidebarProps) {
  const { data, isLoading, error } = useAdSlot("article-sidebar", {
    immediate: true,
  });

  const [trending, setTrending] = useState<TrendingArticleItem[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadTrending() {
      setTrendingLoading(true);
      try {
        const res = await fetch(
          `/api/articles?sort=trending&limit=${TRENDING_LIMIT + 1}`,
        );
        if (!res.ok) throw new Error("Failed to load trending");
        const json = (await res.json()) as { articles?: TrendingArticleItem[] };
        const items = Array.isArray(json.articles) ? json.articles : [];
        const filtered = excludeArticleSlug
          ? items.filter((item) => item.slug !== excludeArticleSlug)
          : items;

        if (!cancelled) {
          setTrending(filtered.slice(0, TRENDING_LIMIT));
        }
      } catch {
        if (!cancelled) setTrending([]);
      } finally {
        if (!cancelled) setTrendingLoading(false);
      }
    }

    void loadTrending();

    return () => {
      cancelled = true;
    };
  }, [excludeArticleSlug]);

  return (
    <div className="space-y-6" data-testid="article-sidebar">

      <TrendingArticlesPanel
        articles={trending}
        loading={trendingLoading}
        testIdPrefix="article-sidebar-trending"
      />

      <aside
        className="rounded-lg border border-jepang-border bg-white p-5"
        aria-label="Topik populer"
        data-testid="article-sidebar-hot-topics"
      >
        <PopularTags
          limit={12}
          title="ホット / HOT TOPIC"
          className="w-full"
        />
      </aside>

      <SidebarAdSlot
        data={data}
        loading={isLoading}
        error={error}
        testId="article-sidebar-ad"
      />
    </div>
  );
}
