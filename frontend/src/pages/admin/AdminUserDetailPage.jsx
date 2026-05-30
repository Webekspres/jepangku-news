import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { ArrowLeft, Award, FileText, Bookmark, Zap, MessageSquare, Shield } from 'lucide-react';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      const { data } = await api.get(`/admin/users/${id}`);
      setData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><p className="small-caps text-jepang-muted">Loading...</p></div>;
  if (!data) return <div className="min-h-[60vh] flex items-center justify-center"><p className="small-caps text-jepang-muted">User not found</p></div>;

  const { user, articles, recent_transactions, stats } = data;

  return (
    <div className="bg-white min-h-screen" data-testid="admin-user-detail-page">
      <section className="border-b-2 border-jepang-black bg-jepang-off-white">
        <div className="px-4 md:px-8 lg:px-12 py-8">
          <Link to="/admin/users" className="inline-flex items-center gap-2 small-caps text-jepang-muted hover:text-jepang-red mb-4">
            <ArrowLeft size={14} /> Back to Users
          </Link>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-jepang-black text-white flex items-center justify-center font-heading font-black text-3xl border-2 border-jepang-black">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="small-caps text-jepang-red mb-1">{user.role === 'admin' ? <span className="inline-flex items-center gap-1"><Shield size={12} /> ADMIN</span> : 'USER'}</p>
              <h1 className="font-heading font-black text-3xl tracking-tighter">{user.name}</h1>
              <p className="text-jepang-muted font-mono text-sm">@{user.username} · {user.email}</p>
              <p className="text-xs text-jepang-muted font-mono uppercase tracking-wider mt-1">Joined {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-12 py-8 max-w-6xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-jepang-red text-white p-5 border border-jepang-red">
            <Award size={24} strokeWidth={1.5} className="mb-2" />
            <p className="font-mono font-black text-3xl">{user.total_points || 0}</p>
            <p className="text-[10px] uppercase tracking-wider mt-1">TOTAL POINTS</p>
          </div>
          <div className="bg-white border border-jepang-black p-5">
            <FileText size={24} strokeWidth={1.5} className="mb-2" />
            <p className="font-mono font-black text-3xl">{stats.article_count || 0}</p>
            <p className="text-[10px] uppercase tracking-wider mt-1 text-jepang-muted">ARTICLES</p>
          </div>
          <div className="bg-white border border-jepang-black p-5">
            <Bookmark size={24} strokeWidth={1.5} className="mb-2" />
            <p className="font-mono font-black text-3xl">{stats.bookmark_count || 0}</p>
            <p className="text-[10px] uppercase tracking-wider mt-1 text-jepang-muted">BOOKMARKS</p>
          </div>
          <div className="bg-white border border-jepang-black p-5">
            <Zap size={24} strokeWidth={1.5} className="mb-2" />
            <p className="font-mono font-black text-3xl">{stats.quiz_attempts || 0}</p>
            <p className="text-[10px] uppercase tracking-wider mt-1 text-jepang-muted">QUIZ ATTEMPTS</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Articles */}
          <div className="bg-white border border-jepang-black">
            <div className="p-4 border-b border-jepang-border bg-jepang-off-white">
              <h2 className="small-caps">USER ARTICLES ({articles.length})</h2>
            </div>
            {articles.length > 0 ? (
              <div className="divide-y divide-jepang-border max-h-96 overflow-y-auto">
                {articles.map((article) => (
                  <div key={article.id} className="p-3" data-testid={`user-article-${article.id}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 ${article.status === 'published' ? 'bg-green-600 text-white' : article.status === 'rejected' ? 'bg-jepang-red text-white' : 'bg-zinc-200'}`}>
                        {article.status}
                      </span>
                    </div>
                    <p className="font-semibold text-sm line-clamp-2">{article.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-jepang-muted text-sm p-6">No articles</p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-jepang-black">
            <div className="p-4 border-b border-jepang-border bg-jepang-off-white">
              <h2 className="small-caps">RECENT POINT ACTIVITY</h2>
            </div>
            {recent_transactions.length > 0 ? (
              <div className="divide-y divide-jepang-border max-h-96 overflow-y-auto">
                {recent_transactions.map((t, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between" data-testid={`user-activity-${idx}`}>
                    <div>
                      <p className="text-sm font-semibold">{t.description || t.activity_type}</p>
                      <p className="text-xs text-jepang-muted font-mono">{new Date(t.occurred_at).toLocaleString()}</p>
                    </div>
                    <p className="font-mono font-bold text-jepang-red">+{t.points}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-jepang-muted text-sm p-6">No activity yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
