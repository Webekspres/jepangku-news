export default function TrendingArticleSkeleton() {
  return (
    <div className="flex gap-3 py-3 border-b border-jepang-border last:border-b-0 animate-pulse">
      <div className="w-6 h-6 bg-jepang-red/10 rounded animate-pulse shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-jepang-red/10 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-jepang-red/10 rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}
