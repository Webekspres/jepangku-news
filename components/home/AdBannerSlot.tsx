"use client";

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

  if (!data?.banner) {
    return (
      <section
        className="py-8 bg-white"
        aria-label="Partner advertisement"
        data-testid="home-ad-banner-empty"
      >
        <div className="px-4 mx-auto max-w-7xl">
          <p className="section-label mb-3 text-center">パートナー / PARTNER</p>
          <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-jepang-border bg-jepang-off-white px-6 text-center">
            <p className="text-sm text-jepang-muted">
              Slot iklan partner — segera hadir
            </p>
          </div>
        </div>
      </section>
    );
  }

  const { banner } = data;
  const alt = banner.altText || banner.title || "Partner";

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={banner.imageUrl}
      alt={alt}
      loading="lazy"
      decoding="async"
      width={1200}
      height={280}
      className="w-full h-auto max-h-[280px] object-cover rounded-lg border border-jepang-border bg-jepang-off-white"
      data-testid={`ad-banner-image-${banner.id}`}
    />
  );

  return (
    <section
      className="py-8 bg-white"
      aria-label="Partner advertisement"
      data-testid="home-ad-banner"
    >
      <div className="px-4 mx-auto max-w-7xl">
        <p className="section-label mb-3 text-center">パートナー / PARTNER</p>
        {banner.linkUrl ? (
          <a
            href={banner.linkUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block overflow-hidden rounded-lg shadow-jepang transition-opacity hover:opacity-95"
            data-testid={`ad-banner-link-${banner.id}`}
          >
            {image}
          </a>
        ) : (
          <div className="overflow-hidden rounded-lg shadow-jepang">{image}</div>
        )}
      </div>
    </section>
  );
}
