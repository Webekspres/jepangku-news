"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import ArticleCard from "@/components/ArticleCard";
import ArticleCardSkeleton from "@/components/skeletons/ArticleCardSkeleton";
import { Bookmark as BookmarkIcon } from "lucide-react";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookmarks")
      .then((r) => parseApiResponse(r))
      .then((d) => {
        setBookmarks(Array.isArray(d) ? d : []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-white min-h-screen" data-testid="bookmarks-page">
      <section className="border-b border-jepang-border bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-red mb-2">
            TERSIMPAN
          </p>
          <h1 className="font-heading font-black text-4xl tracking-tighter">
            Artikel Tersimpan
          </h1>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        ) : bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((article: any) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24" data-testid="no-bookmarks">
            <BookmarkIcon
              size={48}
              strokeWidth={1.5}
              className="mx-auto mb-4 text-jepang-muted"
            />
            <p className="font-heading font-bold text-2xl mb-2">
              Belum ada bookmark
            </p>
            <p className="text-jepang-muted">Simpan artikel favoritmu di sini!</p>
          </div>
        )}
      </div>
    </div>
  );
}
