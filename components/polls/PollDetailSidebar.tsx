"use client";

import { useEffect, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import SidebarAdSlot from "@/components/home/SidebarAdSlot";
import TrendingArticlesPanel, {
  type TrendingArticleItem,
} from "@/components/home/TrendingArticlesPanel";
import RecommendedPollsPanel, {
  type RecommendedPollItem,
} from "@/components/polls/RecommendedPollsPanel";
import { useAdSlot } from "@/hooks/useAdSlot";

type PollDetailSidebarProps = {
  excludePollSlug?: string;
};

const RECOMMENDED_LIMIT = 4;
const TRENDING_LIMIT = 5;

export default function PollDetailSidebar({ excludePollSlug }: PollDetailSidebarProps) {
  const { data, isLoading, error } = useAdSlot("sidebar", {
    immediate: true,
  });

  const [polls, setPolls] = useState<RecommendedPollItem[]>([]);
  const [pollsLoading, setPollsLoading] = useState(true);
  const [trending, setTrending] = useState<TrendingArticleItem[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPolls() {
      setPollsLoading(true);
      try {
        const res = await fetch(
          `/api/polls?status=ACTIVE&limit=${RECOMMENDED_LIMIT + 1}`,
        );
        if (!res.ok) throw new Error("Failed to load polls");
        const json = (await parseApiResponse(res)) as { polls?: RecommendedPollItem[] };
        const items = Array.isArray(json.polls) ? json.polls : [];
        const filtered = excludePollSlug
          ? items.filter((item) => item.slug !== excludePollSlug)
          : items;

        if (!cancelled) {
          setPolls(filtered.slice(0, RECOMMENDED_LIMIT));
        }
      } catch {
        if (!cancelled) setPolls([]);
      } finally {
        if (!cancelled) setPollsLoading(false);
      }
    }

    void loadPolls();

    return () => {
      cancelled = true;
    };
  }, [excludePollSlug]);

  useEffect(() => {
    let cancelled = false;

    async function loadTrending() {
      setTrendingLoading(true);
      try {
        const res = await fetch(
          `/api/articles?sort=trending&limit=${TRENDING_LIMIT}`,
        );
        if (!res.ok) throw new Error("Failed to load trending");
        const json = (await parseApiResponse(res)) as { articles?: TrendingArticleItem[] };
        const items = Array.isArray(json.articles) ? json.articles : [];

        if (!cancelled) {
          setTrending(items.slice(0, TRENDING_LIMIT));
        }
      } catch {
        if (!cancelled) setTrending([]);
      } finally {
        if (!cancelled) setTrendingLoading(false);
      }
    }

    void loadTrending();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6" data-testid="poll-detail-sidebar">
      <RecommendedPollsPanel
        polls={polls}
        loading={pollsLoading}
        testIdPrefix="poll-sidebar-recommended"
      />

      <TrendingArticlesPanel
        articles={trending}
        loading={trendingLoading}
        testIdPrefix="poll-sidebar-trending"
      />

      <SidebarAdSlot
        data={data}
        loading={isLoading}
        error={error}
        testId="poll-sidebar-ad"
      />
    </div>
  );
}
