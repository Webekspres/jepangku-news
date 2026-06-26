"use client";

import AdCarousel from "@/components/ads/AdCarousel";
import type { HomeAdResponse } from "@/lib/home/types";
import { cn } from "@/lib/utils";

type SidebarAdSlotProps = {
  data: HomeAdResponse | null;
  loading?: boolean;
  error?: Error | null;
  className?: string;
  testId?: string;
};

export default function SidebarAdSlot({
  data,
  loading,
  error,
  className,
  testId = "sidebar-ad",
}: SidebarAdSlotProps) {
  if (loading || error || !data || data.banners.length === 0) {
    return null;
  }

  return (
    <aside
      className={cn("w-full", className)}
      aria-label="Partner advertisement"
    >
      <AdCarousel
        banners={data.banners}
        width={400}
        height={360}
        imageClassName="max-h-[360px]"
        frameClassName="rounded-lg shadow-jepang"
        testId={testId}
      />
    </aside>
  );
}
