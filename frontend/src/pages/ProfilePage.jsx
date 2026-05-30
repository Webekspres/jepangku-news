import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Award, FileText, Bookmark as BookmarkIcon, BarChart3 } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ articles: 0, bookmarks: 0, points: 0 });
  const [recentPoints, setRecentPoints] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [articlesRes, bookmarksRes, pointsRes] = await Promise.all([
        api.get('/articles/my/list'),
        api.get('/bookmarks'),
        api.get('/points/my'),
      ]);
      setStats({
        articles: articlesRes.data?.length || 0,
        bookmarks: bookmarksRes.data?.length || 0,
        points: user?.total_points || 0,
      });
      setRecentPoints(pointsRes.data?.slice(0, 5) || []);
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white min-h-screen" data-testid="profile-page">
      <section className="border-b-2 border-jepang-black bg-jepang-off-white">
        <div className="px-4 md:px-8 lg:px-12 py-12">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-jepang-black text-white flex items-center justify-center font-heading font-black text-4xl border-2 border-jepang-black">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="small-caps text-jepang-red mb-2">PROFILE</p>
              <h1 className="font-heading font-black text-4xl tracking-tighter">{user.name}</h1>
              <p className="text-jepang-muted font-mono">@{user.username}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-12 py-12 max-w-5xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-jepang-red text-white p-6 border border-jepang-red">
            <Award size={32} strokeWidth={1.5} className="mb-3" />
            <p className="font-mono font-black text-4xl">{user.total_points || 0}</p>
            <p className="small-caps mt-1">TOTAL POINTS</p>
          </div>
          <div className="bg-white border border-jepang-black p-6">
            <FileText size={32} strokeWidth={1.5} className="mb-3 text-jepang-black" />
            <p className="font-mono font-black text-4xl">{stats.articles}</p>
            <p className="small-caps mt-1 text-jepang-muted">ARTICLES SUBMITTED</p>
          </div>
          <div className="bg-white border border-jepang-black p-6">
            <BookmarkIcon size={32} strokeWidth={1.5} className="mb-3 text-jepang-black" />
            <p className="font-mono font-black text-4xl">{stats.bookmarks}</p>
            <p className="small-caps mt-1 text-jepang-muted">BOOKMARKS</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-jepang-black p-6 mb-8">
          <h2 className="small-caps mb-4 pb-3 border-b border-jepang-border">QUICK ACTIONS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/submit-article" className="border border-jepang-border hover:border-jepang-black hover:bg-jepang-black hover:text-white transition-colors p-4 text-center" data-testid="action-submit-article">
              <FileText size={24} strokeWidth={1.5} className="mx-auto mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider">Submit</p>
            </Link>
            <Link to="/my-articles" className="border border-jepang-border hover:border-jepang-black hover:bg-jepang-black hover:text-white transition-colors p-4 text-center" data-testid="action-my-articles">
              <FileText size={24} strokeWidth={1.5} className="mx-auto mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider">My Articles</p>
            </Link>
            <Link to="/bookmarks" className="border border-jepang-border hover:border-jepang-black hover:bg-jepang-black hover:text-white transition-colors p-4 text-center" data-testid="action-bookmarks">
              <BookmarkIcon size={24} strokeWidth={1.5} className="mx-auto mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider">Bookmarks</p>
            </Link>
            <Link to="/points" className="border border-jepang-border hover:border-jepang-black hover:bg-jepang-black hover:text-white transition-colors p-4 text-center" data-testid="action-points">
              <BarChart3 size={24} strokeWidth={1.5} className="mx-auto mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider">Points</p>
            </Link>
          </div>
        </div>

        {/* Recent Points Activity */}
        <div className="bg-white border border-jepang-black p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-jepang-border">
            <h2 className="small-caps">RECENT ACTIVITY</h2>
            <Link to="/points" className="text-xs uppercase tracking-wider font-bold text-jepang-red hover:underline" data-testid="view-all-points">View All →</Link>
          </div>
          {recentPoints.length > 0 ? (
            <div className="divide-y divide-jepang-border">
              {recentPoints.map((t, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between" data-testid={`recent-point-${idx}`}>
                  <div>
                    <p className="text-sm font-semibold">{t.description || t.activity_type}</p>
                    <p className="text-xs text-jepang-muted font-mono uppercase tracking-wider">{new Date(t.occurred_at).toLocaleDateString()}</p>
                  </div>
                  <p className="font-mono font-bold text-jepang-red">+{t.points}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-jepang-muted py-6 text-sm">No activity yet. Start reading articles to earn points!</p>
          )}
        </div>
      </div>
    </div>
  );
}
