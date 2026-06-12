"use client";

import CategoryFeaturedColumn from "@/components/home/CategoryFeaturedColumn";
import CategoryListColumn from "@/components/home/CategoryListColumn";
import LazySectionSkeleton from "@/components/home/LazySectionSkeleton";
import type { HomeCategoriesEditorialResponse } from "@/lib/home/types";

type CategoryEditorialSectionProps = {
  data: HomeCategoriesEditorialResponse | null;
  loading: boolean;
  error: Error | null;
};

function EditorialSkeleton() {
  return (
    <LazySectionSkeleton minHeight={720} data-testid="editorial-loading">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-4 animate-pulse">
            <div className="flex justify-between">
              <div className="h-7 w-36 bg-jepang-border rounded" />
              <div className="h-8 w-24 bg-jepang-red/20 rounded-full" />
            </div>
            <div className="aspect-16/10 bg-jepang-border rounded-lg" />
            <div className="space-y-3">
              {[0, 1, 2].map((j) => (
                <div key={j} className="flex gap-3">
                  <div className="w-20 h-16 bg-jepang-border rounded-sm shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-jepang-border rounded w-full" />
                    <div className="h-3 bg-jepang-border rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="border border-jepang-border p-5 space-y-3 animate-pulse"
          >
            <div className="h-6 w-28 bg-jepang-red/20 rounded" />
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="h-4 bg-jepang-border rounded" />
            ))}
          </div>
        ))}
      </div>
    </LazySectionSkeleton>
  );
}

export default function CategoryEditorialSection({
  data,
  loading,
  error,
}: CategoryEditorialSectionProps) {
  return (
    <section
      className="py-10 md:py-12 bg-white border-t border-jepang-border"
      aria-labelledby="home-editorial-heading"
    >
      <div className="px-4 mx-auto max-w-7xl">
        <div className="mb-6 md:mb-8 pb-3 border-b border-jepang-border">
          <p className="small-caps text-jepang-red mb-1">カテゴリ / KATEGORI</p>
          <h2
            id="home-editorial-heading"
            className="font-heading font-black text-3xl md:text-4xl tracking-tighter"
          >
            Jelajahi Topik Populer
          </h2>
        </div>

        {error ? (
          <p className="text-center text-sm text-jepang-red py-8">
            Gagal memuat kategori editorial.
          </p>
        ) : loading || !data ? (
          <EditorialSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-8 lg:mb-10">
              {data.featuredColumns.map((column) => (
                <CategoryFeaturedColumn key={column.slug} column={column} />
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              {data.listColumns.map((column) => (
                <CategoryListColumn key={column.slug} column={column} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
