"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { imageLoadingProps } from "@/lib/image-loading";
import {
  CARD_PLACEHOLDER,
  resolveCardImageUrl,
} from "@/lib/image-placeholder";

type CardCoverImageProps = {
  src?: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  quality?: number;
};

function isSocialCdnUrl(url: string): boolean {
  try {
    const host = new URL(url, "http://localhost").hostname.toLowerCase();
    return (
      host.includes("cdninstagram.com") ||
      host.includes("fbcdn.net") ||
      host.includes("tiktokcdn")
    );
  } catch {
    return false;
  }
}

function isSvgUrl(url: string): boolean {
  return url.endsWith(".svg") || url.includes(".svg?");
}

export default function CardCoverImage({
  src,
  alt,
  sizes,
  className = "object-cover",
  priority = false,
  quality,
}: CardCoverImageProps) {
  const [imgSrc, setImgSrc] = useState(() => resolveCardImageUrl(src));

  useEffect(() => {
    setImgSrc(resolveCardImageUrl(src));
  }, [src]);

  const handleError = () => {
    if (imgSrc !== CARD_PLACEHOLDER) {
      setImgSrc(CARD_PLACEHOLDER);
    }
  };

  // CDN Instagram/FB: pakai <img> native + no-referrer (Next/Image sering 403 → placeholder)
  if (isSocialCdnUrl(imgSrc)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- hotlink sosial butuh referrerPolicy
      <img
        src={imgSrc}
        alt={alt}
        className={`absolute inset-0 h-full w-full ${className}`}
        loading={priority ? "eager" : "lazy"}
        referrerPolicy="no-referrer"
        decoding="async"
        onError={handleError}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      {...imageLoadingProps(priority)}
      quality={quality}
      unoptimized={isSvgUrl(imgSrc)}
      onError={handleError}
    />
  );
}
