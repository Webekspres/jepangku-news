"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import { useSearchParams, useRouter } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import ArticleCardSkeleton from "@/components/skeletons/ArticleCardSkeleton";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/SectionHeader";
import ArticleListSidebar from "@/components/articles/ArticleListSidebar";
import { ArticleListFiltersMobile, ArticleListSearch } from "@/components/articles/ArticleListFilters";
import SidebarAdSlot from "@/components/home/SidebarAdSlot";
import { useAdSlot } from "@/hooks/useAdSlot";

function ArticleListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams?.get("category") || "";
  const tag = searchParams?.get("tag") || "";
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
  const PER_PAGE = 15;

  const { data: mobileAd, isLoading: mobileAdLoading, error: mobileAdError } = useAdSlot(
    "sidebar",
    { immediate: true },
  );

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => parseApiResponse(r))
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .finally(() => setCategoriesLoading(false));
  }, []);

  useEffect(() => {
    setPage(1);
    loadArticles(1, true);
  }, [category, tag, search, sort]);

  const loadArticles = async (pageNum: number, reset: boolean = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams();

      if (category) params.set("category", category);
      if (tag) params.set("tag", tag);
      if (search) params.set("search", search);

      params.set("sort", sort);
      params.set("limit", String(PER_PAGE));
      params.set("page", String(pageNum));

      const data = await fetch(`/api/articles?${params}`).then((r) => parseApiResponse(r));

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

  const activeCategory = categories.find((cat: { slug: string }) => cat.slug === category);

  const filterProps = {
    search,
    searchInput,
    onSearchInputChange: setSearchInput,
    onSearchSubmit: handleSearch,
    sort,
    category,
    tag,
    categories,
    categoriesLoading,
    activeCategory,
    onUpdateParams: updateParams,
  };

  return (
    <div className="bg-white min-h-screen" data-testid="article-list-page">
      <SectionHeader
        label="記事 / Artikel"
        title={
          activeCategory?.name
            ? activeCategory.name
            : "Baca berita terbaru seputar Jepang"
        }
      />

      <div className="mx-auto max-w-7xl px-4 pb-8 pt-4">
      <div className="mb-4">
        <ArticleListSearch
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          onSearchSubmit={handleSearch}
          className="mb-2"
        />

        {search ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-jepang-muted">
              Pencarian aktif
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                updateParams({ search: "" });
              }}
              className="rounded-md border border-jepang-border bg-jepang-off-white px-2.5 py-1 text-xs font-medium text-jepang-navy hover:border-jepang-red"
            >
              &ldquo;{search}&rdquo; <span className="text-jepang-muted">×</span>
            </button>
          </div>
        ) : null}
      </div>

        <ArticleListFiltersMobile {...filterProps} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
          <main className="min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(9)].map((_, idx) => (
                  <ArticleCardSkeleton key={idx} variant="grid" />
                ))}
              </div>
            ) : articles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {articles.map((article: any) => (
                    <ArticleCard key={article.id} article={article} variant="grid" />
                  ))}
                </div>

                {hasMore ? (
                  <div className="mt-8 flex flex-col items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={loadMore}
                      disabled={loadingMore}
                      data-testid="load-more"
                    >
                      {loadingMore
                        ? "Memuat..."
                        : `Muat Lebih Banyak (${total - articles.length} lagi)`}
                    </Button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="py-16 text-center sm:py-24" data-testid="no-articles">
                <p className="mb-2 font-heading text-xl font-bold sm:text-2xl">
                  Tidak ada artikel ditemukan
                </p>
                <p className="text-sm text-jepang-muted sm:text-base">
                  Coba ubah filter atau kata kunci pencarian
                </p>
              </div>
            )}

            <div className="mt-8 lg:hidden">
              <SidebarAdSlot
                data={mobileAd}
                loading={mobileAdLoading}
                error={mobileAdError}
                testId="article-list-mobile-ad"
              />
            </div>
          </main>

          <aside className="hidden h-full lg:block">
            <div className="sticky top-24">
              <ArticleListSidebar {...filterProps} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function ArticleListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted">
            Memuat...
          </p>
        </div>
      }
    >
      <ArticleListContent />
    </Suspense>
  );
}
