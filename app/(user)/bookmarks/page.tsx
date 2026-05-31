'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import ArticleCard from '@/components/ArticleCard';
import { Bookmark as BookmarkIcon } from 'lucide-react';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bookmarks').then((r) => r.json()).then((d) => {
      setBookmarks(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-white min-h-screen" data-testid="bookmarks-page">
      <section className="border-b-2 border-jepang-black bg-jepang-off-white">
        <div className="px-4 md:px-8 lg:px-12 py-12">
          <p className="small-caps text-jepang-red mb-2">BOOKMARKS</p>
          <h1 className="font-heading font-black text-4xl tracking-tighter">Saved Articles</h1>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-12 py-12">
        {loading ? (
          <p className="text-center small-caps text-jepang-muted py-12">Loading...</p>
        ) : bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((article: any) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24" data-testid="no-bookmarks">
            <BookmarkIcon size={48} strokeWidth={1.5} className="mx-auto mb-4 text-jepang-muted" />
            <p className="font-heading font-bold text-2xl mb-2">No bookmarks yet</p>
            <p className="text-jepang-muted">Start saving articles you love!</p>
          </div>
        )}
      </div>
    </div>
  );
}
