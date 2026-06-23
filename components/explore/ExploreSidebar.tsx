"use client";

import Link from "next/link";
import PopularTags from "@/components/PopularTags";
import AuthorLink from "@/components/AuthorLink";
import LeaderboardAvatar from "@/components/leaderboard/LeaderboardAvatar";
import LeaderboardScore from "@/components/leaderboard/LeaderboardScore";
import type { ExploreResponse } from "@/lib/explore/types";
import { ArrowRight, Award } from "lucide-react";

type ExploreSidebarProps = {
  data: ExploreResponse;
};

function SidebarPanel({
  label,
  title,
  href,
  children,
  testId,
}: {
  label?: string;
  title: string;
  href?: string;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <div
      className="rounded-lg border border-jepang-border bg-white p-4"
      data-testid={testId}
    >
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-jepang-border pb-2">
        <div className="min-w-0">
          {label ? <p className="section-label mb-0.5 text-[10px]">{label}</p> : null}
          <h3 className="truncate font-heading text-sm font-bold tracking-tight">{title}</h3>
        </div>
        {href ? (
          <Link
            href={href}
            className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-jepang-muted transition-colors hover:text-jepang-red"
          >
            Semua
          </Link>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export default function ExploreSidebar({ data }: ExploreSidebarProps) {
  return (
    <div className="flex flex-col gap-4" data-testid="explore-sidebar">
      <SidebarPanel
        label="ランキング / PERINGKAT"
        title={`Top ${data.leaderboardPeriodLabel}`}
        href="/leaderboard"
        testId="explore-leaderboard-section"
      >
        {data.leaderboard.length > 0 ? (
          <ul>
            {data.leaderboard.map((entry, idx) => (
              <li
                key={entry.userId}
                className="flex items-center gap-2 border-b border-jepang-border py-2.5 last:border-b-0"
                data-testid={`explore-leaderboard-${idx}`}
              >
                <span
                  className={`w-5 shrink-0 font-mono text-xs font-black ${
                    idx === 0 ? "text-jepang-red" : "text-jepang-black"
                  }`}
                >
                  #{entry.rank}
                </span>
                <LeaderboardAvatar
                  avatarUrl={entry.avatarUrl}
                  displayName={entry.displayName}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <AuthorLink
                    username={entry.username || null}
                    className="block truncate text-xs font-semibold"
                  >
                    {entry.displayName}
                  </AuthorLink>
                  <LeaderboardScore
                    period={entry.period}
                    periodPoints={entry.periodPoints}
                    totalPoints={entry.totalPoints}
                    compact
                  />
                </div>
                {idx === 0 ? (
                  <Award size={12} className="shrink-0 text-jepang-red" />
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-4 text-center text-xs text-jepang-muted">
            Belum ada data peringkat.
          </p>
        )}
      </SidebarPanel>

      <SidebarPanel title="Tag Populer" testId="explore-tags-section">
        <PopularTags limit={16} title={null} compact />
      </SidebarPanel>

      <SidebarPanel
        label="カテゴリ / KATEGORI"
        title="Jelajahi Topik"
        href="/articles"
        testId="explore-categories-section"
      >
        <ul className="space-y-1">
          {data.categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/articles?category=${cat.slug}`}
                className="group flex items-center justify-between rounded px-1 py-1.5 text-sm transition-colors hover:bg-jepang-off-white"
                data-testid={`explore-category-${cat.slug}`}
              >
                <span className="truncate font-medium group-hover:text-jepang-red">
                  {cat.name}
                </span>
                <ArrowRight
                  size={12}
                  className="shrink-0 text-jepang-muted transition-transform group-hover:translate-x-0.5 group-hover:text-jepang-red"
                />
              </Link>
            </li>
          ))}
        </ul>
      </SidebarPanel>
    </div>
  );
}
