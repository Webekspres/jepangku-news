import { getLmsBaseUrl } from "@/lib/lms/constants";
import type { LmsPublicCoursesResponse } from "@/lib/lms/types";

type FetchLmsPublicCoursesOptions = {
  limit?: number;
  timeoutMs?: number;
};

/**
 * Fetch published courses from the LMS Partner API.
 * Server-only: requires `LMS_PARTNER_API_KEY` (sent as Bearer token).
 * Endpoint: `GET /api/v1/public/courses` → `{ data, meta: { count } }`.
 */
export async function fetchLmsPublicCourses(
  options: FetchLmsPublicCoursesOptions = {},
): Promise<LmsPublicCoursesResponse | null> {
  const { limit = 3, timeoutMs = 5_000 } = options;

  const apiKey = process.env.LMS_PARTNER_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  const baseUrl = getLmsBaseUrl();
  const url = new URL("/api/v1/public/courses", baseUrl);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as LmsPublicCoursesResponse;
    if (!Array.isArray(payload.data)) {
      return null;
    }

    const courses = payload.data.slice(0, limit);
    return { data: courses, meta: { count: courses.length } };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
