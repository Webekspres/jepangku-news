export default function LeaderboardRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-jepang-border last:border-b-0 animate-pulse">
      <div className="w-10 h-6 bg-[#D90429]/10 rounded animate-pulse" />
      <div className="w-10 h-10 bg-[#D90429]/10 rounded animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[#D90429]/10 rounded animate-pulse w-1/4" />
        <div className="h-3 bg-[#D90429]/10 rounded animate-pulse w-1/3" />
      </div>
      <div className="space-y-2 text-right">
        <div className="h-5 bg-[#D90429]/10 rounded animate-pulse w-12 ml-auto" />
        <div className="h-3 bg-[#D90429]/10 rounded animate-pulse w-10 ml-auto" />
      </div>
    </div>
  );
}
