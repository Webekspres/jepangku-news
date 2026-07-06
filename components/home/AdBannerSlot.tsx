"use client";

import AdCarousel from "@/components/ads/AdCarousel";
import LazySectionSkeleton from "@/components/home/LazySectionSkeleton";
import type { HomeAdResponse } from "@/lib/home/types";

type AdBannerSlotProps = {
  data: HomeAdResponse | null;
  loading: boolean;
  error: Error | null;
};

export default function AdBannerSlot({ data, loading, error }: AdBannerSlotProps) {
  if (loading) {
    return (
      <section className="py-8 bg-white" aria-hidden data-testid="home-ad-banner-loading">
        <div className="px-4 mx-auto max-w-7xl">
          <LazySectionSkeleton minHeight={120}>
            <div className="h-[120px] rounded-lg border border-jepang-border bg-jepang-off-white animate-pulse" />
          </LazySectionSkeleton>
        </div>
      </section>
    );
  }

  if (error) {
    return null;
  }

  if (!data || data.banners.length === 0) {
    return (
      <section
        className="py-8 bg-white"
        aria-label="Partner advertisement"
        data-testid="home-ad-banner-empty"
      >
        <div className="px-4 mx-auto max-w-7xl">
          <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-jepang-border bg-jepang-off-white px-6 text-center">
            <p className="text-sm text-jepang-muted">
              Slot iklan partner — segera hadir
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-8 bg-white"
      aria-label="Partner advertisement"
      data-testid="home-ad-banner"
    >
      <div className="px-4 mx-auto max-w-7xl">
        <AdCarousel
          banners={data.banners}
          width={1920}
          height={448}
          imageClassName="max-h-[448px]"
          frameClassName="rounded-lg shadow-jepang"
          testId="ad-banner"
          priorityFirst
        />
      </div>
    </section>
  );
}
