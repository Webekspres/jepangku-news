export type LmsJlptLevel = "N5" | "N4" | "N3" | "N2" | "N1";

export type LmsCourseAvailability = "tersedia" | "segera";

export type LmsPublicCourse = {
  slug: string;
  title: string;
  description: string;
  level: LmsJlptLevel;
  lessons: number;
  duration: string;
  availability: LmsCourseAvailability;
  availabilityLabel: string;
  price: string;
  thumbnailUrl: string;
  accent: string;
  badge: string;
  tags: string[];
  featured: boolean;
  detailUrl: string;
};

export type LmsPublicCoursesResponse = {
  catalogUrl: string;
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
  courses: LmsPublicCourse[];
};

export type LmsErrorBody = {
  error: {
    code: string;
    message: string;
  };
};
