import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Send, FileText } from 'lucide-react';

const STATUS_COLORS = {
  draft: 'bg-zinc-200 text-jepang-black',
  pending_review: 'bg-yellow-300 text-jepang-black',
  published: 'bg-green-600 text-white',
  rejected: 'bg-jepang-red text-white',
  archived: 'bg-zinc-400 text-white',
};

const STATUS_LABELS = {
  draft: 'DRAFT',
  pending_review: 'PENDING',
  published: 'PUBLISHED',
  rejected: 'REJECTED',
  archived: 'ARCHIVED',
};

export default function MyArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const { data } = await api.get('/articles/my/list');
      setArticles(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (articleId) => {
    if (!window.confirm('Delete this article? This action cannot be undone.')) return;
    try {
      await api.delete(`/articles/${articleId}`);
      toast.success('Article deleted');
      loadArticles();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to delete');
    }
  };

  const handleSubmit = async (article) => {
    try {
      await api.put(`/articles/${article._id || article.id}`, { status: 'pending_review' });
      toast.success('Article submitted for review');
      loadArticles();
    } catch (e) {
      toast.error('Failed to submit');
    }
  };

  const filtered = filter === 'all' ? articles : articles.filter((a) => a.status === filter);

  return (
    <div className="bg-white min-h-screen" data-testid="my-articles-page">
      <section className="border-b-2 border-jepang-black bg-jepang-off-white">
        <div className="px-4 md:px-8 lg:px-12 py-12">
          <div className="flex items-center justify-between">
            <div>
              <p className="small-caps text-jepang-red mb-2">MY ARTICLES</p>
              <h1 className="font-heading font-black text-4xl tracking-tighter">Your Articles</h1>
            </div>
            <Link to="/submit-article" className="jepang-btn-primary inline-flex items-center gap-2" data-testid="new-article-btn">
              <Plus size={16} strokeWidth={1.5} /> New Article
            </Link>
          </div>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-12 py-8">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'draft', 'pending_review', 'published', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs uppercase tracking-wider font-bold px-3 py-2 border ${filter === s ? 'bg-jepang-black text-white border-jepang-black' : 'border-jepang-border hover:border-jepang-black'}`}
              data-testid={`filter-${s}`}
            >
              {s === 'all' ? 'All' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Articles List */}
        {loading ? (
          <p className="text-center small-caps text-jepang-muted py-12">Loading...</p>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((article) => (
              <div key={article.id} className="bg-white border border-jepang-border hover:border-jepang-black p-4 transition-colors" data-testid={`my-article-${article.id}`}>
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 ${STATUS_COLORS[article.status]}`}>
                        {STATUS_LABELS[article.status]}
                      </span>
                      {article.category && <span className="jepang-badge">{article.category.name}</span>}
                    </div>
                    <h3 className="font-heading font-bold text-lg">{article.title}</h3>
                    {article.excerpt && <p className="text-sm text-jepang-muted line-clamp-1 mt-1">{article.excerpt}</p>}
                  </div>
                  <div className="flex gap-2">
                    {(article.status === 'draft' || article.status === 'rejected') && (
                      <>
                        <button onClick={() => navigate(`/edit-article/${article.id}`)} className="p-2 border border-jepang-border hover:border-jepang-black" data-testid={`edit-${article.id}`}>
                          <Edit size={14} strokeWidth={1.5} />
                        </button>
                        <button onClick={() => handleSubmit(article)} className="p-2 border border-jepang-red bg-jepang-red text-white hover:opacity-90" data-testid={`submit-${article.id}`} title="Submit for review">
                          <Send size={14} strokeWidth={1.5} />
                        </button>
                      </>
                    )}
                    {article.status !== 'published' && (
                      <button onClick={() => handleDelete(article._id || article.id)} className="p-2 border border-jepang-border hover:border-jepang-red hover:text-jepang-red" data-testid={`delete-${article.id}`}>
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    )}
                    {article.status === 'published' && (
                      <Link to={`/articles/${article.slug}`} className="text-xs uppercase tracking-wider font-bold px-3 py-2 border border-jepang-black hover:bg-jepang-black hover:text-white transition-colors" data-testid={`view-${article.id}`}>
                        View
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24" data-testid="no-my-articles">
            <FileText size={48} strokeWidth={1.5} className="mx-auto mb-4 text-jepang-muted" />
            <p className="font-heading font-bold text-2xl mb-2">No articles {filter !== 'all' && `in ${STATUS_LABELS[filter]}`}</p>
            <p className="text-jepang-muted mb-4">Start writing and share your stories!</p>
            <Link to="/submit-article" className="jepang-btn-primary inline-flex items-center gap-2">
              <Plus size={16} strokeWidth={1.5} /> Submit Article
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
