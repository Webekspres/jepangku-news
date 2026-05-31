"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import ArticleCardSkeleton from "@/components/skeletons/ArticleCardSkeleton";
import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function ArticleListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams?.get("category") || "";
  const search = searchParams?.get("search") || "";
  const sort = searchParams?.get("sort") || "latest";

  const [articles, setArticles] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState(search);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .finally(() => setCategoriesLoading(false));
  }, []);

  useEffect(() => {
    setPage(1);
    loadArticles(1, true);
  }, [category, search, sort]);

  const loadArticles = async (pageNum: number, reset: boolean = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams();

      if (category) params.set("category", category);
      if (search) params.set("search", search);

      params.set("sort", sort);
      params.set("limit", String(PER_PAGE));
      params.set("page", String(pageNum));

      const data = await fetch(`/api/articles?${params}`).then((r) => r.json());

      const incomingArticles = Array.isArray(data.articles) ? data.articles : [];

      if (reset) {
        setArticles(incomingArticles);
      } else {
        setArticles((prev) => {
          const existingIds = new Set(prev.map((article) => article.id));

          const uniqueIncoming = incomingArticles.filter(
            (article: any) => article.id && !existingIds.has(article.id),
          );

          return [...prev, ...uniqueIncoming];
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

  const loadMore = () => {
    if (loadingMore || loading || !hasMore) return;

    loadArticles(page + 1);
  };

  const updateParams = (updates: Record<string, string>) => {
    const p = new URLSearchParams(searchParams?.toString() ?? "");
    Object.entries(updates).forEach(([k, v]) => {
      if (v) p.set(k, v);
      else p.delete(k);
    });
    router.push(`/articles?${p.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  return (
    <div className="bg-white min-h-screen" data-testid="article-list-page">
      <section className="border-b-2 border-foreground bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-red mb-2">
            記事 / ARTIKEL
          </p>
          <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-6">
            Semua Artikel
          </h1>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-8">
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Cari Artikel"
              className="flex-1"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              data-testid="search-input"
            />

            <Button
              type="submit"
              variant="default"
              size="icon"
              data-testid="search-submit"
              aria-label="Cari artikel"
            >
              <Search size={16} strokeWidth={2} />
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={!category ? "default" : "outline"}
              onClick={() => updateParams({ category: "" })}
              data-testid="filter-all"
            >
              Semua
            </Button>
            {categoriesLoading
              ? [...Array(5)].map((_, idx) => (
                  <span
                    key={`cat-skel-${idx}`}
                    className="inline-flex items-center justify-center border border-jepang-border bg-jepang-off-white px-3 py-1.5 h-9 w-20 animate-pulse"
                  />
                ))
              : categories.map((cat: any) => (
                  <Button
                    key={cat.id}
                    size="sm"
                    variant={category === cat.slug ? "default" : "outline"}
                    onClick={() => updateParams({ category: cat.slug })}
                    data-testid={`filter-${cat.slug}`}
                  >
                    {cat.name}
                  </Button>
                ))}
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted">
              <Filter
                size={12}
                strokeWidth={1.5}
                className="text-jepang-muted"
              />
            </span>
            {["latest", "popular", "trending"].map((s) => (
              <button
                key={s}
                onClick={() => updateParams({ sort: s })}
                className={`text-xs uppercase tracking-wider font-bold px-3 py-1 ${sort === s ? "text-jepang-red border-b-2 border-jepang-red" : "text-jepang-muted hover:text-foreground cursor-pointer hover:text-jepang-red"}`}
                data-testid={`sort-${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => (
              <ArticleCardSkeleton key={idx} />
            ))}
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article: any) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={loadMore}
                  disabled={loadingMore}
                  data-testid="load-more"
                >
                  {loadingMore ? "Memuat..." : "Muat Lebih Banyak"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24" data-testid="no-articles">
            <p className="font-heading font-bold text-2xl mb-2">
              No articles found
            </p>
            <p className="text-jepang-muted">
              Try adjusting your filters or search
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ArticleListPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted">
            Loading...
          </p>
        </div>
      }
    >
      <ArticleListContent />
    </Suspense>
  );
}
