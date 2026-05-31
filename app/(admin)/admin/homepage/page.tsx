'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Star, Flame, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function AdminHomepagePage() {
  const [homepageData, setHomepageData] = useState<any>({ featured: [], hot: [] });
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [hp, articles] = await Promise.all([
      fetch('/api/admin/homepage').then((r) => r.json()),
      fetch('/api/admin/articles?status=PUBLISHED').then((r) => r.json()),
    ]);
    setHomepageData(hp);
    setAllArticles(Array.isArray(articles) ? articles : []);
    setLoading(false);
  };

  const toggleFeatured = async (article: any) => {
    try {
      await fetch(`/api/admin/articles/${article.id}/featured`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: !article.isFeatured }),
      });
      toast.success(article.isFeatured ? 'Removed from featured' : 'Added to featured');
      loadData();
    } catch { toast.error('Failed to update'); }
  };

  const toggleHot = async (article: any) => {
    try {
      await fetch(`/api/admin/articles/${article.id}/hot`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: !article.isHot }),
      });
      toast.success(article.isHot ? 'Removed from hot' : 'Marked as hot');
      loadData();
    } catch { toast.error('Failed to update'); }
  };

  const filtered = search
    ? allArticles.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()))
    : allArticles;

  return (
    <div className="bg-white min-h-screen" data-testid="admin-homepage-page">
      <section className="border-b-2 border-[#0A0A0A] bg-[#F4F4F5]">
        <div className="px-4 mx-auto max-w-7xl py-8">
          <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#52525B] hover:text-[#D90429] mb-4">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D90429] mb-2">HOMEPAGE SETTINGS</p>
          <h1 className="font-heading font-black text-4xl tracking-tighter">Featured & Hot Articles</h1>
          <p className="text-[#52525B] mt-2">Atur artikel yang tampil sebagai Featured (hero) dan Hot di homepage.</p>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-8">
        {loading ? (
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#52525B] py-12">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card className="border border-[#D90429]">
                <CardHeader className="border-b border-[#E4E4E7] py-3">
                  <div className="flex items-center gap-2">
                    <Star size={20} strokeWidth={1.5} className="text-[#D90429]" fill="currentColor" />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D90429]">
                      CURRENTLY FEATURED ({homepageData.featured?.length || 0})
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-3">
                  {homepageData.featured?.length > 0 ? (
                    <div className="space-y-2">
                      {homepageData.featured.map((a: any) => (
                        <div key={a.id} className="flex items-center justify-between p-2 border border-[#E4E4E7]" data-testid={`featured-${a.id}`}>
                          <p className="text-sm font-semibold line-clamp-1 flex-1">{a.title}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFeatured(a)}
                            className="text-[#D90429] hover:text-[#D90429] ml-2"
                            data-testid={`unfeature-${a.id}`}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#52525B] text-center py-4">No featured articles</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-[#0A0A0A]">
                <CardHeader className="border-b border-[#E4E4E7] py-3">
                  <div className="flex items-center gap-2">
                    <Flame size={20} strokeWidth={1.5} className="text-[#D90429]" />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                      CURRENTLY HOT ({homepageData.hot?.length || 0})
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-3">
                  {homepageData.hot?.length > 0 ? (
                    <div className="space-y-2">
                      {homepageData.hot.map((a: any) => (
                        <div key={a.id} className="flex items-center justify-between p-2 border border-[#E4E4E7]" data-testid={`hot-${a.id}`}>
                          <p className="text-sm font-semibold line-clamp-1 flex-1">{a.title}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleHot(a)}
                            className="text-[#D90429] hover:text-[#D90429] ml-2"
                            data-testid={`unhot-${a.id}`}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#52525B] text-center py-4">No hot articles</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border border-[#0A0A0A]">
              <CardHeader className="border-b border-[#E4E4E7] bg-[#F4F4F5] py-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">ALL PUBLISHED ARTICLES</p>
                  <div className="relative flex-1 max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]" />
                    <Input
                      type="text"
                      placeholder="Search articles..."
                      className="pl-8 text-sm py-2"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      data-testid="homepage-search"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-[#E4E4E7] max-h-150 overflow-y-auto">
                  {filtered.map((article: any) => (
                    <div
                      key={article.id}
                      className="p-3 flex items-center justify-between gap-3 hover:bg-[#F4F4F5]"
                      data-testid={`homepage-article-${article.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {article.isFeatured && <Star size={12} strokeWidth={1.5} className="text-[#D90429]" fill="currentColor" />}
                          {article.isHot && <Flame size={12} strokeWidth={1.5} className="text-[#D90429]" />}
                          {article.category && (
                            <span className="text-[10px] uppercase tracking-wider font-bold text-[#52525B]">{article.category.name}</span>
                          )}
                        </div>
                        <p className="font-semibold text-sm truncate">{article.title}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={article.isFeatured ? 'default' : 'outline'}
                          onClick={() => toggleFeatured(article)}
                          className={article.isFeatured ? '' : 'hover:border-[#D90429] hover:text-[#D90429]'}
                          data-testid={`toggle-featured-${article.id}`}
                        >
                          <Star size={10} strokeWidth={1.5} fill={article.isFeatured ? 'currentColor' : 'none'} />
                          {article.isFeatured ? 'Featured' : 'Feature'}
                        </Button>
                        <Button
                          size="sm"
                          variant={article.isHot ? 'black' : 'outline'}
                          onClick={() => toggleHot(article)}
                          data-testid={`toggle-hot-${article.id}`}
                        >
                          <Flame size={10} strokeWidth={1.5} /> Hot
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <p className="text-center text-[#52525B] text-sm p-6">No articles found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
