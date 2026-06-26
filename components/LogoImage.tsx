"use client";

import { useState, useEffect } from "react";
import AssetImage from "@/components/AssetImage";
import { LOGO_VARIANTS, getLogoPath, type LogoVariant } from "@/lib/logo-utils";
import { trackLogoError } from "@/lib/logo-analytics";

type LogoImageProps = {
  variant?: LogoVariant;
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  fallbackSrc?: string;
};

export default function LogoImage({
  variant = "04",
  width = 160,
  height = 48,
  className = "",
  alt = "Jepangku",
  fallbackSrc,
}: LogoImageProps) {
  const [imageSrc, setImageSrc] = useState(getLogoPath(variant));
  const [hasError, setHasError] = useState(false);

  // Reset error state when variant changes
  useEffect(() => {
    setHasError(false);
    setImageSrc(getLogoPath(variant));
  }, [variant]);

  const handleError = () => {
    const originalSrc = imageSrc;
    console.warn(`Failed to load logo: ${imageSrc}`);
    setHasError(true);
    
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      trackLogoError(variant, originalSrc, fallbackSrc);
    } else if (variant !== "04") {
      // Fallback to logo-04.svg as default
      const fallback = getLogoPath("04");
      setImageSrc(fallback);
      trackLogoError(variant, originalSrc, fallback);
    } else {
      // Even the fallback failed
      trackLogoError(variant, originalSrc);
    }
  };

  // In development, show error info
  if (process.env.NODE_ENV === "development" && hasError) {
    console.log({
      variant,
      imageSrc,
      originalPath: getLogoPath(variant),
      hasError
    });
  }

  return (
    <AssetImage
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      priority
      // SVG logos are static, trusted assets in /public. Serving them
      // unoptimized bypasses the Next.js image optimizer (which rejects SVG
      // by default in production) while keeping the fallback behavior.
      unoptimized
    />
  );
}