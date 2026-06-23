import { Calendar, Eye } from "lucide-react";

type VideoDetailMetaBarProps = {
  isLoading: boolean;
  viewCount?: number;
  publishedAt?: string | null;
};

function formatPublishedDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function VideoDetailMetaBar({
  isLoading,
  viewCount,
  publishedAt,
}: VideoDetailMetaBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-y border-jepang-border py-4 text-sm">
      <div className="flex items-center gap-2 text-jepang-muted">
        <Eye size={14} strokeWidth={1.5} className="shrink-0" />
        {isLoading ? (
          <span className="inline-block h-4 w-16 animate-pulse rounded bg-jepang-border" />
        ) : (
          <span className="text-[10px] font-mono uppercase tracking-wider">
            {(viewCount ?? 0).toLocaleString("id-ID")} views
          </span>
        )}
      </div>

      {publishedAt ? (
        <div className="flex items-center gap-2 text-jepang-muted">
          <Calendar size={14} strokeWidth={1.5} className="shrink-0" />
          {isLoading ? (
            <span className="inline-block h-4 w-28 animate-pulse rounded bg-jepang-border" />
          ) : (
            <span className="text-[10px] font-mono uppercase tracking-wider">
              {formatPublishedDate(publishedAt)}
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}
