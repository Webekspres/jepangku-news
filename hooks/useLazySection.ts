"use client";

import { useEffect, useRef, useState } from "react";

type UseLazySectionOptions = {
  /** Preload when sentinel is within this margin of the viewport */
  rootMargin?: string;
  /** Skip observer — fetch immediately on mount (Wave 1) */
  immediate?: boolean;
  /** Disable fetch entirely (Phase 0 placeholders) */
  disabled?: boolean;
};

type UseLazySectionResult<T> = {
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isEnabled: boolean;
};

export function useLazySection<T>(
  endpoint: string | null,
  options: UseLazySectionOptions = {},
): UseLazySectionResult<T> {
  const { rootMargin = "400px 0px", immediate = false, disabled = false } =
    options;

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isEnabled, setIsEnabled] = useState(
    immediate && !disabled && Boolean(endpoint),
  );
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (disabled || !endpoint || immediate) return;

    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsEnabled(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [disabled, endpoint, immediate, rootMargin]);

  useEffect(() => {
    if (!isEnabled || !endpoint) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(endpoint)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<T>;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isEnabled, endpoint]);

  return { sentinelRef, data, isLoading, error, isEnabled };
}
