import Image from "next/image";
import { imageLoadingProps } from "@/lib/image-loading";

type ArticleCoverImageProps = {
  isLoading: boolean;
  src?: string | null;
  alt: string;
};

export default function ArticleCoverImage({
  isLoading,
  src,
  alt,
}: ArticleCoverImageProps) {
  if (isLoading) {
    return (
      <div className="my-8 -mx-4 md:mx-0">
        <div className="h-72 w-full bg-jepang-red/10 animate-pulse" />
      </div>
    );
  }

  if (!src) return null;

  return (
    <div className="my-8 -mx-4 md:mx-0 relative aspect-16/10 max-h-150 w-full overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 768px"
        className="object-cover"
        {...imageLoadingProps(true)}
      />
    </div>
  );
}
