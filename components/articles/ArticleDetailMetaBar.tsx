import { Bookmark, Calendar, Eye } from "lucide-react";
import AuthorLink from "@/components/AuthorLink";
import ArticleShareButtons from "@/components/ArticleShareButtons";
import UserAvatar from "@/components/media/UserAvatar";
import { Button } from "@/components/ui/button";
import type { ArticleDetailAuthor } from "@/lib/articles/detail-types";
import type { gamificationPatchFromResponse } from "@/lib/gamification-response";

type ArticleDetailMetaBarProps = {
  isLoading: boolean;
  author?: ArticleDetailAuthor;
  viewCount?: number;
  publishedAt?: string | null;
  isBookmarked: boolean;
  bookmarkDisabled: boolean;
  onBookmark: () => void;
  slug: string;
  title: string;
  shareUrl: string;
  isAuthenticated: boolean;
  hasShared: boolean;
  shareDisabled: boolean;
  onShared: (patch?: ReturnType<typeof gamificationPatchFromResponse>) => void;
};

export default function ArticleDetailMetaBar({
  isLoading,
  author,
  viewCount,
  publishedAt,
  isBookmarked,
  bookmarkDisabled,
  onBookmark,
  slug,
  title,
  shareUrl,
  isAuthenticated,
  hasShared,
  shareDisabled,
  onShared,
}: ArticleDetailMetaBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 py-4 border-y border-jepang-border text-sm">
      <div className="flex items-center gap-2">
        {isLoading ? (
          <div className="w-8 h-8 bg-jepang-red/10 animate-pulse" />
        ) : (
          <UserAvatar
            src={author?.avatarUrl}
            alt={author?.displayName || author?.name || "Penulis"}
            size={32}
            fallbackInitial={author?.displayName || author?.name}
            className="shrink-0"
          />
        )}

        <div>
          {isLoading ? (
            <>
              <div className="h-4 w-28 bg-jepang-red/10 animate-pulse mb-2" />
              <p className="text-[10px] uppercase tracking-wider font-mono text-jepang-muted">
                PENULIS
              </p>
            </>
          ) : (
            <>
              <AuthorLink username={author?.username} className="font-semibold text-sm">
                {author?.displayName || author?.name || "Jepangku"}
              </AuthorLink>
              <p className="text-[10px] uppercase tracking-wider font-mono text-jepang-muted">
                @{author?.username || "jepangku"}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 text-jepang-muted font-mono text-xs uppercase tracking-wider">
        <Eye size={14} strokeWidth={1.5} />
        {isLoading ? (
          <>
            <span className="h-3 w-8 bg-jepang-red/10 animate-pulse inline-block" />
            <span>Dilihat</span>
          </>
        ) : (
          `${viewCount} dilihat`
        )}
      </div>

      <div className="flex items-center gap-1 text-jepang-muted font-mono text-xs uppercase tracking-wider">
        <Calendar size={14} strokeWidth={1.5} />
        {isLoading ? (
          <span className="h-3 w-20 bg-jepang-red/10 animate-pulse inline-block" />
        ) : (
          publishedAt && new Date(publishedAt).toLocaleDateString()
        )}
      </div>

      <div className="flex gap-2 ml-auto">
        <Button
          variant={isBookmarked ? "default" : "outline"}
          size="sm"
          onClick={onBookmark}
          disabled={bookmarkDisabled}
          data-testid="bookmark-btn"
        >
          <Bookmark
            size={14}
            strokeWidth={1.5}
            fill={isBookmarked ? "currentColor" : "none"}
          />
          Simpan
        </Button>

        <ArticleShareButtons
          slug={slug}
          title={title}
          url={shareUrl}
          isAuthenticated={isAuthenticated}
          hasShared={hasShared}
          onShared={onShared}
          disabled={shareDisabled}
        />
      </div>
    </div>
  );
}
