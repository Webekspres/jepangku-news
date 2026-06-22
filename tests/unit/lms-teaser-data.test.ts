import { describe, expect, it } from "bun:test";
import {
  getLmsTeaserPlaceholder,
  mapLmsPublicCoursesToTeaser,
} from "@/lib/home/lms-teaser-data";
import type { LmsPublicCoursesResponse } from "@/lib/lms/types";

const SAMPLE_LIVE_PAYLOAD: LmsPublicCoursesResponse = {
  catalogUrl: "https://dev.kursus.jepangku.com/kursus",
  meta: { total: 1, limit: 3, offset: 0 },
  courses: [
    {
      slug: "jlpt-n5-pemula",
      title: "JLPT N5 untuk Pemula",
      description: "Mulai dari hiragana hingga kosakata dasar.",
      level: "N5",
      lessons: 24,
      duration: "8 jam",
      availability: "tersedia",
      availabilityLabel: "Tersedia sekarang",
      price: "Rp 199.000",
      thumbnailUrl: "https://cdn.example.com/n5.jpg",
      accent: "#10b981",
      badge: "Populer",
      tags: ["pemula"],
      featured: true,
      detailUrl: "/kursus/jlpt-n5-pemula",
    },
  ],
};

describe("§13.1 LMS teaser placeholder fallback", () => {
  it("getLmsTeaserPlaceholder returns source placeholder with empty courses", () => {
    const data = getLmsTeaserPlaceholder();
    expect(data.source).toBe("placeholder");
    expect(data.courses).toEqual([]);
    expect(data.highlights.length).toBeGreaterThan(0);
    expect(data.catalogUrl).toContain("utm_source=jepangku.com");
    expect(data.catalogUrl).toContain("utm_medium=homepage-lms-placeholder");
  });
});

describe("§13.3 LMS teaser live course cards", () => {
  it("mapLmsPublicCoursesToTeaser maps courses with UTM card links", () => {
    const data = mapLmsPublicCoursesToTeaser(SAMPLE_LIVE_PAYLOAD);
    expect(data.source).toBe("live");
    expect(data.courses).toHaveLength(1);
    const course = data.courses[0]!;
    expect(course.slug).toBe("jlpt-n5-pemula");
    expect(course.title).toBe("JLPT N5 untuk Pemula");
    expect(course.href).toContain("/kursus/jlpt-n5-pemula");
    expect(course.href).toContain("utm_medium=homepage-lms-card");
    expect(course.href).toContain("utm_campaign=jlpt-n5-pemula");
    expect(data.catalogUrl).toContain("utm_medium=homepage-lms-catalog");
  });
});
