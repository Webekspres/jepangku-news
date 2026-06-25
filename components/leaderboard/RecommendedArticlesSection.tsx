"use client";

import { useEffect, useState } from "react";
import { parseApiResponse } from "@/lib/fetch-api";
import ArticleCard, { type Article } from "@/components/ArticleCard";
import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type RecommendedArticlesSectionProps = {
  className?: string;
};

export default function RecommendedArticlesSection({
  className,
}: RecommendedArticlesSectionProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadArticles() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          sort: "reactions",
          limit: "4",
        });
        const res = await fetch(`/api/articles?${params}`);
        if (!res.ok) throw new Error("Failed to load articles");
        const data = await parseApiResponse(res);
        const items = Array.isArray(data.articles) ? data.articles : [];

        if (!cancelled) {
          setArticles(items);
        }
      } catch {
        if (!cancelled) setArticles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadArticles();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section
        className={cn("py-12 px-4 bg-jepang-off-white", className)}
        data-testid="recommended-articles-loading"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center gap-2">
            <TrendingUp size={24} strokeWidth={1.5} className="text-jepang-red" />
            <h2 className="font-heading text-2xl font-black tracking-tight">
              記事 / Artikel Trending
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, idx) => (
              <Card
                key={idx}
                className="h-full animate-pulse border border-jepang-border bg-white"
              >
                <div className="aspect-16/10 bg-jepang-border" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-16 rounded bg-jepang-border" />
                  <div className="h-5 w-full rounded bg-jepang-border" />
                  <div className="h-5 w-4/5 rounded bg-jepang-border" />
                  <div className="h-3 w-full rounded bg-jepang-border" />
                  <div className="h-3 w-3/4 rounded bg-jepang-border" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <section
      className={cn("py-12 px-4 bg-jepang-off-white", className)}
      data-testid="recommended-articles-section"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center gap-2">
          <TrendingUp size={24} strokeWidth={1.5} className="text-jepang-red" />
          <h2 className="font-heading text-2xl font-black tracking-tight">
            記事 / Artikel Trending
          </h2>
          <p className="ml-auto text-sm text-jepang-muted hidden sm:block">
            Artikel dengan reaksi terbanyak dari komunitas
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} variant="grid" />
          ))}
        </div>
      </div>
    </section>
  );
}
