import Link from "next/link";
import type { HomeSectionId } from "@/lib/home/sections";
import { getSectionConfig } from "@/lib/home/sections";

type HomePlaceholderSectionProps = {
  sectionId: HomeSectionId;
  labelJp?: string;
  description?: string;
  ctaHref?: string;
  ctaLabel?: string;
  variant?: "default" | "dark" | "accent";
};

const SECTION_COPY: Partial<
  Record<
    HomeSectionId,
    { labelJp: string; description: string; ctaHref?: string; ctaLabel?: string; variant?: "default" | "dark" | "accent" }
  >
> = {
  "categories-editorial": {
    labelJp: "カテゴリ / KATEGORI",
    description:
      "Kurasi editorial Anime Manga, Entertainment, Lifestyle, Culture, dan Halal in Japan.",
    ctaHref: "/articles",
    ctaLabel: "Jelajahi Artikel",
  },
  tv: {
    labelJp: "テレビ / JEPANGKU TV",
    description:
      "Video eksplorasi budaya, wisata, dan hiburan Jepang — featured embed + daftar episode.",
    variant: "accent",
  },
  ads: {
    labelJp: "パートナー / PARTNER",
    description: "Slot iklan dan kemitraan brand.",
  },
  lms: {
    labelJp: "学ぶ / BELAJAR BAHASA JEPANG",
    description:
      "Kursus JLPT N5–N1, progress tracking, dan sertifikat — powered by Jepangku LMS.",
    ctaHref: "https://dev.kursus.jepangku.com/kursus?utm_source=jepangku.com&utm_medium=homepage",
    ctaLabel: "Jelajahi Kursus",
    variant: "dark",
  },
  reactions: {
    labelJp: "リアクション / REAKSI",
    description:
      "Artikel paling direaksi komunitas — ❤️ 😂 🥰 😎 dan emoji interaktif lainnya.",
    ctaHref: "/articles",
    ctaLabel: "Baca Artikel",
  },
};

export default function HomePlaceholderSection({
  sectionId,
  labelJp,
  description,
  ctaHref,
  ctaLabel,
  variant = "default",
}: HomePlaceholderSectionProps) {
  const config = getSectionConfig(sectionId);
  const copy = SECTION_COPY[sectionId];

  const jp = labelJp ?? copy?.labelJp ?? "";
  const desc = description ?? copy?.description ?? config.label;
  const href = ctaHref ?? copy?.ctaHref;
  const cta = ctaLabel ?? copy?.ctaLabel;
  const style = variant ?? copy?.variant ?? "default";

  const bgClass =
    style === "dark"
      ? "bg-jepang-navy text-white"
      : style === "accent"
        ? "bg-jepang-orange text-white"
        : "bg-jepang-off-white";

  const mutedClass =
    style === "default" ? "text-jepang-muted" : "text-white/80";

  return (
    <section className={`py-12 ${bgClass}`}>
      <div className="px-4 mx-auto max-w-7xl">
        <div className="rounded-lg border border-dashed border-current/20 p-8 md:p-12 text-center">
          {jp ? (
            <p
              className={`small-caps mb-2 ${style === "default" ? "text-jepang-red" : "text-white/90"}`}
            >
              {jp}
            </p>
          ) : null}
          <h2 className="font-heading font-black text-2xl md:text-3xl tracking-tighter mb-3">
            {config.label}
          </h2>
          <p className={`max-w-xl mx-auto text-sm mb-6 ${mutedClass}`}>
            {desc}
          </p>
          <p className={`text-xs uppercase tracking-wider mb-4 ${mutedClass}`}>
            Segera hadir — Fase implementasi berikutnya
          </p>
          {href && cta ? (
            <Link
              href={href}
              {...(href.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className={
                style === "default"
                  ? "jepang-btn-primary inline-flex"
                  : "inline-flex rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold hover:bg-white/20 transition-colors"
              }
              data-testid={`home-placeholder-cta-${sectionId}`}
            >
              {cta}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
