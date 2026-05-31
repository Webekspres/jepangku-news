'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Award, FileText, Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    fetch(`/api/admin/users/${id}`).then((r) => r.json()).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#52525B]">Loading...</p>
    </div>
  );
  if (!data) return null;

  const { user, articles, recentTransactions, stats } = data;

  return (
    <div className="bg-white min-h-screen" data-testid="admin-user-detail-page">
      <section className="border-b-2 border-[#0A0A0A] bg-[#F4F4F5]">
        <div className="px-4 mx-auto max-w-7xl py-8">
          <Link href="/admin/users" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#52525B] hover:text-[#D90429] mb-4">
            <ArrowLeft size={14} /> Back to Users
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#0A0A0A] text-white flex items-center justify-center font-heading font-black text-2xl">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-heading font-black text-3xl tracking-tighter">{user.name}</h1>
              <p className="text-[#52525B] font-mono">@{user.username} • {user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={user.role === 'ADMIN' ? 'red' : 'muted'}>{user.role}</Badge>
                <Badge variant={user.status === 'active' ? 'success' : 'muted'}>{user.status}</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Award, value: user.totalPoints || 0, label: 'Total Points', red: true },
            { icon: FileText, value: stats?.articleCount || 0, label: 'Articles' },
            { icon: Bookmark, value: stats?.bookmarkCount || 0, label: 'Bookmarks' },
            { icon: Award, value: stats?.quizAttempts || 0, label: 'Quiz Attempts' },
          ].map(({ icon: Icon, value, label, red }, i) => (
            <div
              key={i}
              className={`p-5 border ${red ? 'bg-[#D90429] text-white border-[#D90429]' : 'bg-white border-[#0A0A0A]'}`}
            >
              <Icon size={24} strokeWidth={1.5} className="mb-2" />
              <p className="font-mono font-black text-3xl">{value}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold mt-1">{label}</p>
            </div>
          ))}
        </div>

        <Card className="border border-[#0A0A0A] mb-6">
          <CardHeader className="border-b border-[#E4E4E7] bg-[#F4F4F5] py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">ARTICLES ({articles?.length || 0})</p>
          </CardHeader>
          <CardContent className="p-0">
            {articles?.length > 0 ? (
              <div className="divide-y divide-[#E4E4E7]">
                {articles.map((a: any) => (
                  <div key={a.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{a.title}</p>
                      <p className="text-xs text-[#52525B] font-mono uppercase">
                        {a.status} • {new Date(a.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {a.status === 'PUBLISHED' && (
                      <Link href={`/articles/${a.slug}`} className="text-xs uppercase tracking-wider font-bold text-[#D90429] hover:underline">
                        View
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-6 text-center text-[#52525B] text-sm">No articles</p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-[#0A0A0A]">
          <CardHeader className="border-b border-[#E4E4E7] bg-[#F4F4F5] py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">RECENT POINT TRANSACTIONS</p>
          </CardHeader>
          <CardContent className="p-0">
            {recentTransactions?.length > 0 ? (
              <div className="divide-y divide-[#E4E4E7]">
                {recentTransactions.map((t: any, i: number) => (
                  <div key={i} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{t.description || t.activityType}</p>
                      <p className="text-xs text-[#52525B] font-mono uppercase">
                        {new Date(t.occurredAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="font-mono font-bold text-[#D90429]">+{t.points}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-6 text-center text-[#52525B] text-sm">No transactions</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
