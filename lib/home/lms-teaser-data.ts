/**
 * Static LMS homepage teaser — Fase 5.
 * Sync manually with jepangkuLMS/features/learning/components/courses-data.ts (featured courses).
 */
import { buildLmsUrl } from "@/lib/lms/constants";
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

const FEATURED_COURSES: Omit<LmsTeaserCourse, "href">[] = [
  {
    slug: "jlpt-n5-kursus-lengkap",
    title: "JLPT N5 — Kursus Lengkap",
    level: "N5",
    description:
      "Dari nol sampai lulus N5! Hiragana, Katakana, 100 Kanji, tata bahasa dasar, dan simulasi ujian.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1613817048356-ef14b4acc3a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    badge: "入門",
    price: "Gratis",
    duration: "18 jam",
    lessons: 60,
    availability: "tersedia",
    availabilityLabel: "Modul awal tersedia",
  },
  {
    slug: "n4-tata-bahasa-intensif",
    title: "N4 Tata Bahasa Intensif",
    level: "N4",
    description:
      "Pola kalimat N4 lengkap: て-form, たい, から, まで, dan 40+ pola lainnya.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1593839154339-377e24b3ba32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    badge: "基礎",
    price: "Rp 299K",
    duration: "14 jam",
    lessons: 35,
    availability: "segera",
    availabilityLabel: "Segera hadir",
  },
  {
    slug: "jlpt-n3-kursus-menengah",
    title: "JLPT N3 — Kursus Menengah",
    level: "N3",
    description:
      "Kuasai N3 dengan 650 kanji, tata bahasa kompleks, dan reading comprehension.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1670233449318-2ddb73e062e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    badge: "中級",
    price: "Rp 449K",
    duration: "28 jam",
    lessons: 60,
    availability: "segera",
    availabilityLabel: "Segera hadir",
  },
];

export function getLmsTeaserData(): HomeLmsTeaserResponse {
  return {
    catalogUrl: buildLmsUrl("/kursus"),
    highlights: [...LMS_TEASER_HIGHLIGHTS],
    courses: FEATURED_COURSES.map((course) => ({
      ...course,
      href: buildLmsUrl(`/kursus/${course.slug}`, {
        medium: "homepage-lms-card",
        campaign: course.slug,
      }),
    })),
  };
}
