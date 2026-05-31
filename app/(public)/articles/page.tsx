'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ArticleCard from '@/components/ArticleCard';
import { Search } from 'lucide-react';

function ArticleListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams?.get('category') || '';
  const search = searchParams?.get('search') || '';
  const sort = searchParams?.get('sort') || 'latest';

  const [articles, setArticles] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState(search);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch('/api/categories').then((r) => r.json()).then((d) => setCategories(Array.isArray(d) ? d : [])); }, []);
  useEffect(() => { loadArticles(); }, [category, search, sort]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (search) params.set('search', search);
      params.set('sort', sort);
      params.set('limit', '24');
      const data = await fetch(`/api/articles?${params}`).then((r) => r.json());
      setArticles(data.articles || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  };

  const updateParams = (updates: Record<string, string>) => {
    const p = new URLSearchParams(searchParams?.toString() ?? '');
    Object.entries(updates).forEach(([k, v]) => { if (v) p.set(k, v); else p.delete(k); });
    router.push(`/articles?${p.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  return (
    <div className="bg-white min-h-screen" data-testid="article-list-page">
      <section className="border-b-2 border-jepang-black bg-jepang-off-white">
        <div className="px-4 md:px-8 lg:px-12 py-12">
          <p className="small-caps text-jepang-red mb-2">記事 / ARTIKEL</p>
          <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-6">Semua Artikel</h1>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-12 py-8">
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input type="text" placeholder="Cari Artikel" className="jepang-input flex-1" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} data-testid="search-input" />
            <button type="submit" className="jepang-btn-black px-4 py-3" data-testid="search-submit"><Search size={16} strokeWidth={1.5} /></button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => updateParams({ category: '' })} className={`text-xs uppercase tracking-wider font-bold px-3 py-2 border ${!category ? 'bg-jepang-black text-white border-jepang-black' : 'border-jepang-border hover:border-jepang-black'}`} data-testid="filter-all">Semua</button>
            {categories.map((cat: any) => (
              <button key={cat.id} onClick={() => updateParams({ category: cat.slug })} className={`text-xs uppercase tracking-wider font-bold px-3 py-2 border ${category === cat.slug ? 'bg-jepang-red text-white border-jepang-red' : 'border-jepang-border hover:border-jepang-black'}`} data-testid={`filter-${cat.slug}`}>{cat.name}</button>
            ))}
          </div>

          <div className="flex gap-2">
            <span className="small-caps text-jepang-muted self-center">Filter</span>
            {['latest', 'popular', 'trending'].map((s) => (
              <button key={s} onClick={() => updateParams({ sort: s })} className={`text-xs uppercase tracking-wider font-bold px-3 py-1 ${sort === s ? 'text-jepang-red border-b-2 border-jepang-red' : 'text-jepang-muted hover:text-jepang-black'}`} data-testid={`sort-${s}`}>{s}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-center text-jepang-muted py-12 small-caps">Loading articles...</p>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: any) => <ArticleCard key={article.id} article={article} />)}
          </div>
        ) : (
          <div className="text-center py-24" data-testid="no-articles">
            <p className="font-heading font-bold text-2xl mb-2">No articles found</p>
            <p className="text-jepang-muted">Try adjusting your filters or search</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ArticleListPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="small-caps text-jepang-muted">Loading...</p></div>}><ArticleListContent /></Suspense>;
}
