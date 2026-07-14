"use client";

import { useEffect, useState } from "react";
import AdBannerImage from "@/components/ads/AdBannerImage";
import { useAdSlot } from "@/hooks/useAdSlot";
import { getAdSlotDimensions } from "@/lib/ads/dimensions";
import type { PublicAdBanner } from "@/lib/home/types";

function pickRandomBanner(banners: PublicAdBanner[]): PublicAdBanner | null {
  if (banners.length === 0) return null;
  const index = Math.floor(Math.random() * banners.length);
  return banners[index] ?? null;
}

/**
 * Iklan tengah di bawah konten artikel.
 * Sumber slot sama dengan homepage (`center`), tapi satu banner acak — bukan slider.
 */
export default function ArticleCenterAd() {
  const { data, isLoading, error } = useAdSlot("center", { immediate: true });
  const { width, height } = getAdSlotDimensions("center");
  const [banner, setBanner] = useState<PublicAdBanner | null>(null);

  useEffect(() => {
    if (!data?.banners.length) {
      setBanner(null);
      return;
    }
    setBanner(pickRandomBanner(data.banners));
  }, [data]);

  if (isLoading || error || !banner) return null;

  const alt = banner.altText || banner.title || "Partner";
  const image = (
    <AdBannerImage
      imageUrl={banner.imageUrl}
      alt={alt}
      width={width}
      height={height}
      className="max-h-[280px]"
      testId={`article-center-ad-image-${banner.id}`}
    />
  );

  return (
    <aside
      className="my-8 flex w-full justify-center"
      aria-label="Partner advertisement"
      data-testid="article-center-ad"
    >
      <div className="w-full overflow-hidden rounded-lg shadow-jepang">
        {banner.linkUrl ? (
          <a
            href={banner.linkUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block h-full w-full transition-opacity hover:opacity-95"
            data-testid={`article-center-ad-link-${banner.id}`}
          >
            {image}
          </a>
        ) : (
          image
        )}
      </div>
    </aside>
  );
}
