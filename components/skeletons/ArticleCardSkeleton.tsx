interface ArticleCardSkeletonProps {
  variant?: "default" | "featured" | "compact";
}

export default function ArticleCardSkeleton({
  variant = "default",
}: ArticleCardSkeletonProps) {
  if (variant === "featured") {
    return (
      <div className="group block relative h-115 md:h-140 overflow-hidden border border-jepang-black bg-jepang-red/10 animate-pulse" />
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex gap-3 py-4 border-b border-jepang-border last:border-b-0">
        <div className="w-20 h-20 shrink-0 bg-jepang-red/10 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-jepang-red/10 rounded animate-pulse w-1/3" />
          <div className="h-5 bg-jepang-red/10 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-jepang-red/10 rounded animate-pulse w-1/4 mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="block bg-white border border-jepang-border animate-pulse">
      <div className="aspect-16/10 bg-jepang-red/10 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-jepang-red/10 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-6 bg-jepang-red/10 rounded animate-pulse w-full" />
          <div className="h-6 bg-jepang-red/10 rounded animate-pulse w-4/5" />
        </div>
        <div className="h-4 bg-jepang-red/10 rounded animate-pulse w-full" />
        <div className="h-4 bg-jepang-red/10 rounded animate-pulse w-3/4" />
        <div className="pt-3 border-t border-jepang-border flex justify-between">
          <div className="h-3 bg-jepang-red/10 rounded animate-pulse w-1/4" />
          <div className="h-3 bg-jepang-red/10 rounded animate-pulse w-1/4" />
        </div>
      </div>
    </div>
  );
}
