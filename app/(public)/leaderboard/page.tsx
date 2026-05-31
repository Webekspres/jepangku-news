'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Trophy, Award, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard/weekly').then((r) => r.json()).then((d) => {
      setLeaderboard(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-white min-h-screen" data-testid="leaderboard-page">
      <section className="border-b-2 border-[#0A0A0A] bg-[#0A0A0A] text-white">
        <div className="px-4 mx-auto max-w-7xl py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D90429] mb-2">ランキング / RANKINGS</p>
          <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-3 flex items-center gap-4">
            <Trophy size={48} strokeWidth={1.5} className="text-[#D90429]" /> Weekly Leaderboard
          </h1>
          <p className="text-zinc-300">Top performers minggu ini berdasarkan poin aktivitas.</p>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-12">
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#52525B] py-12">Loading rankings...</p>
          ) : leaderboard.length > 0 ? (
            <>
              {leaderboard.length >= 3 && (
                <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8">
                  {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry: any, idx: number) => {
                    const positions = [2, 1, 3];
                    const heights = ['h-32', 'h-44', 'h-28'];
                    const colors = ['bg-zinc-300', 'bg-[#D90429]', 'bg-zinc-200'];
                    const textColors = ['text-[#0A0A0A]', 'text-white', 'text-[#0A0A0A]'];
                    const realIdx = positions[idx];
                    return (
                      <div key={entry.userId} className="flex flex-col items-center" data-testid={`podium-${realIdx}`}>
                        <div className="mb-2">
                          {realIdx === 1 && <Crown size={32} strokeWidth={1.5} className="text-[#D90429]" />}
                        </div>
                        <div className="w-16 h-16 bg-[#0A0A0A] text-white flex items-center justify-center font-heading font-bold text-2xl border-2 border-[#0A0A0A] mb-2">
                          {entry.displayName?.charAt(0).toUpperCase() || 'J'}
                        </div>
                        <p className="font-bold text-sm text-center truncate w-full max-w-30">{entry.displayName}</p>
                        <p className="text-xs text-[#52525B] font-mono">@{entry.username}</p>
                        <div className={`${heights[idx]} ${colors[idx]} ${textColors[idx]} w-full flex flex-col items-center justify-end pb-3 mt-3 border-2 border-[#0A0A0A]`}>
                          <p className="font-mono font-black text-3xl">#{realIdx}</p>
                          <p className="text-xs font-mono">{entry.weeklyPoints} PTS</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <Card className="border border-[#0A0A0A]">
                <CardHeader className="border-b border-[#E4E4E7] bg-[#F4F4F5] py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">FULL RANKINGS</p>
                </CardHeader>
                <CardContent className="p-0">
                  {leaderboard.map((entry: any) => (
                    <div
                      key={entry.userId}
                      className={`flex items-center gap-4 px-6 py-4 border-b border-[#E4E4E7] last:border-b-0 ${entry.rank <= 3 ? 'bg-[#F4F4F5]' : ''}`}
                      data-testid={`leaderboard-entry-${entry.rank}`}
                    >
                      <span className={`font-mono font-black text-2xl w-12 ${entry.rank === 1 ? 'text-[#D90429]' : 'text-[#0A0A0A]'}`}>
                        #{entry.rank}
                      </span>
                      <div className="w-10 h-10 bg-[#0A0A0A] text-white flex items-center justify-center font-bold">
                        {entry.displayName?.charAt(0).toUpperCase() || 'J'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{entry.displayName}</p>
                        <p className="text-xs text-[#52525B] font-mono">@{entry.username}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-black text-xl text-[#D90429] flex items-center gap-1">
                          <Award size={14} strokeWidth={1.5} /> {entry.weeklyPoints}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-[#52525B]">POINTS</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-24" data-testid="empty-leaderboard">
              <Trophy size={48} strokeWidth={1.5} className="mx-auto mb-4 text-[#52525B]" />
              <p className="font-heading font-bold text-2xl mb-2">No rankings yet</p>
              <p className="text-[#52525B]">Be the first to earn points!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
