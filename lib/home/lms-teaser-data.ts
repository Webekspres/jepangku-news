/**
 * LMS homepage teaser — highlights static; kursus dari LMS live atau placeholder.
 */
import { buildLmsUrl } from "@/lib/lms/constants";
import type {
  LmsJlptLevel,
  LmsPublicCourse,
  LmsPublicCoursesResponse,
} from "@/lib/lms/types";
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

const LEVEL_ACCENT: Record<LmsJlptLevel, string> = {
  N5: "#059669",
  N4: "#2563eb",
  N3: "#d97706",
  N2: "#7c3aed",
  N1: "#dc2626",
};

/** Inline SVG placeholder thumbnail — LMS Partner API does not expose cover images. */
function buildPlaceholderThumbnail(level: LmsJlptLevel): string {
  const accent = LEVEL_ACCENT[level];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${accent}"/><stop offset="1" stop-color="#0f172a"/></linearGradient></defs><rect width="640" height="400" fill="url(#g)"/><text x="320" y="220" font-family="sans-serif" font-size="120" font-weight="bold" fill="rgba(255,255,255,0.9)" text-anchor="middle">${level}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function formatPriceIdr(priceIdr: number): string {
  if (!priceIdr || priceIdr <= 0) return "Gratis";
  return `Rp ${priceIdr.toLocaleString("id-ID")}`;
}

function mapCourseToTeaser(course: LmsPublicCourse): LmsTeaserCourse {
  return {
    slug: course.slug,
    title: course.title,
    level: course.level,
    description: course.description ?? "",
    thumbnailUrl: buildPlaceholderThumbnail(course.level),
    badge: course.level,
    price: formatPriceIdr(course.priceIdr),
    duration: `${course.moduleCount} modul`,
    lessons: course.lessonCount,
    availability: "tersedia",
    availabilityLabel: "Tersedia sekarang",
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
    courses: payload.data.map(mapCourseToTeaser),
  };
}
