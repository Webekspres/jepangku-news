import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { MessageSquare, Award, BarChart3 } from 'lucide-react';

export default function PollListPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(null);

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      const { data } = await api.get('/polls?status=active');
      setPolls(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId, optionId) => {
    if (!user) {
      toast.error('Please login to vote');
      navigate('/login');
      return;
    }
    setVoting(pollId);
    try {
      await api.post(`/polls/${pollId}/vote`, { option_id: optionId });
      toast.success('+5 points for voting!');
      refreshUser();
      loadPolls();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to vote');
    } finally {
      setVoting(null);
    }
  };

  return (
    <div className="bg-white min-h-screen" data-testid="poll-list-page">
      <section className="border-b-2 border-jepang-black bg-jepang-off-white">
        <div className="px-4 md:px-8 lg:px-12 py-12">
          <p className="small-caps text-jepang-red mb-2">投票 / POLLS</p>
          <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-3">Polling & Voting</h1>
          <p className="text-jepang-muted max-w-2xl">Suarakan pendapatmu dan ikuti aktivitas voting komunitas Jepangku!</p>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-12 py-12">
        {loading ? (
          <p className="text-center small-caps text-jepang-muted py-12">Loading polls...</p>
        ) : polls.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {polls.map((poll) => {
              const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.vote_count || 0), 0);
              return (
                <div key={poll.id} className="bg-white border border-jepang-black p-6" data-testid={`poll-card-${poll.slug}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={poll.poll_type === 'voting' ? 'jepang-badge-red' : 'jepang-badge-black'}>
                      {poll.poll_type?.toUpperCase()}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-jepang-red font-bold">
                      <Award size={12} strokeWidth={1.5} /> +{poll.points_reward || 5} PTS
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-2xl tracking-tight mb-4">{poll.title}</h3>
                  {poll.description && <p className="text-sm text-jepang-muted mb-4">{poll.description}</p>}
                  
                  <div className="space-y-2 mb-4">
                    {poll.options.map((option, idx) => {
                      const percentage = totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0;
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleVote(poll.id, option.id)}
                          disabled={voting === poll.id}
                          className="w-full text-left relative overflow-hidden border border-jepang-border hover:border-jepang-black transition-colors"
                          data-testid={`poll-${poll.slug}-option-${idx}`}
                        >
                          <div className="absolute inset-0 bg-jepang-red opacity-10 transition-all" style={{ width: `${percentage}%` }} />
                          <div className="relative flex items-center justify-between p-3">
                            <span className="font-semibold text-sm">{option.option_text}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono text-jepang-muted">{option.vote_count || 0}</span>
                              <span className="text-sm font-mono font-bold text-jepang-red">{percentage}%</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t border-jepang-border flex items-center justify-between text-xs font-mono uppercase tracking-wider">
                    <span className="text-jepang-muted flex items-center gap-1"><BarChart3 size={12} strokeWidth={1.5} /> {totalVotes} TOTAL VOTES</span>
                    <Link to={`/polls/${poll.slug}`} className="text-jepang-red hover:underline font-bold" data-testid={`poll-detail-${poll.slug}`}>
                      View Details →
                    </Link>
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
