import {
  getLmsTeaserPlaceholder,
  mapLmsPublicCoursesToTeaser,
} from "@/lib/home/lms-teaser-data";
import type { HomeLmsTeaserResponse } from "@/lib/home/types";
import { fetchLmsPublicCourses } from "@/lib/lms/client";

export async function fetchHomeLmsTeaser(): Promise<HomeLmsTeaserResponse> {
  const live = await fetchLmsPublicCourses({ featured: true, limit: 3 });

  if (live && live.courses.length > 0) {
    return mapLmsPublicCoursesToTeaser(live);
  }

  return getLmsTeaserPlaceholder();
}
