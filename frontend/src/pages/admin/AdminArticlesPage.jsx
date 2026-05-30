import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';

const STATUS_COLORS = {
  draft: 'bg-zinc-200 text-jepang-black',
  pending_review: 'bg-yellow-300 text-jepang-black',
  published: 'bg-green-600 text-white',
  rejected: 'bg-jepang-red text-white',
  archived: 'bg-zinc-400 text-white',
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, [filter]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const url = filter ? `/admin/articles?status=${filter}` : '/admin/articles';
      const { data } = await api.get(url);
      setArticles(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen" data-testid="admin-articles-page">
      <section className="border-b-2 border-jepang-black bg-jepang-off-white">
        <div className="px-4 md:px-8 lg:px-12 py-8">
          <Link to="/admin" className="inline-flex items-center gap-2 small-caps text-jepang-muted hover:text-jepang-red mb-4">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="font-heading font-black text-4xl tracking-tighter">All Articles</h1>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-12 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {[{ v: '', l: 'All' }, { v: 'draft', l: 'Draft' }, { v: 'pending_review', l: 'Pending' }, { v: 'published', l: 'Published' }, { v: 'rejected', l: 'Rejected' }, { v: 'archived', l: 'Archived' }].map((s) => (
            <button
              key={s.v}
              onClick={() => setFilter(s.v)}
              className={`text-xs uppercase tracking-wider font-bold px-3 py-2 border ${filter === s.v ? 'bg-jepang-black text-white border-jepang-black' : 'border-jepang-border hover:border-jepang-black'}`}
              data-testid={`admin-filter-${s.v || 'all'}`}
            >
              {s.l}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center small-caps text-jepang-muted py-12">Loading...</p>
        ) : (
          <div className="bg-white border border-jepang-black">
            <table className="w-full text-sm">
              <thead className="bg-jepang-off-white border-b border-jepang-border">
                <tr>
                  <th className="text-left p-3 small-caps">TITLE</th>
                  <th className="text-left p-3 small-caps">AUTHOR</th>
                  <th className="text-left p-3 small-caps">CATEGORY</th>
                  <th className="text-left p-3 small-caps">STATUS</th>
                  <th className="text-left p-3 small-caps">VIEWS</th>
                </tr>
              </thead>
              <tbody>
                {articles.length === 0 ? (
                  <tr><td colSpan="5" className="text-center text-jepang-muted py-12">No articles found</td></tr>
                ) : (
                  articles.map((article) => (
                    <tr key={article.id} className="border-b border-jepang-border last:border-b-0 hover:bg-jepang-off-white" data-testid={`admin-article-row-${article.id}`}>
                      <td className="p-3 font-semibold">{article.title}</td>
                      <td className="p-3 text-jepang-muted">{article.author?.name || '-'}</td>
                      <td className="p-3 text-jepang-muted">{article.category?.name || '-'}</td>
                      <td className="p-3">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 ${STATUS_COLORS[article.status]}`}>
                          {article.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono">{article.view_count || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
