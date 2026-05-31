interface PollQuizCardSkeletonProps {
  isDark?: boolean;
}

export default function PollQuizCardSkeleton({
  isDark = false,
}: PollQuizCardSkeletonProps) {
  return (
    <div
      className={`p-6 animate-pulse ${isDark ? "bg-jepang-black/20" : "bg-jepang-red/10"}`}
    >
      <div className="space-y-4">
        <div
          className={`h-6 w-20 rounded animate-pulse ${isDark ? "bg-zinc-700" : "bg-jepang-red/10"}`}
        />
        <div className="space-y-2">
          <div
            className={`h-7 rounded animate-pulse w-3/4 ${isDark ? "bg-zinc-700" : "bg-jepang-red/10"}`}
          />
          <div
            className={`h-5 rounded animate-pulse w-1/2 ${isDark ? "bg-zinc-700" : "bg-jepang-red/10"}`}
          />
        </div>
        <div
          className={`h-10 rounded animate-pulse w-32 ${isDark ? "bg-zinc-700" : "bg-jepang-red/10"}`}
        />
      </div>
    </div>
  );
}
