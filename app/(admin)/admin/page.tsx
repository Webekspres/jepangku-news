'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FileText, Users, Zap, MessageSquare, Eye, CheckSquare, Tag, Home } from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [pendingArticles, setPendingArticles] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && (!user || (user as any).role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, loading]);

  useEffect(() => {
    if (!user || (user as any).role !== 'ADMIN') return;
    Promise.all([
      fetch('/api/admin/stats').then((r) => r.json()),
      fetch('/api/admin/articles/pending').then((r) => r.json()),
    ]).then(([s, p]) => {
      setStats(s);
      setPendingArticles(Array.isArray(p) ? p.slice(0, 5) : []);
    });
  }, [user]);

  if (loading || !user || (user as any).role !== 'ADMIN') return null;

  const statCards = [
    { label: 'Total Articles', value: stats?.totalArticles || 0, icon: FileText, link: '/admin/articles' },
    { label: 'Pending Review', value: stats?.pendingArticles || 0, icon: CheckSquare, link: '/admin/articles/review', highlight: true },
    { label: 'Published', value: stats?.publishedArticles || 0, icon: Eye, link: '/admin/articles' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, link: '/admin/users' },
    { label: 'Quizzes', value: stats?.totalQuizzes || 0, icon: Zap, link: '/admin/quizzes/create' },
    { label: 'Polls', value: stats?.totalPolls || 0, icon: MessageSquare, link: '/admin/polls/create' },
  ];

  return (
    <div className="bg-white min-h-screen justify-center items-center" data-testid="admin-dashboard">
      <section className="border-b-2 border-jepang-black bg-jepang-black text-white">
        <div className="px-4 mx-auto max-w-7xl py-12">
          <p className="small-caps text-jepang-red mb-2">管理 / ADMIN</p>
          <h1 className="font-heading font-black text-4xl tracking-tighter">Admin Dashboard</h1>
          <p className="text-zinc-300 mt-2">Manage your Jepangku portal</p>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Link key={idx} href={stat.link} className={`block p-5 border transition-colors ${(stat as any).highlight ? 'bg-jepang-red text-white border-jepang-red hover:opacity-90' : 'bg-white border-jepang-border hover:border-jepang-black'}`} data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <Icon size={20} strokeWidth={1.5} className="mb-3" />
                <p className="font-mono font-black text-3xl">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold mt-1">{stat.label}</p>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Link href="/admin/articles/review" className="bg-jepang-red text-white p-6 hover:opacity-90 transition-opacity" data-testid="action-review">
            <CheckSquare size={28} strokeWidth={1.5} className="mb-3" />
            <p className="font-heading font-bold text-xl">Review Articles</p>
            <p className="text-sm opacity-80 mt-1">{stats?.pendingArticles || 0} articles waiting</p>
          </Link>
          <Link href="/admin/quizzes/create" className="bg-jepang-black text-white p-6 hover:opacity-90 transition-opacity" data-testid="action-create-quiz">
            <Zap size={28} strokeWidth={1.5} className="mb-3" />
            <p className="font-heading font-bold text-xl">Create Quiz</p>
            <p className="text-sm opacity-80 mt-1">Add new trivia quiz</p>
          </Link>
          <Link href="/admin/polls/create" className="bg-white border border-jepang-black p-6 hover:bg-jepang-off-white transition-colors" data-testid="action-create-poll">
            <MessageSquare size={28} strokeWidth={1.5} className="mb-3" />
            <p className="font-heading font-bold text-xl">Create Poll</p>
            <p className="text-sm text-jepang-muted mt-1">Add polling or voting</p>
          </Link>
        </div>

        {/* Management Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {[
            { href: '/admin/users', icon: Users, label: 'Manage Users', testid: 'action-manage-users' },
            { href: '/admin/tags', icon: Tag, label: 'Manage Tags', testid: 'action-manage-tags' },
            { href: '/admin/homepage', icon: Home, label: 'Homepage Settings', testid: 'action-manage-homepage' },
            { href: '/admin/articles', icon: FileText, label: 'All Articles', testid: 'action-manage-articles' },
          ].map(({ href, icon: Icon, label, testid }) => (
            <Link key={href} href={href} className="border border-jepang-border hover:border-jepang-black p-4 transition-colors flex flex-col items-center text-center" data-testid={testid}>
              <Icon size={20} strokeWidth={1.5} className="mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider">{label}</p>
            </Link>
          ))}
        </div>

        {/* Recent Pending */}
        <div className="bg-white border border-jepang-black">
          <div className="p-4 border-b border-jepang-border bg-jepang-off-white flex items-center justify-between">
            <h2 className="small-caps">RECENT PENDING ARTICLES</h2>
            <Link href="/admin/articles/review" className="text-xs uppercase tracking-wider font-bold text-jepang-red hover:underline" data-testid="view-all-pending">View All →</Link>
          </div>
          {pendingArticles.length > 0 ? (
            <div className="divide-y divide-jepang-border">
              {pendingArticles.map((article: any) => (
                <div key={article.id} className="p-4 flex items-center gap-4" data-testid={`pending-${article.id}`}>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{article.title}</h3>
                    <p className="text-xs text-jepang-muted font-mono uppercase tracking-wider">BY {article.author?.name} • {new Date(article.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Link href="/admin/articles/review" className="jepang-btn-outline text-xs px-3 py-1" data-testid={`review-${article.id}`}>Review</Link>
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
