import { getLmsBaseUrl } from "@/lib/lms/constants";
import { parseApiResponse } from '@/lib/fetch-api';
import type { LmsPublicCoursesResponse } from "@/lib/lms/types";

type FetchLmsPublicCoursesOptions = {
  featured?: boolean;
  limit?: number;
  timeoutMs?: number;
};

export async function fetchLmsPublicCourses(
  options: FetchLmsPublicCoursesOptions = {},
): Promise<LmsPublicCoursesResponse | null> {
  const { featured = true, limit = 3, timeoutMs = 5_000 } = options;
  const baseUrl = getLmsBaseUrl();
  const url = new URL("/api/public/courses", baseUrl);
  url.searchParams.set("published", "true");
  url.searchParams.set("limit", String(limit));
  if (featured) {
    url.searchParams.set("featured", "true");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await parseApiResponse(response)) as LmsPublicCoursesResponse;
    if (!Array.isArray(payload.courses)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
