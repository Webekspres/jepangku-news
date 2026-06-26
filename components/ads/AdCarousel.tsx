"use client";

import { useEffect, useState } from "react";
import AdBannerImage from "@/components/ads/AdBannerImage";
import type { PublicAdBanner } from "@/lib/home/types";
import { cn } from "@/lib/utils";

type AdCarouselProps = {
  banners: PublicAdBanner[];
  width: number;
  height: number;
  /** Kelas tambahan untuk gambar (mis. tinggi maksimum). */
  imageClassName?: string;
  /** Kelas frame (rounded/shadow) untuk satu jendela tampilan. */
  frameClassName?: string;
  testId: string;
  autoPlayMs?: number;
  priorityFirst?: boolean;
};

function AdSlide({
  banner,
  width,
  height,
  imageClassName,
  testId,
  priority,
}: {
  banner: PublicAdBanner;
  width: number;
  height: number;
  imageClassName?: string;
  testId: string;
  priority: boolean;
}) {
  const alt = banner.altText || banner.title || "Partner";
  const image = (
    <AdBannerImage
      imageUrl={banner.imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={imageClassName}
      testId={`${testId}-image-${banner.id}`}
      priority={priority}
    />
  );

  if (banner.linkUrl) {
    return (
      <a
        href={banner.linkUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block h-full w-full transition-opacity hover:opacity-95"
        data-testid={`${testId}-link-${banner.id}`}
      >
        {image}
      </a>
    );
  }

  return <div className="h-full w-full">{image}</div>;
}

export default function AdCarousel({
  banners,
  width,
  height,
  imageClassName,
  frameClassName,
  testId,
  autoPlayMs = 6000,
  priorityFirst = false,
}: AdCarouselProps) {
  const count = banners.length;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index > count - 1) setIndex(0);
  }, [count, index]);

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % count),
      autoPlayMs,
    );
    return () => clearInterval(id);
  }, [count, autoPlayMs]);

  if (count === 0) return null;

  if (count === 1) {
    return (
      <div className={cn("overflow-hidden", frameClassName)} data-testid={testId}>
        <AdSlide
          banner={banners[0]}
          width={width}
          height={height}
          imageClassName={imageClassName}
          testId={testId}
          priority={priorityFirst}
        />
      </div>
    );
  }

  const safeIndex = Math.min(index, count - 1);

  return (
    <div className="w-full" data-testid={testId}>
      <div className={cn("relative overflow-hidden", frameClassName)}>
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${safeIndex * 100}%)` }}
        >
          {banners.map((banner, i) => (
            <div
              key={banner.id}
              className="w-full shrink-0 basis-full"
              aria-hidden={i !== safeIndex}
            >
              <AdSlide
                banner={banner}
                width={width}
                height={height}
                imageClassName={imageClassName}
                testId={testId}
                priority={priorityFirst && i === 0}
              />
            </div>
          ))}
        </div>
      </div>

      <div
        className="mt-3 flex items-center justify-center gap-2"
        role="tablist"
        aria-label="Pilih banner"
      >
        {banners.map((banner, i) => (
          <button
            key={banner.id}
            type="button"
            role="tab"
            aria-selected={i === safeIndex}
            aria-label={`Banner ${i + 1}`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-2 rounded-full transition-all",
              i === safeIndex
                ? "w-6 bg-jepang-red"
                : "w-2 bg-jepang-border hover:bg-jepang-muted",
            )}
            data-testid={`${testId}-dot-${i}`}
          />
        ))}
      </div>
    </div>
  );
}
