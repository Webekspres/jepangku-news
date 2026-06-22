import { cn } from "@/lib/utils";

export { resolveThumbnailUrl } from "@/lib/image-placeholder";

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

