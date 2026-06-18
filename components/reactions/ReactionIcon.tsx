import AssetImage from "@/components/AssetImage";
import { imageLoadingProps } from "@/lib/image-loading";
import { cn } from "@/lib/utils";

type ReactionIconProps = {
  src: string;
  size?: number;
  className?: string;
};

export default function ReactionIcon({
  src,
  size = 24,
  className,
}: ReactionIconProps) {
  return (
    <AssetImage
      src={src}
      alt=""
      width={size}
      height={size}
      sizes={`${size}px`}
      className={cn("shrink-0 object-contain", className)}
      aria-hidden
      {...imageLoadingProps()}
    />
  );
}
