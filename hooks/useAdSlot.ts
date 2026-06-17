"use client";

import { type RefObject, useEffect, useRef, useState } from "react";
import { fetchAdSlotClient, peekAdSlotClient } from "@/lib/ads/client-cache";
import type { HomeAdResponse } from "@/lib/home/types";

type UseAdSlotOptions = {
  /** Fetch segera saat enabled (tanpa IntersectionObserver). */
  immediate?: boolean;
  /** Nonaktifkan fetch (mis. sidebar tertutup). */
  enabled?: boolean;
  rootMargin?: string;
};

type UseAdSlotResult = {
  sentinelRef: RefObject<HTMLDivElement | null>;
  data: HomeAdResponse | null;
  isLoading: boolean;
  error: Error | null;
};

export function useAdSlot(
  slot: string,
  options: UseAdSlotOptions = {},
): UseAdSlotResult {
  const {
    immediate = false,
    enabled = true,
    rootMargin = "400px 0px",
  } = options;

  const cached = peekAdSlotClient(slot);
  const shouldFetchNow = enabled && immediate;

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(shouldFetchNow || Boolean(cached));
  const [data, setData] = useState<HomeAdResponse | null>(cached);
  const [isLoading, setIsLoading] = useState(shouldFetchNow && !cached);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || immediate || cached) {
      if (enabled && immediate) setIsVisible(true);
      return;
    }

    let observer: IntersectionObserver | null = null;

    const attach = () => {
      const el = sentinelRef.current;
      if (!el || observer) return;

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
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
  }, [cached, enabled, immediate, rootMargin]);

  useEffect(() => {
    if (!enabled || !isVisible) return;

    const warm = peekAdSlotClient(slot);
    if (warm) {
      setData(warm);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchAdSlotClient(slot)
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
  }, [enabled, isVisible, slot]);

  return { sentinelRef, data, isLoading, error };
}
