"use client";

import { RefObject, useEffect, useRef, useState } from "react";

type UseLazySectionOptions = {
  /** Preload when sentinel is within this margin of the viewport */
  rootMargin?: string;
  /** Skip observer — fetch immediately on mount (Wave 1) */
  immediate?: boolean;
  /** Disable fetch entirely (Phase 0 placeholders) */
  disabled?: boolean;
};

type UseLazySectionResult<T> = {
  sentinelRef: RefObject<HTMLDivElement | null>;
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

  const shouldFetchImmediately =
    immediate && !disabled && Boolean(endpoint);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isEnabled, setIsEnabled] = useState(shouldFetchImmediately);
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(shouldFetchImmediately);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (disabled || !endpoint || immediate) return;

    let observer: IntersectionObserver | null = null;

    const attach = () => {
      const el = sentinelRef.current;
      if (!el || observer) return;

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsEnabled(true);
            observer?.disconnect();
            observer = null;
          }
        },
        { rootMargin },
      );
      observer.observe(el);
    };

    attach();
    const frame = requestAnimationFrame(attach);

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
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
