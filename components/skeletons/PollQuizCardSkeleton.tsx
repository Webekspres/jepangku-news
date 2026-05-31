import { Card, CardContent } from "@/components/ui/card";

interface PollQuizCardSkeletonProps {
  isDark?: boolean;
}

export default function PollQuizCardSkeleton({
  isDark = false,
}: PollQuizCardSkeletonProps) {
  const baseBg = isDark ? "bg-zinc-700" : "bg-jepang-red/10";

  return (
    <Card className="h-full border border-jepang-border animate-pulse bg-white">
      <div className="aspect-video bg-jepang-off-white" />
      <CardContent className="space-y-4 p-5 pt-4">
        <div className={`h-6 w-20 rounded ${baseBg}`} />
        <div className="space-y-2">
          <div className={`h-7 rounded ${baseBg}`} />
          <div className={`h-5 rounded w-1/2 ${baseBg}`} />
        </div>
        <div className={`h-10 rounded w-32 ${baseBg}`} />
      </CardContent>
    </Card>
  );
}
