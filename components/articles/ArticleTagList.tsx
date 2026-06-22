import Link from "next/link";
import { Tag as TagIcon } from "lucide-react";
import type { ArticleDetailTag } from "@/lib/articles/detail-types";

type ArticleTagListProps = {
  tags: ArticleDetailTag[];
};

export default function ArticleTagList({ tags }: ArticleTagListProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 m-4" data-testid="article-tags">
      <TagIcon size={14} strokeWidth={1.5} className="text-jepang-muted shrink-0" />
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/articles?tag=${tag.slug}`}
          className="text-xs font-mono uppercase tracking-wider border border-jepang-border px-2.5 py-1 hover:border-foreground hover:bg-foreground hover:text-white transition-colors"
          data-testid={`article-tag-${tag.slug}`}
        >
          #{tag.name}
        </Link>
      ))}
    </div>
  );
}
