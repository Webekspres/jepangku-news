import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type LazySectionSkeletonProps = {
  children: ReactNode;
  /** Fixed min-height to reduce CLS while lazy data loads */
  minHeight?: number;
  className?: string;
  "data-testid"?: string;
};

export default function LazySectionSkeleton({
  children,
  minHeight = 280,
  className,
  "data-testid": testId,
}: LazySectionSkeletonProps) {
  return (
    <div
      className={cn("w-full", className)}
      style={{ minHeight }}
      data-testid={testId}
    >
      {children}
    </div>
  );
}
