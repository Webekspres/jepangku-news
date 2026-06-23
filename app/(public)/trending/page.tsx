"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import ArticleCardSkeleton from "@/components/skeletons/ArticleCardSkeleton";
import SectionHeader from "@/components/SectionHeader";
import { TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PER_PAGE = 12;

export default function TrendingPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadArticles(1, true);
  }, []);

  const loadArticles = async (pageNum: number, reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams({
        sort: "trending",
        limit: String(PER_PAGE),
        page: String(pageNum),
      });
      const data = await fetch(`/api/articles?${params}`).then((r) => parseApiResponse(r));
      const incoming = Array.isArray(data.articles) ? data.articles : [];

      if (reset) setArticles(incoming);
      else {
        setArticles((prev) => {
          const ids = new Set(prev.map((a) => a.id));
          return [...prev, ...incoming.filter((a: any) => !ids.has(a.id))];
        });
      }
      setTotal(Number(data.total || 0));
      setPage(pageNum);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const hasMore = articles.length < total;

  return (
    <div className="bg-white min-h-screen" data-testid="trending-page">
      <SectionHeader
        label="トレンド / Trending"
        title={
          <span className="flex items-center gap-3">
            <TrendingUp size={36} strokeWidth={1.5} className="text-jepang-red" />
            Artikel Sedang Tren
          </span>
        }
        subtitle="Artikel paling banyak dibaca dalam 7 hari terakhir — diurutkan berdasarkan views mingguan."
      />

      <div className="px-4 mx-auto max-w-7xl py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <p className="text-center text-jepang-muted py-16" data-testid="trending-empty">
            Belum ada artikel tren.{" "}
            <Link href="/articles" className="text-jepang-red font-semibold hover:underline">
              Jelajahi artikel
            </Link>
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, idx) => (
                <div key={article.id} className="relative">
                  {idx < 3 && (
                    <span className="absolute -top-2 -left-2 z-10 flex h-8 w-8 items-center justify-center bg-jepang-red text-white font-mono font-black text-sm">
                      {idx + 1}
                    </span>
                  )}
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 text-center">
                <Button
                  variant="outline"
                  onClick={() => loadArticles(page + 1)}
                  disabled={loadingMore}
                  data-testid="trending-load-more"
                >
                  {loadingMore ? "Memuat..." : "Muat Lebih Banyak"}
                  <ArrowRight size={14} className="ml-2" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
