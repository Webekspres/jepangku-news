import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Star, Flame, Search } from 'lucide-react';

export default function AdminHomepagePage() {
  const [homepageData, setHomepageData] = useState({ featured: [], hot: [] });
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [hpRes, articlesRes] = await Promise.all([
        api.get('/admin/homepage'),
        api.get('/admin/articles?status=published'),
      ]);
      setHomepageData(hpRes.data);
      setAllArticles(articlesRes.data || []);
    } catch (e) {
      toast.error('Failed to load homepage data');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (article) => {
    try {
      await api.put(`/admin/articles/${article.id}/featured`, { value: !article.is_featured });
      toast.success(article.is_featured ? 'Removed from featured' : 'Added to featured');
      loadData();
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  const toggleHot = async (article) => {
    try {
      await api.put(`/admin/articles/${article.id}/hot`, { value: !article.is_hot });
      toast.success(article.is_hot ? 'Removed from hot' : 'Marked as hot');
      loadData();
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  const filteredArticles = search
    ? allArticles.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()))
    : allArticles;

  return (
    <div className="bg-white min-h-screen" data-testid="admin-homepage-page">
      <section className="border-b-2 border-jepang-black bg-jepang-off-white">
        <div className="px-4 md:px-8 lg:px-12 py-8">
          <Link to="/admin" className="inline-flex items-center gap-2 small-caps text-jepang-muted hover:text-jepang-red mb-4">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <p className="small-caps text-jepang-red mb-2">HOMEPAGE SETTINGS</p>
          <h1 className="font-heading font-black text-4xl tracking-tighter">Featured & Hot Articles</h1>
          <p className="text-jepang-muted mt-2">Atur artikel yang tampil sebagai Featured (hero) dan Hot (trending) di homepage.</p>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-12 py-8 max-w-6xl mx-auto">
        {loading ? (
          <p className="text-center small-caps text-jepang-muted py-12">Loading...</p>
        ) : (
          <>
            {/* Current Featured & Hot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white border border-jepang-red p-5">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-jepang-border">
                  <Star size={20} strokeWidth={1.5} className="text-jepang-red" fill="currentColor" />
                  <h2 className="small-caps text-jepang-red">CURRENTLY FEATURED ({homepageData.featured?.length || 0})</h2>
                </div>
                {homepageData.featured?.length > 0 ? (
                  <div className="space-y-2">
                    {homepageData.featured.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-2 border border-jepang-border" data-testid={`featured-${a.id}`}>
                        <p className="text-sm font-semibold line-clamp-1 flex-1">{a.title}</p>
                        <button onClick={() => toggleFeatured(a)} className="text-xs uppercase tracking-wider font-bold text-jepang-red hover:underline ml-2" data-testid={`unfeature-${a.id}`}>Remove</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-jepang-muted text-center py-4">No featured articles</p>
                )}
              </div>

              <div className="bg-white border border-jepang-black p-5">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-jepang-border">
                  <Flame size={20} strokeWidth={1.5} className="text-jepang-red" />
                  <h2 className="small-caps">CURRENTLY HOT ({homepageData.hot?.length || 0})</h2>
                </div>
                {homepageData.hot?.length > 0 ? (
                  <div className="space-y-2">
                    {homepageData.hot.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-2 border border-jepang-border" data-testid={`hot-${a.id}`}>
                        <p className="text-sm font-semibold line-clamp-1 flex-1">{a.title}</p>
                        <button onClick={() => toggleHot(a)} className="text-xs uppercase tracking-wider font-bold text-jepang-red hover:underline ml-2" data-testid={`unhot-${a.id}`}>Remove</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-jepang-muted text-center py-4">No hot articles</p>
                )}
              </div>
            </div>

            {/* All Published Articles */}
            <div className="bg-white border border-jepang-black">
              <div className="p-4 border-b border-jepang-border bg-jepang-off-white">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="small-caps">ALL PUBLISHED ARTICLES</h2>
                  <div className="relative flex-1 max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-jepang-muted" />
                    <input
                      type="text"
                      placeholder="Search articles..."
                      className="jepang-input pl-8 text-sm py-2"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      data-testid="homepage-search"
                    />
                  </div>
                </div>
              </div>
              <div className="divide-y divide-jepang-border max-h-[600px] overflow-y-auto">
                {filteredArticles.map((article) => (
                  <div key={article.id} className="p-3 flex items-center justify-between gap-3 hover:bg-jepang-off-white" data-testid={`homepage-article-${article.id}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {article.is_featured && <Star size={12} strokeWidth={1.5} className="text-jepang-red" fill="currentColor" />}
                        {article.is_hot && <Flame size={12} strokeWidth={1.5} className="text-jepang-red" />}
                        {article.category && <span className="text-[10px] uppercase tracking-wider font-bold text-jepang-muted">{article.category.name}</span>}
                      </div>
                      <p className="font-semibold text-sm truncate">{article.title}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleFeatured(article)}
                        className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1 border inline-flex items-center gap-1 ${article.is_featured ? 'bg-jepang-red text-white border-jepang-red' : 'border-jepang-border hover:border-jepang-red hover:text-jepang-red'}`}
                        data-testid={`toggle-featured-${article.id}`}
                      >
                        <Star size={10} strokeWidth={1.5} fill={article.is_featured ? 'currentColor' : 'none'} />
                        {article.is_featured ? 'Featured' : 'Feature'}
                      </button>
                      <button
                        onClick={() => toggleHot(article)}
                        className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1 border inline-flex items-center gap-1 ${article.is_hot ? 'bg-jepang-black text-white border-jepang-black' : 'border-jepang-border hover:border-jepang-black'}`}
                        data-testid={`toggle-hot-${article.id}`}
                      >
                        <Flame size={10} strokeWidth={1.5} />
                        {article.is_hot ? 'Hot' : 'Hot'}
                      </button>
                    </div>
                  </div>
                ))}
                {filteredArticles.length === 0 && (
                  <p className="text-center text-jepang-muted text-sm p-6">No articles found</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
