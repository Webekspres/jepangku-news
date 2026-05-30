import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { FileText, Users, Zap, MessageSquare, Eye, CheckSquare, Trophy, Tag, Home, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingArticles, setPendingArticles] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/articles/pending'),
      ]);
      setStats(statsRes.data);
      setPendingArticles(pendingRes.data?.slice(0, 5) || []);
    } catch (e) {
      console.error(e);
    }
  };

  const statCards = [
    { label: 'Total Articles', value: stats?.total_articles || 0, icon: FileText, link: '/admin/articles' },
    { label: 'Pending Review', value: stats?.pending_articles || 0, icon: CheckSquare, link: '/admin/articles/review', highlight: true },
    { label: 'Published', value: stats?.published_articles || 0, icon: Eye, link: '/admin/articles' },
    { label: 'Total Users', value: stats?.total_users || 0, icon: Users, link: '/admin/users' },
    { label: 'Quizzes', value: stats?.total_quizzes || 0, icon: Zap, link: '/admin/quizzes' },
    { label: 'Polls', value: stats?.total_polls || 0, icon: MessageSquare, link: '/admin/polls' },
  ];

  return (
    <div className="bg-white min-h-screen" data-testid="admin-dashboard">
      <section className="border-b-2 border-jepang-black bg-jepang-black text-white">
        <div className="px-4 md:px-8 lg:px-12 py-12">
          <p className="small-caps text-jepang-red mb-2">管理 / ADMIN</p>
          <h1 className="font-heading font-black text-4xl tracking-tighter">Admin Dashboard</h1>
          <p className="text-zinc-300 mt-2">Manage your Jepangku portal</p>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-12 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Link
                key={idx}
                to={stat.link}
                className={`block p-5 border transition-colors ${stat.highlight ? 'bg-jepang-red text-white border-jepang-red hover:bg-jepang-red-hover' : 'bg-white border-jepang-border hover:border-jepang-black'}`}
                data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon size={20} strokeWidth={1.5} className="mb-3" />
                <p className="font-mono font-black text-3xl">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold mt-1">{stat.label}</p>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Link to="/admin/articles/review" className="bg-jepang-red text-white p-6 hover:bg-jepang-red-hover transition-colors" data-testid="action-review">
            <CheckSquare size={28} strokeWidth={1.5} className="mb-3" />
            <p className="font-heading font-bold text-xl">Review Articles</p>
            <p className="text-sm opacity-80 mt-1">{stats?.pending_articles || 0} articles waiting</p>
          </Link>
          <Link to="/admin/quizzes/create" className="bg-jepang-black text-white p-6 hover:opacity-90 transition-opacity" data-testid="action-create-quiz">
            <Zap size={28} strokeWidth={1.5} className="mb-3" />
            <p className="font-heading font-bold text-xl">Create Quiz</p>
            <p className="text-sm opacity-80 mt-1">Add new trivia quiz</p>
          </Link>
          <Link to="/admin/polls/create" className="bg-white border border-jepang-black p-6 hover:bg-jepang-off-white transition-colors" data-testid="action-create-poll">
            <MessageSquare size={28} strokeWidth={1.5} className="mb-3" />
            <p className="font-heading font-bold text-xl">Create Poll</p>
            <p className="text-sm text-jepang-muted mt-1">Add polling or voting</p>
          </Link>
        </div>

        {/* Management Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          <Link to="/admin/users" className="border border-jepang-border hover:border-jepang-black p-4 transition-colors flex flex-col items-center text-center" data-testid="action-manage-users">
            <Users size={20} strokeWidth={1.5} className="mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider">Manage Users</p>
          </Link>
          <Link to="/admin/tags" className="border border-jepang-border hover:border-jepang-black p-4 transition-colors flex flex-col items-center text-center" data-testid="action-manage-tags">
            <Tag size={20} strokeWidth={1.5} className="mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider">Manage Tags</p>
          </Link>
          <Link to="/admin/homepage" className="border border-jepang-border hover:border-jepang-black p-4 transition-colors flex flex-col items-center text-center" data-testid="action-manage-homepage">
            <Home size={20} strokeWidth={1.5} className="mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider">Homepage Settings</p>
          </Link>
          <Link to="/admin/articles" className="border border-jepang-border hover:border-jepang-black p-4 transition-colors flex flex-col items-center text-center" data-testid="action-manage-articles">
            <FileText size={20} strokeWidth={1.5} className="mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider">All Articles</p>
          </Link>
        </div>

        {/* Recent Pending Articles */}
        <div className="bg-white border border-jepang-black">
          <div className="p-4 border-b border-jepang-border bg-jepang-off-white flex items-center justify-between">
            <h2 className="small-caps">RECENT PENDING ARTICLES</h2>
            <Link to="/admin/articles/review" className="text-xs uppercase tracking-wider font-bold text-jepang-red hover:underline" data-testid="view-all-pending">View All →</Link>
          </div>
          {pendingArticles.length > 0 ? (
            <div className="divide-y divide-jepang-border">
              {pendingArticles.map((article) => (
                <div key={article.id} className="p-4 flex items-center gap-4" data-testid={`pending-${article.id}`}>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{article.title}</h3>
                    <p className="text-xs text-jepang-muted font-mono uppercase tracking-wider">
                      BY {article.author?.name} • {new Date(article.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Link to={`/admin/articles/review`} className="jepang-btn-outline text-xs px-3 py-1" data-testid={`review-${article.id}`}>Review</Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-6 text-center text-jepang-muted text-sm">No pending articles</p>
          )}
        </div>
      </div>
    </div>
  );
}
