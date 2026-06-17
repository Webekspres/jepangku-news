import type { LeaderboardPeriod } from '@/lib/leaderboard/period';

type LeaderboardScoreProps = {
  period: LeaderboardPeriod;
  periodPoints: number;
  totalPoints: number;
  variant?: 'row' | 'podium';
  /** Light text on dark podium (e.g. #1 on red background) */
  inverted?: boolean;
  /** Homepage sidebar: hanya angka poin periode, tanpa label total */
  compact?: boolean;
};

export default function LeaderboardScore({
  period,
  periodPoints,
  totalPoints,
  variant = 'row',
  inverted = false,
  compact = false,
}: LeaderboardScoreProps) {
  const isPodium = variant === 'podium';
  const accentClass = inverted ? 'text-white' : 'text-jepang-red';
  const mutedClass = inverted ? 'text-white/70' : 'text-jepang-muted';
  const totalClass = inverted ? 'text-white' : 'text-foreground';

  if (compact) {
    return (
      <span
        className={`font-mono font-black tabular-nums ${accentClass} text-lg`}
        title={`${periodPoints} poin`}
      >
        {periodPoints}
      </span>
    );
  }

  if (period === 'sepanjang-waktu') {
    return (
      <div className={isPodium ? 'text-center' : 'text-right'}>
        <p
          className={`font-mono font-black ${accentClass} ${
            isPodium ? 'text-3xl' : 'text-xl'
          }`}
        >
          {totalPoints}
        </p>
        <p className={`text-[10px] uppercase tracking-wider ${mutedClass}`}>
          Total poin
        </p>
      </div>
    );
  }

  const periodLabel = period === 'weekly' ? 'Poin minggu ini' : 'Poin bulan ini';

  return (
    <div className={isPodium ? 'text-center' : 'text-right'}>
      <div
        className={`flex items-baseline gap-1 ${
          isPodium ? 'justify-center' : 'justify-end'
        }`}
        title={`${periodLabel}: ${periodPoints} · Total: ${totalPoints}`}
      >
        <span
          className={`font-mono font-black ${accentClass} ${
            isPodium ? 'text-2xl' : 'text-xl'
          }`}
        >
          {periodPoints}
        </span>
        <span className={`text-sm font-mono ${mutedClass}`}>/</span>
        <span className={`font-mono text-sm font-semibold ${totalClass}`}>
          {totalPoints}
        </span>
      </div>
    </div>
  );
}
