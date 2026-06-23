"use client";

import { useEffect, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import Link from "next/link";
import { Tag as TagIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type PopularTag = {
  id: string;
  name: string;
  slug: string;
  articleCount: number;
};

const chipClass = (
  isProminent: boolean,
  compact: boolean,
  toolbar: boolean,
  active: boolean,
) =>
  cn(
    "inline-flex shrink-0 items-center gap-1 uppercase tracking-wide transition-colors",
    toolbar
      ? cn(
          "border-r border-jepang-border px-2.5 py-1.5 text-[11px] font-semibold last:border-r-0",
          active
            ? "bg-jepang-red text-white"
            : "text-jepang-navy hover:bg-jepang-off-white",
        )
      : cn(
          "border transition-colors",
          active
            ? "border-jepang-red bg-jepang-red text-white"
            : "border-jepang-border hover:border-foreground hover:bg-foreground hover:text-white",
          isProminent
            ? "rounded-md border-2 px-4 py-2.5 text-sm font-semibold shadow-jepang"
            : compact
              ? "px-2 py-0.5 text-[11px] font-semibold"
              : "px-3 py-1.5 text-xs font-mono",
        ),
  );

export default function PopularTags({
  limit = 20,
  className,
  title = "Tag Populer",
  variant = "default",
  compact = false,
  scrollable = false,
  selectedSlug,
  onTagSelect,
}: {
  limit?: number;
  className?: string;
  title?: string | null;
  variant?: "default" | "prominent" | "toolbar";
  compact?: boolean;
  scrollable?: boolean;
  selectedSlug?: string;
  onTagSelect?: (slug: string) => void;
}) {
  const [tags, setTags] = useState<PopularTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tags/popular?limit=${limit}`)
      .then((r) => parseApiResponse(r))
      .then((d) => setTags(Array.isArray(d) ? d : []))
      .catch(() => setTags([]))
      .finally(() => setLoading(false));
  }, [limit]);

  const isProminent = variant === "prominent";
  const isToolbar = variant === "toolbar";

  if (loading) {
    return (
      <div
        className={cn(
          isToolbar
            ? "flex flex-nowrap gap-0 overflow-hidden"
            : compact
              ? "flex flex-wrap gap-1.5"
              : "flex flex-wrap gap-2",
          isProminent && "gap-3",
          className,
        )}
        data-testid="popular-tags-loading"
      >
        {[...Array(isToolbar ? 8 : compact ? 6 : 8)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "bg-jepang-border animate-pulse shrink-0",
              isProminent
                ? "h-10 w-28 rounded-md"
                : isToolbar
                  ? "h-[30px] w-14 border-r border-jepang-border"
                  : compact
                    ? "h-6 w-16"
                    : "h-8 w-24",
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

  const chipList = (
    <div
      className={cn(
        isToolbar
          ? "thin-scrollbar flex w-max flex-nowrap overflow-x-auto"
          : scrollable
            ? "thin-scrollbar flex w-max flex-nowrap gap-2 overflow-x-auto pb-1"
            : compact
              ? "flex flex-wrap gap-1.5"
              : "flex flex-wrap gap-2",
        isProminent && "gap-3",
      )}
    >
      {tags.map((t) => {
        const active = selectedSlug === t.slug;
        const label = (
          <>
            #{t.name}
            {!compact && !isToolbar && (
              <span className={cn("text-jepang-muted", !active && "group-hover:text-zinc-300")}>
                {t.articleCount}
              </span>
            )}
          </>
        );

        if (onTagSelect) {
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTagSelect(t.slug)}
              className={cn(
                chipClass(isProminent, compact, isToolbar, active),
                "group cursor-pointer",
              )}
              data-testid={`popular-tag-${t.slug}`}
            >
              {label}
            </button>
          );
        }

        return (
          <Link
            key={t.id}
            href={`/articles?tag=${t.slug}`}
            className={cn(chipClass(isProminent, compact, isToolbar, active), "group")}
            data-testid={`popular-tag-${t.slug}`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className={className} data-testid="popular-tags">
      {title ? (
        <div className={cn("flex min-w-0 items-center gap-2", compact ? "mb-0" : "mb-4", isProminent && "mb-5")}>
          <TagIcon
            size={isProminent ? 20 : compact ? 12 : 16}
            strokeWidth={1.5}
            className="text-jepang-red shrink-0"
          />
          <h3
            className={cn(
              isProminent
                ? "font-heading text-lg font-black tracking-tight"
                : compact
                  ? "text-[11px] font-semibold uppercase tracking-wider text-jepang-muted"
                  : "small-caps",
            )}
          >
            {title}
          </h3>
          {compact ? chipList : null}
        </div>
      ) : null}
      {compact && title ? null : chipList}
    </div>
  );
}
