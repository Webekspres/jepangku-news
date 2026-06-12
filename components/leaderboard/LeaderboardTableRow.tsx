import AuthorLink from "@/components/AuthorLink";
import LeaderboardAvatar from "@/components/leaderboard/LeaderboardAvatar";
import LeaderboardScore from "@/components/leaderboard/LeaderboardScore";
import type { LeaderboardEntry } from "@/lib/leaderboard/types";
import type { LeaderboardPeriod } from "@/lib/leaderboard/period";

const TOP_DISPLAY_LIMIT = 10;

export function formatLeaderboardRank(rank: number): string {
  if (rank > 99) return "99+";
  return String(rank);
}

type LeaderboardTableRowProps = {
  entry: LeaderboardEntry;
  period: LeaderboardPeriod;
  isCurrentUser?: boolean;
};

export default function LeaderboardTableRow({
  entry,
  period,
  isCurrentUser = false,
}: LeaderboardTableRowProps) {
  const showCompactRank = entry.rank > TOP_DISPLAY_LIMIT;

  return (
    <div
      className={`flex items-center gap-4 px-6 py-4 border-b border-jepang-border last:border-b-0 ${
        isCurrentUser
          ? "bg-gradient-to-r from-jepang-red/8 via-purple-50/80 to-jepang-red/5"
          : entry.rank <= 3
            ? "bg-jepang-off-white"
            : ""
      }`}
      data-testid={
        isCurrentUser
          ? "leaderboard-entry-current-user"
          : `leaderboard-entry-${entry.rank}`
      }
    >
      <span
        className={`font-mono font-black text-2xl w-12 shrink-0 ${
          entry.rank === 1 && !isCurrentUser
            ? "text-jepang-red"
            : "text-foreground"
        }`}
      >
        {showCompactRank ? formatLeaderboardRank(entry.rank) : `#${entry.rank}`}
      </span>
      <LeaderboardAvatar
        avatarUrl={entry.avatarUrl}
        displayName={entry.displayName}
      />
      <div className="flex-1 min-w-0">
        <AuthorLink
          username={entry.profileLinked ? entry.username : null}
          className="font-semibold truncate block"
        >
          {entry.displayName}
          {isCurrentUser ? (
            <span className="text-jepang-muted font-normal"> (Anda)</span>
          ) : null}
        </AuthorLink>
        <AuthorLink
          username={entry.profileLinked ? entry.username : null}
          className="text-xs text-jepang-muted font-mono block"
        >
          @{entry.username}
        </AuthorLink>
      </div>
      <LeaderboardScore
        period={period}
        periodPoints={entry.periodPoints}
        totalPoints={entry.totalPoints}
      />
    </div>
  );
}

export function LeaderboardTableSeparator() {
  return (
    <div
      className="flex items-center gap-4 px-6 py-3 border-b border-jepang-border bg-white text-jepang-muted text-center text-lg tracking-widest"
      data-testid="leaderboard-separator"
      aria-hidden
    >
      <span className="w-12 shrink-0">…</span>
      <span className="w-10 shrink-0" />
      <span className="flex-1">…</span>
      <span className="shrink-0">…</span>
    </div>
  );
}
