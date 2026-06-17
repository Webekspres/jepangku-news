"use client";

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
  if (loading || error || !data?.banner) {
    return null;
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
      className="w-full h-auto max-h-[360px] object-cover rounded-lg border border-jepang-border bg-jepang-off-white"
      data-testid={`${testId}-image-${banner.id}`}
    />
  );

  return (
    <aside
      className={cn("w-full", className)}
      aria-label="Partner advertisement"
      data-testid={testId}
    >
      {banner.linkUrl ? (
        <a
          href={banner.linkUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block overflow-hidden rounded-lg shadow-jepang transition-opacity hover:opacity-95"
          data-testid={`${testId}-link-${banner.id}`}
        >
          {image}
        </a>
      ) : (
        <div className="overflow-hidden rounded-lg shadow-jepang">{image}</div>
      )}
    </aside>
  );
}
