export type LmsJlptLevel = "N5" | "N4" | "N3" | "N2" | "N1";

export type LmsCourseAvailability = "tersedia" | "segera";

/**
 * Course summary as returned by the LMS Partner API
 * (`GET /api/v1/public/courses`). Mirrors `PublicCourseSummary` in jepangkuLMS.
 */
export type LmsPublicCourse = {
  slug: string;
  title: string;
  description: string | null;
  level: LmsJlptLevel;
  priceIdr: number;
  lessonCount: number;
  moduleCount: number;
  /** Public marketing URL on LMS (e.g. https://kursus.jepangku.com/kursus/[slug]) */
  url: string;
};

/** Envelope of `GET /api/v1/public/courses`. */
export type LmsPublicCoursesResponse = {
  data: LmsPublicCourse[];
  meta: {
    count: number;
  };
};

export type LmsErrorBody = {
  error: string;
  code: string;
};
