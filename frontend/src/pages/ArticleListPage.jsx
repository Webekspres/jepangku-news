import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';
import { Search } from 'lucide-react';

export default function ArticleListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'latest';

  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [searchInput, setSearchInput] = useState(search);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadArticles();
  }, [category, search, sort]);

  const loadCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (sort) params.append('sort', sort);
      params.append('limit', '24');
      const { data } = await api.get(`/articles?${params}`);
      setArticles(data.articles || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput) newParams.set('search', searchInput);
    else newParams.delete('search');
    setSearchParams(newParams);
  };

  const handleCategoryChange = (slug) => {
    const newParams = new URLSearchParams(searchParams);
    if (slug) newParams.set('category', slug);
    else newParams.delete('category');
    setSearchParams(newParams);
  };

  const handleSortChange = (newSort) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', newSort);
    setSearchParams(newParams);
  };

  return (
    <div className="bg-white min-h-screen" data-testid="article-list-page">
      <section className="border-b-2 border-jepang-black bg-jepang-off-white">
        <div className="px-4 md:px-8 lg:px-12 py-12">
          <p className="small-caps text-jepang-red mb-2">記事 / ARTICLES</p>
          <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-6">
            All Articles
          </h1>
          <p className="text-jepang-muted font-mono uppercase tracking-wider text-sm">{total} ARTICLES FOUND</p>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-12 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search articles..."
              className="jepang-input flex-1"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              data-testid="search-input"
            />
            <button type="submit" className="jepang-btn-black" data-testid="search-submit">
              <Search size={16} strokeWidth={1.5} />
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleCategoryChange('')}
              className={`text-xs uppercase tracking-wider font-bold px-3 py-2 border ${!category ? 'bg-jepang-black text-white border-jepang-black' : 'border-jepang-border hover:border-jepang-black'}`}
              data-testid="filter-all"
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`text-xs uppercase tracking-wider font-bold px-3 py-2 border ${category === cat.slug ? 'bg-jepang-red text-white border-jepang-red' : 'border-jepang-border hover:border-jepang-black'}`}
                data-testid={`filter-${cat.slug}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <span className="small-caps text-jepang-muted self-center">Sort:</span>
            {['latest', 'popular', 'trending'].map((s) => (
              <button
                key={s}
                onClick={() => handleSortChange(s)}
                className={`text-xs uppercase tracking-wider font-bold px-3 py-1 ${sort === s ? 'text-jepang-red border-b-2 border-jepang-red' : 'text-jepang-muted hover:text-jepang-black'}`}
                data-testid={`sort-${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <p className="text-center text-jepang-muted py-12 small-caps">Loading articles...</p>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
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
