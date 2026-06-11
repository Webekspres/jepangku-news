import { cn } from "@/lib/utils";
import {
  InteractiveBentoGrid,
  interactiveBentoSpan,
} from "@/components/interactive/InteractiveBentoGrid";

/** Alternating featured (2-row) + compact skeleton tiles. */
const FEATURED_PATTERN = [true, false, false, true, false, false, true, false, false];

function BentoTileSkeleton({ featured }: { featured: boolean }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-jepang-border bg-white animate-pulse",
        interactiveBentoSpan(featured),
      )}
    >
      {featured ? (
        <div className="aspect-16/10 bg-jepang-border/70" />
      ) : (
        <div className="flex items-start gap-3 p-5 pb-0">
          <div className="h-10 w-10 shrink-0 rounded border border-jepang-border bg-jepang-border/60" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-20 bg-jepang-border/70 rounded" />
            <div className="h-5 w-full bg-jepang-border/70 rounded" />
          </div>
        </div>
      )}
      <div className={cn("space-y-3 p-5", featured && "pt-4")}>
        {!featured && <div className="h-3 w-2/3 bg-jepang-border/60 rounded" />}
        {featured && (
          <>
            <div className="flex justify-between gap-2">
              <div className="h-5 w-20 bg-jepang-border/70 rounded" />
              <div className="h-5 w-16 bg-jepang-border/70 rounded" />
            </div>
            <div className="h-6 w-full bg-jepang-border/70 rounded" />
            <div className="h-4 w-4/5 bg-jepang-border/60 rounded" />
          </>
        )}
        <div className="flex justify-between border-t border-jepang-border pt-3">
          <div className="h-3 w-24 bg-jepang-border/60 rounded" />
          <div className="h-3 w-16 bg-jepang-border/60 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function InteractiveBentoSkeleton({
  count = 9,
}: {
  count?: number;
}) {
  return (
    <InteractiveBentoGrid>
      {Array.from({ length: count }, (_, i) => (
        <BentoTileSkeleton
          key={i}
          featured={FEATURED_PATTERN[i % FEATURED_PATTERN.length]}
        />
      ))}
    </InteractiveBentoGrid>
  );
}

export function InteractiveBentoLoadMoreSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <BentoTileSkeleton key={i} featured={i === 0} />
      ))}
    </>
  );
}
