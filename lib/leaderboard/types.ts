import type { LeaderboardPeriod } from './period';

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  displayName: string;
  username: string;
  profileLinked: boolean;
  avatarUrl: string | null;
  /** Score used for ranking in the selected period */
  periodPoints: number;
  /** Cumulative all-time portal points */
  totalPoints: number;
  period: LeaderboardPeriod;
};

export type LeaderboardResponse = {
  period: LeaderboardPeriod;
  periodLabel: string;
  items: LeaderboardEntry[];
};
