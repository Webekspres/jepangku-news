"use client";

import { useEffect, useState } from "react";
import { parseApiResponse } from "@/lib/fetch-api";
import SidebarAdSlot from "@/components/home/SidebarAdSlot";
import RecommendedVideosPanel, {
  type RecommendedVideoItem,
} from "@/components/videos/RecommendedVideosPanel";
import TrendingVideosPanel, {
  type TrendingVideoItem,
} from "@/components/videos/TrendingVideosPanel";
import { useAdSlot } from "@/hooks/useAdSlot";

type VideoDetailSidebarProps = {
  excludeVideoSlug?: string;
};

const RECOMMENDED_LIMIT = 4;
const TRENDING_LIMIT = 5;

export default function VideoDetailSidebar({
  excludeVideoSlug,
}: VideoDetailSidebarProps) {
  const { data, isLoading, error } = useAdSlot("sidebar", {
    immediate: true,
  });

  const [videos, setVideos] = useState<RecommendedVideoItem[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [trending, setTrending] = useState<TrendingVideoItem[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadRecommended() {
      setVideosLoading(true);
      try {
        const res = await fetch(
          `/api/videos?limit=${RECOMMENDED_LIMIT + 1}`,
        );
        if (!res.ok) throw new Error("Failed to load videos");
        const json = (await parseApiResponse(res)) as {
          videos?: RecommendedVideoItem[];
        };
        const items = Array.isArray(json.videos) ? json.videos : [];
        const filtered = excludeVideoSlug
          ? items.filter((item) => item.slug !== excludeVideoSlug)
          : items;

        if (!cancelled) {
          setVideos(filtered.slice(0, RECOMMENDED_LIMIT));
        }
      } catch {
        if (!cancelled) setVideos([]);
      } finally {
        if (!cancelled) setVideosLoading(false);
      }
    }

    void loadRecommended();

    return () => {
      cancelled = true;
    };
  }, [excludeVideoSlug]);

  useEffect(() => {
    let cancelled = false;

    async function loadTrending() {
      setTrendingLoading(true);
      try {
        const res = await fetch(
          `/api/videos?sort=trending&limit=${TRENDING_LIMIT + 1}`,
        );
        if (!res.ok) throw new Error("Failed to load trending videos");
        const json = (await parseApiResponse(res)) as {
          videos?: TrendingVideoItem[];
        };
        const items = Array.isArray(json.videos) ? json.videos : [];
        const filtered = excludeVideoSlug
          ? items.filter((item) => item.slug !== excludeVideoSlug)
          : items;

        if (!cancelled) {
          setTrending(filtered.slice(0, TRENDING_LIMIT));
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
  }, [excludeVideoSlug]);

  return (
    <div className="space-y-6" data-testid="video-detail-sidebar">
      <RecommendedVideosPanel
        videos={videos}
        loading={videosLoading}
        testIdPrefix="video-sidebar-recommended"
      />

      <TrendingVideosPanel
        videos={trending}
        loading={trendingLoading}
        testIdPrefix="video-sidebar-trending"
      />

      <SidebarAdSlot
        data={data}
        loading={isLoading}
        error={error}
        testId="video-sidebar-ad"
      />
    </div>
  );
}
