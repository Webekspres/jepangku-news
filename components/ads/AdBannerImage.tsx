import Image from "next/image";
import { imageLoadingProps } from "@/lib/image-loading";
import { cn } from "@/lib/utils";

type AdBannerImageProps = {
  imageUrl: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  testId?: string;
  priority?: boolean;
};

export default function AdBannerImage({
  imageUrl,
  alt,
  width,
  height,
  className,
  testId,
  priority = false,
}: AdBannerImageProps) {
  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      sizes="(max-width: 768px) 100vw, 400px"
      className={cn(
        "w-full h-auto object-cover rounded-lg border border-jepang-border bg-jepang-off-white",
        className,
      )}
      {...imageLoadingProps(priority)}
      data-testid={testId}
    />
  );
}
