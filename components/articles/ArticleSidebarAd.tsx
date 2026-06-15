"use client";

import SidebarAdSlot from "@/components/home/SidebarAdSlot";
import { useLazySection } from "@/hooks/useLazySection";
import type { HomeAdResponse } from "@/lib/home/types";

export default function ArticleSidebarAd() {
  const { data, isLoading, error } = useLazySection<HomeAdResponse>(
    "/api/home/ads?slot=article-sidebar",
    { immediate: true },
  );

  return (
    <SidebarAdSlot
      data={data}
      loading={isLoading}
      error={error}
      testId="article-sidebar-ad"
    />
  );
}
