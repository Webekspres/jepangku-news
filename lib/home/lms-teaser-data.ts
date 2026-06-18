/**
 * LMS homepage teaser — highlights static; kursus dari LMS live atau placeholder.
 */
import { buildLmsUrl } from "@/lib/lms/constants";
import type { LmsPublicCourse, LmsPublicCoursesResponse } from "@/lib/lms/types";
import type { HomeLmsTeaserResponse, LmsTeaserCourse } from "@/lib/home/types";

export const LMS_TEASER_HIGHLIGHTS = [
  {
    title: "JLPT N5–N1",
    description: "Kurikulum terstruktur dari pemula hingga tingkat lanjut.",
  },
  {
    title: "Progress Tracking",
    description: "Pantau pelajaran, kuis, dan pencapaian belajarmu.",
  },
  {
    title: "Sertifikat",
    description: "Raih sertifikat penyelesaian kursus resmi Jepangku LMS.",
  },
] as const;

function mapCourseToTeaser(course: LmsPublicCourse): LmsTeaserCourse {
  return {
    slug: course.slug,
    title: course.title,
    level: course.level,
    description: course.description,
    thumbnailUrl: course.thumbnailUrl,
    badge: course.badge,
    price: course.price,
    duration: course.duration,
    lessons: course.lessons,
    availability: course.availability,
    availabilityLabel: course.availabilityLabel,
    href: buildLmsUrl(`/kursus/${course.slug}`, {
      medium: "homepage-lms-card",
      campaign: course.slug,
    }),
  };
}

export function getLmsTeaserPlaceholder(): HomeLmsTeaserResponse {
  return {
    source: "placeholder",
    catalogUrl: buildLmsUrl("/kursus", { medium: "homepage-lms-placeholder" }),
    highlights: [...LMS_TEASER_HIGHLIGHTS],
    courses: [],
  };
}

export function mapLmsPublicCoursesToTeaser(
  payload: LmsPublicCoursesResponse,
): HomeLmsTeaserResponse {
  return {
    source: "live",
    catalogUrl: buildLmsUrl("/kursus", { medium: "homepage-lms-catalog" }),
    highlights: [...LMS_TEASER_HIGHLIGHTS],
    courses: payload.courses.map(mapCourseToTeaser),
  };
}
