import type { ImageProps } from "next/image";

type ImageLoadingProps = Pick<ImageProps, "priority" | "loading" | "fetchPriority">;

/** Standar loading Next.js Image — LCP: eager + priority; sisanya lazy. */
export function imageLoadingProps(priority = false): ImageLoadingProps {
  if (priority) {
    return {
      priority: true,
      loading: "eager",
      fetchPriority: "high",
    };
  }
  return {
    loading: "lazy",
    fetchPriority: "auto",
  };
}
