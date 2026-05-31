'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Award, FileText, Bookmark } from 'lucide-react';

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    fetch(`/api/admin/users/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [id]);


  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><p className="small-caps text-jepang-muted">Loading...</p></div>;
  if (!data) return null;

  const { user, articles, recentTransactions, stats } = data;

  return (
    <div className="bg-white min-h-screen" data-testid="admin-user-detail-page">
      <section className="border-b-2 border-jepang-black bg-jepang-off-white">
        <div className="px-4 md:px-8 lg:px-12 py-8">
          <Link href="/admin/users" className="inline-flex items-center gap-2 small-caps text-jepang-muted hover:text-jepang-red mb-4"><ArrowLeft size={14} /> Back to Users</Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-jepang-black text-white flex items-center justify-center font-heading font-black text-2xl">{user.name?.charAt(0).toUpperCase()}</div>
            <div>
              <h1 className="font-heading font-black text-3xl tracking-tighter">{user.name}</h1>
              <p className="text-jepang-muted font-mono">@{user.username} • {user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 ${user.role === 'ADMIN' ? 'bg-jepang-red text-white' : 'bg-zinc-200 text-jepang-black'}`}>{user.role}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 ${user.status === 'active' ? 'bg-green-600 text-white' : 'bg-zinc-400 text-white'}`}>{user.status}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-12 py-8 max-w-5xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Award, value: user.totalPoints || 0, label: 'Total Points', red: true },
            { icon: FileText, value: stats?.articleCount || 0, label: 'Articles' },
            { icon: Bookmark, value: stats?.bookmarkCount || 0, label: 'Bookmarks' },
            { icon: Award, value: stats?.quizAttempts || 0, label: 'Quiz Attempts' },
          ].map(({ icon: Icon, value, label, red }, i) => (
            <div key={i} className={`p-5 border ${red ? 'bg-jepang-red text-white border-jepang-red' : 'bg-white border-jepang-black'}`}>
              <Icon size={24} strokeWidth={1.5} className="mb-2" />
              <p className="font-mono font-black text-3xl">{value}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Articles */}
        <div className="bg-white border border-jepang-black mb-6">
          <div className="p-4 border-b border-jepang-border bg-jepang-off-white"><h2 className="small-caps">ARTICLES ({articles?.length || 0})</h2></div>
          {articles?.length > 0 ? (
            <div className="divide-y divide-jepang-border">
              {articles.map((a: any) => (
                <div key={a.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{a.title}</p>
                    <p className="text-xs text-jepang-muted font-mono uppercase">{a.status} • {new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                  {a.status === 'PUBLISHED' && <Link href={`/articles/${a.slug}`} className="text-xs uppercase tracking-wider font-bold text-jepang-red hover:underline">View</Link>}
                </div>
              ))}
            </div>
          ) : <p className="p-6 text-center text-jepang-muted text-sm">No articles</p>}
        </div>

        {/* Recent Points */}
        <div className="bg-white border border-jepang-black">
          <div className="p-4 border-b border-jepang-border bg-jepang-off-white"><h2 className="small-caps">RECENT POINT TRANSACTIONS</h2></div>
          {recentTransactions?.length > 0 ? (
            <div className="divide-y divide-jepang-border">
              {recentTransactions.map((t: any, i: number) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{t.description || t.activityType}</p>
                    <p className="text-xs text-jepang-muted font-mono uppercase">{new Date(t.occurredAt).toLocaleString()}</p>
                  </div>
                  <p className="font-mono font-bold text-jepang-red">+{t.points}</p>
                </div>
              ))}
            </div>
          ) : <p className="p-6 text-center text-jepang-muted text-sm">No transactions</p>}
        </div>
      </div>
    </div>
  );
}
