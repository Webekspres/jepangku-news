import { cn } from "@/lib/utils";

/** Dense bento grid: items with images use `sm:row-span-2`. */
export function InteractiveBentoGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-flow-dense grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
        "auto-rows-[minmax(128px,auto)] sm:auto-rows-[minmax(148px,auto)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function interactiveBentoSpan(hasImage: boolean) {
  return hasImage ? "sm:row-span-2" : undefined;
}

export function resolveThumbnailUrl(item: {
  thumbnailUrl?: string | null;
  thumbnail_url?: string | null;
}) {
  return item.thumbnailUrl || item.thumbnail_url || null;
}
