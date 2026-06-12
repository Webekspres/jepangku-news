"use client";

import { ReactNode } from "react";
import type { HomeSectionId } from "@/lib/home/sections";
import { getSectionConfig } from "@/lib/home/sections";

type LazySectionShellProps = {
  sectionId: HomeSectionId;
  children: ReactNode;
  className?: string;
};

/**
 * Wrapper that marks a homepage section for lazy-load waves and E2E tests.
 * Sentinel div is observed by useLazySection in child sections (Fase 1+).
 */
export default function LazySectionShell({
  sectionId,
  children,
  className,
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
      {/* Sentinel anchor for Intersection Observer (Fase 1+) */}
      <div
        aria-hidden
        data-testid={`home-sentinel-${sectionId}`}
        className="h-px w-full pointer-events-none"
      />
      {children}
    </div>
  );
}
