"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tag as TagIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type PopularTag = {
  id: string;
  name: string;
  slug: string;
  articleCount: number;
};

export default function PopularTags({
  limit = 20,
  className,
  title = "Tag Populer",
  variant = "default",
}: {
  limit?: number;
  className?: string;
  title?: string;
  variant?: "default" | "prominent";
}) {
  const [tags, setTags] = useState<PopularTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tags/popular?limit=${limit}`)
      .then((r) => r.json())
      .then((d) => setTags(Array.isArray(d) ? d : []))
      .catch(() => setTags([]))
      .finally(() => setLoading(false));
  }, [limit]);

  const isProminent = variant === "prominent";

  if (loading) {
    return (
      <div
        className={cn(
          "flex flex-wrap gap-2",
          isProminent && "gap-3",
          className,
        )}
        data-testid="popular-tags-loading"
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "bg-jepang-border animate-pulse",
              isProminent ? "h-10 w-28 rounded-md" : "h-8 w-24",
            )}
          />
        ))}
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <p className={cn("text-sm text-jepang-muted", className)} data-testid="popular-tags-empty">
        Belum ada tag populer.
      </p>
    );
  }

  return (
    <div className={className} data-testid="popular-tags">
      {title && (
        <div className={cn("flex items-center gap-2 mb-4", isProminent && "mb-5")}>
          <TagIcon
            size={isProminent ? 20 : 16}
            strokeWidth={1.5}
            className="text-jepang-red"
          />
          <h3 className={cn(isProminent ? "font-heading text-lg font-black tracking-tight" : "small-caps")}>
            {title}
          </h3>
        </div>
      )}
      <div className={cn("flex flex-wrap gap-2", isProminent && "gap-3")}>
        {tags.map((t) => (
          <Link
            key={t.id}
            href={`/articles?tag=${t.slug}`}
            className={cn(
              "group inline-flex items-center gap-1.5 border border-jepang-border uppercase tracking-wider hover:border-foreground hover:bg-foreground hover:text-white transition-colors",
              isProminent
                ? "rounded-md border-2 px-4 py-2.5 text-sm font-semibold shadow-jepang"
                : "px-3 py-1.5 text-xs font-mono",
            )}
            data-testid={`popular-tag-${t.slug}`}
          >
            #{t.name}
            <span className="text-jepang-muted group-hover:text-zinc-300">{t.articleCount}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
