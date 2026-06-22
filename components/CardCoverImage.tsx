"use client";

import Image from "next/image";
import { useState } from "react";
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

export default function CardCoverImage({
  src,
  alt,
  sizes,
  className = "object-cover",
  priority = false,
  quality,
}: CardCoverImageProps) {
  const [imgSrc, setImgSrc] = useState(() => resolveCardImageUrl(src));

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      {...imageLoadingProps(priority)}
      quality={quality}
      onError={() => {
        if (imgSrc !== CARD_PLACEHOLDER) {
          setImgSrc(CARD_PLACEHOLDER);
        }
      }}
    />
  );
}
