import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Award, BookOpen, Bookmark, Zap, MessageSquare, LogIn, Share2 } from 'lucide-react';

const ACTIVITY_ICONS = {
  article_read: BookOpen,
  article_bookmarked: Bookmark,
  quiz_completed: Zap,
  quiz_correct_answer: Award,
  poll_joined: MessageSquare,
  daily_login: LogIn,
  article_shared: Share2,
};

const ACTIVITY_LABELS = {
  article_read: 'Read Article',
  article_bookmarked: 'Bookmarked Article',
  quiz_completed: 'Completed Quiz',
  quiz_correct_answer: 'Correct Quiz Answer',
  poll_joined: 'Voted in Poll',
  daily_login: 'Daily Login',
  article_shared: 'Shared Article',
};

export default function PointsHistoryPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPoints();
  }, []);

  const loadPoints = async () => {
    try {
      const { data } = await api.get('/points/my');
      setTransactions(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen" data-testid="points-page">
      <section className="border-b-2 border-jepang-black bg-jepang-red text-white">
        <div className="px-4 md:px-8 lg:px-12 py-12">
          <p className="small-caps mb-2 opacity-80">POINTS HISTORY</p>
          <div className="flex items-center justify-between">
            <h1 className="font-heading font-black text-4xl tracking-tighter">Your Activity</h1>
            <div className="text-right">
              <p className="font-mono font-black text-5xl md:text-7xl">{user?.total_points || 0}</p>
              <p className="small-caps opacity-80">TOTAL POINTS</p>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-12 py-12 max-w-4xl mx-auto">
        {loading ? (
          <p className="text-center small-caps text-jepang-muted py-12">Loading...</p>
        ) : transactions.length > 0 ? (
          <div className="bg-white border border-jepang-black">
            <div className="p-4 border-b border-jepang-border bg-jepang-off-white">
              <h2 className="small-caps">RECENT TRANSACTIONS</h2>
            </div>
            <div className="divide-y divide-jepang-border">
              {transactions.map((t, idx) => {
                const Icon = ACTIVITY_ICONS[t.activity_type] || Award;
                const label = ACTIVITY_LABELS[t.activity_type] || t.activity_type;
                return (
                  <div key={idx} className="flex items-center gap-4 p-4" data-testid={`transaction-${idx}`}>
                    <div className="w-10 h-10 bg-jepang-off-white border border-jepang-border flex items-center justify-center">
                      <Icon size={18} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{t.description || label}</p>
                      <p className="text-xs text-jepang-muted font-mono uppercase tracking-wider">{new Date(t.occurred_at).toLocaleString()}</p>
                    </div>
                    <p className="font-mono font-black text-lg text-jepang-red">+{t.points}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-24" data-testid="no-transactions">
            <Award size={48} strokeWidth={1.5} className="mx-auto mb-4 text-jepang-muted" />
            <p className="font-heading font-bold text-2xl mb-2">No points yet</p>
            <p className="text-jepang-muted">Start reading articles and taking quizzes to earn points!</p>
          </div>
        )}
      </div>
    </div>
  );
}
