'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FileText, Users, Zap, MessageSquare, Eye, CheckSquare, Tag, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

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
    <div className="bg-white min-h-screen" data-testid="admin-dashboard">
      <section className="border-b-2 border-[#0A0A0A] bg-[#0A0A0A] text-white">
        <div className="px-4 mx-auto max-w-7xl py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D90429] mb-2">管理 / ADMIN</p>
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
              <Link
                key={idx}
                href={stat.link}
                className={`block p-5 border transition-colors ${(stat as any).highlight ? 'bg-[#D90429] text-white border-[#D90429] hover:opacity-90' : 'bg-white border-[#E4E4E7] hover:border-[#0A0A0A]'}`}
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
          <Link href="/admin/articles/review" className="bg-[#D90429] text-white p-6 hover:opacity-90 transition-opacity" data-testid="action-review">
            <CheckSquare size={28} strokeWidth={1.5} className="mb-3" />
            <p className="font-heading font-bold text-xl">Review Articles</p>
            <p className="text-sm opacity-80 mt-1">{stats?.pendingArticles || 0} articles waiting</p>
          </Link>
          <Link href="/admin/quizzes/create" className="bg-[#0A0A0A] text-white p-6 hover:opacity-90 transition-opacity" data-testid="action-create-quiz">
            <Zap size={28} strokeWidth={1.5} className="mb-3" />
            <p className="font-heading font-bold text-xl">Create Quiz</p>
            <p className="text-sm opacity-80 mt-1">Add new trivia quiz</p>
          </Link>
          <Link href="/admin/polls/create" className="bg-white border border-[#0A0A0A] p-6 hover:bg-[#F4F4F5] transition-colors" data-testid="action-create-poll">
            <MessageSquare size={28} strokeWidth={1.5} className="mb-3" />
            <p className="font-heading font-bold text-xl">Create Poll</p>
            <p className="text-sm text-[#52525B] mt-1">Add polling or voting</p>
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
            <Link
              key={href}
              href={href}
              className="border border-[#E4E4E7] hover:border-[#0A0A0A] p-4 transition-colors flex flex-col items-center text-center"
              data-testid={testid}
            >
              <Icon size={20} strokeWidth={1.5} className="mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider">{label}</p>
            </Link>
          ))}
        </div>

        {/* Recent Pending */}
        <Card className="border border-[#0A0A0A]">
          <CardHeader className="border-b border-[#E4E4E7] bg-[#F4F4F5] py-3 flex flex-row items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">RECENT PENDING ARTICLES</p>
            <Link href="/admin/articles/review" className="text-xs uppercase tracking-wider font-bold text-[#D90429] hover:underline" data-testid="view-all-pending">
              View All →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {pendingArticles.length > 0 ? (
              <div className="divide-y divide-[#E4E4E7]">
                {pendingArticles.map((article: any) => (
                  <div key={article.id} className="p-4 flex items-center gap-4" data-testid={`pending-${article.id}`}>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{article.title}</h3>
                      <p className="text-xs text-[#52525B] font-mono uppercase tracking-wider">
                        BY {article.author?.name} • {new Date(article.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild data-testid={`review-${article.id}`}>
                      <Link href="/admin/articles/review">Review</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-6 text-center text-[#52525B] text-sm">No pending articles</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
