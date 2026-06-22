import Image from "next/image";
import { cn } from "@/lib/utils";
import { imageLoadingProps } from "@/lib/image-loading";

type UserAvatarProps = {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
  priority?: boolean;
  fallbackInitial?: string;
  testId?: string;
};

export default function UserAvatar({
  src,
  alt,
  size = 36,
  className,
  priority = false,
  fallbackInitial,
  testId,
}: UserAvatarProps) {
  const initial =
    fallbackInitial?.charAt(0).toUpperCase() ||
    alt.charAt(0).toUpperCase() ||
    "?";
  const box = cn(
    "shrink-0 rounded-full border border-jepang-border object-cover",
    className,
  );

  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        sizes={`${size}px`}
        className={box}
        {...imageLoadingProps(priority)}
        data-testid={testId}
      />
    );
  }

  return (
    <div
      className={cn(
        box,
        "flex items-center justify-center bg-jepang-navy font-bold text-white",
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(12, Math.round(size * 0.38)),
      }}
      data-testid={testId}
    >
      {initial}
    </div>
  );
}
