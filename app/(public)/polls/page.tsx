'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { MessageSquare, Award, BarChart3 } from 'lucide-react';

export default function PollListPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);

  useEffect(() => { loadPolls(); }, []);

  const loadPolls = () => {
    fetch('/api/polls?status=ACTIVE').then((r) => r.json()).then((d) => { setPolls(Array.isArray(d) ? d : []); setLoading(false); });
  };

  const handleVote = async (pollId: string, optionId: string, pollSlug: string) => {
    if (!user) { toast.error('Please login to vote'); router.push('/login'); return; }
    setVoting(pollId);
    try {
      const data = await fetch(`/api/polls/${pollSlug}/vote`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ option_id: optionId }) }).then((r) => { if (!r.ok) return r.json().then((e) => { throw new Error(e.error); }); return r.json(); });
      toast.success('+5 points for voting!');
      refreshUser();
      loadPolls();
    } catch (e: any) { toast.error(e.message || 'Failed to vote'); }
    finally { setVoting(null); }
  };

  return (
    <div className="bg-white min-h-screen" data-testid="poll-list-page">
      <section className="border-b-2 border-jepang-black bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl py-12">
          <p className="small-caps text-jepang-red mb-2">投票 / POLLS</p>
          <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-3">Polling & Voting</h1>
          <p className="text-jepang-muted max-w-2xl">Suarakan pendapatmu dan ikuti aktivitas voting komunitas Jepangku!</p>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-12">
        {loading ? (
          <p className="text-center small-caps text-jepang-muted py-12">Loading polls...</p>
        ) : polls.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {polls.map((poll: any) => {
              const totalVotes = poll.options?.reduce((sum: number, opt: any) => sum + (opt.voteCount || 0), 0) || 0;
              return (
                <div key={poll.id} className="bg-white border border-jepang-black p-6" data-testid={`poll-card-${poll.slug}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={poll.pollType === 'VOTING' ? 'jepang-badge-red' : 'jepang-badge-black'}>{poll.pollType?.toUpperCase()}</span>
                    <span className="flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-jepang-red font-bold"><Award size={12} strokeWidth={1.5} /> +{poll.pointsReward || 5} PTS</span>
                  </div>
                  <h3 className="font-heading font-bold text-2xl tracking-tight mb-4">{poll.title}</h3>
                  {poll.description && <p className="text-sm text-jepang-muted mb-4">{poll.description}</p>}
                  <div className="space-y-2 mb-4">
                    {poll.options?.map((option: any, idx: number) => {
                      const pct = totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0;
                      return (
                        <button key={option.id} onClick={() => handleVote(poll.id, option.id, poll.slug)} disabled={voting === poll.id} className="w-full text-left relative overflow-hidden border border-jepang-border hover:border-jepang-black transition-colors" data-testid={`poll-${poll.slug}-option-${idx}`}>
                          <div className="absolute inset-0 bg-jepang-red opacity-10" style={{ width: `${pct}%` }} />
                          <div className="relative flex items-center justify-between p-3">
                            <span className="font-semibold text-sm">{option.optionText}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono text-jepang-muted">{option.voteCount || 0}</span>
                              <span className="text-sm font-mono font-bold text-jepang-red">{pct}%</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="pt-3 border-t border-jepang-border flex items-center justify-between text-xs font-mono uppercase tracking-wider">
                    <span className="text-jepang-muted flex items-center gap-1"><BarChart3 size={12} strokeWidth={1.5} /> {totalVotes} TOTAL VOTES</span>
                    <Link href={`/polls/${poll.slug}`} className="text-jepang-red hover:underline font-bold" data-testid={`poll-detail-${poll.slug}`}>View Details →</Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24" data-testid="no-polls">
            <MessageSquare size={48} strokeWidth={1.5} className="mx-auto mb-4 text-jepang-muted" />
            <p className="font-heading font-bold text-2xl mb-2">No active polls</p>
            <p className="text-jepang-muted">Check back soon for new polls!</p>
          </div>
        )}
      </div>
    </div>
  );
}
