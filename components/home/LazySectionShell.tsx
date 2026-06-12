"use client";

import { ReactNode, RefObject } from "react";
import type { HomeSectionId } from "@/lib/home/sections";
import { getSectionConfig } from "@/lib/home/sections";

type LazySectionShellProps = {
  sectionId: HomeSectionId;
  children: ReactNode;
  className?: string;
  sentinelRef?: RefObject<HTMLDivElement | null>;
};

/**
 * Wrapper that marks a homepage section for lazy-load waves and E2E tests.
 * Pass `sentinelRef` from useLazySection for intersection-based fetching.
 */
export default function LazySectionShell({
  sectionId,
  children,
  className,
  sentinelRef,
}: LazySectionShellProps) {
  const config = getSectionConfig(sectionId);

  return (
    <div
      id={`home-section-${sectionId}`}
      data-testid={`home-section-${sectionId}`}
      data-home-wave={config.wave ?? "static"}
      data-home-implemented={config.implemented ? "true" : "false"}
      className={className}
    >
      <div
        ref={sentinelRef}
        aria-hidden
        data-testid={`home-sentinel-${sectionId}`}
        className="h-px w-full pointer-events-none"
      />
      {children}
    </div>
  );
}
