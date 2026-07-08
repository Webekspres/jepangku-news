"use client";

import Link from "next/link";
import { ArrowRight, Award, BarChart3, BookOpen, GraduationCap } from "lucide-react";
import LazySectionSkeleton from "@/components/home/LazySectionSkeleton";
import { Button } from "@/components/ui/button";
import { MotionHoverScale } from "@/components/ui/motion";
import type { HomeLmsTeaserResponse, LmsTeaserCourse } from "@/lib/home/types";
import { cn } from "@/lib/utils";
import AssetImage from "../AssetImage";

type HomeLmsTeaserProps = {
  data: HomeLmsTeaserResponse | null;
  loading: boolean;
  error: Error | null;
};

const HIGHLIGHT_ICONS = [GraduationCap, BarChart3, Award] as const;

const LEVEL_BADGE: Record<LmsTeaserCourse["level"], string> = {
  N5: "bg-emerald-600 text-white",
  N4: "bg-blue-600 text-white",
  N3: "bg-amber-600 text-white",
  N2: "bg-violet-600 text-white",
  N1: "bg-jepang-red text-white",
};

const LEVEL_GRADIENT: Record<LmsTeaserCourse["level"], string> = {
  N5: "from-emerald-600 to-emerald-800",
  N4: "from-blue-600 to-blue-900",
  N3: "from-amber-500 to-amber-700",
  N2: "from-violet-600 to-violet-900",
  N1: "from-jepang-red to-rose-900",
};

function LmsComingSoonPlaceholder({ catalogUrl }: { catalogUrl: string }) {
  return (
    <div
      className="mb-10 rounded-xl border border-dashed border-white/25 bg-white/5 px-6 py-12 text-center"
      data-testid="lms-coming-soon"
    >
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-jepang-orange/15">
        <BookOpen size={28} className="text-jepang-orange" strokeWidth={1.5} aria-hidden />
      </div>
      <h3 className="font-heading text-xl font-bold tracking-tight text-white">
        Katalog Kursus Segera Hadir
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-300">
        Tim Jepangku sedang menyiapkan kursus JLPT interaktif. Sementara itu, kunjungi
        portal LMS untuk info terbaru dan pendaftaran awal.
      </p>
      <Button
        asChild
        className="mt-6 bg-jepang-orange text-white hover:bg-jepang-orange/90"
        data-testid="lms-placeholder-cta"
      >
        <Link href={catalogUrl} target="_blank" rel="noopener noreferrer">
          Kunjungi Jepangku LMS
          <ArrowRight size={16} />
        </Link>
      </Button>
    </div>
  );
}

function LmsSkeleton() {
  return (
    <LazySectionSkeleton minHeight={640} data-testid="lms-loading">
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-72 bg-white/10 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 bg-white/10 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-4/3 bg-white/10 rounded-lg" />
          ))}
        </div>
      </div>
    </LazySectionSkeleton>
  );
}

function CourseCard({ course }: { course: LmsTeaserCourse }) {
  return (
    <Link
      href={course.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full w-full max-w-sm flex-col overflow-hidden rounded-lg border border-white/15 bg-white/5 transition-colors hover:border-white/30 hover:bg-white/10 sm:w-64"
      data-testid={`lms-course-card-${course.slug}`}
    >
      <div
        className={cn(
          "relative flex aspect-16/10 items-center justify-center overflow-hidden bg-linear-to-br",
          LEVEL_GRADIENT[course.level],
        )}
      >
        <MotionHoverScale className="flex h-full w-full items-center justify-center">
          <span className="font-heading text-6xl font-black tracking-tighter text-white/95 drop-shadow-sm">
            {course.level}
          </span>
        </MotionHoverScale>
        <span
          className={cn(
            "absolute left-3 top-3 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            LEVEL_BADGE[course.level],
          )}
        >
          {course.level}
        </span>
        <span className="absolute right-3 top-3 rounded bg-black/40 px-2 py-0.5 text-[10px] font-mono text-white">
          {course.badge}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-heading text-lg font-bold leading-snug tracking-tight group-hover:text-jepang-orange transition-colors line-clamp-2">
          {course.title}
        </h3>
        <p className="text-sm text-zinc-300 line-clamp-2">{course.description}</p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
          <span>{course.lessons} pelajaran</span>
          <span>·</span>
          <span>{course.duration}</span>
          <span>·</span>
          <span className="text-white">{course.price}</span>
        </div>
        <p className="text-xs text-zinc-400">{course.availabilityLabel}</p>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-jepang-orange group-hover:gap-2 transition-all">
          Lihat Kursus <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}

export default function HomeLmsTeaser({ data, loading, error }: HomeLmsTeaserProps) {
  if (error) {
    return (
      <section className="py-12 bg-jepang-navy text-white">
        <div className="px-4 mx-auto max-w-7xl text-center text-sm text-zinc-400">
          Gagal memuat kursus bahasa Jepang.
        </div>
      </section>
    );
  }

  if (loading || !data) {
    return (
      <section className="py-12 bg-jepang-navy text-white">
        <div className="px-4 mx-auto max-w-7xl">
          <LmsSkeleton />
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-jepang-navy text-white" data-testid="home-lms-teaser">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8 pb-3 border-b-2 border-jepang-red">
          <div>
            <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tighter flex items-center gap-3">
              <BookOpen size={32} strokeWidth={1.5} className="text-jepang-orange shrink-0" />
              <span className="bg-linear-to-r from-jepang-red via-jepang-orange to-jepang-yellow bg-clip-text text-transparent">
                Belajar Bahasa Jepang
              </span>
            </h2>
            <p className="mt-2 text-sm text-zinc-300 max-w-2xl">
              Kursus JLPT interaktif dengan progress tracking — powered by Jepangku LMS.
            </p>
          </div>
          <Link
            href={data.catalogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 self-start md:self-end"
            data-testid="lms-nihongo-logo-link"
          >
            <img
              src="/assets/images/logo/logo-nihongo.webp"
              width={400}
              height={98}
              className="w-72 h-auto opacity-90 transition-opacity hover:opacity-100"
              alt="Jepangku Nihongo LMS"
              draggable={false}
            />
          </Link>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {data.highlights.map((item, index) => {
            const Icon = HIGHLIGHT_ICONS[index] ?? GraduationCap;
            return (
              <li
                key={item.title}
                className="flex gap-3 rounded-lg border border-white/10 bg-white/5 p-4"
                data-testid={`lms-highlight-${index}`}
              >
                <Icon size={20} className="shrink-0 text-jepang-orange mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.description}</p>
                </div>
              </li>
            );
          })}
        </ul>

        {data.source === "placeholder" || data.courses.length === 0 ? (
          <LmsComingSoonPlaceholder catalogUrl={data.catalogUrl} />
        ) : (
          <div className="relative flex flex-col items-center gap-6 overflow-hidden md:gap-8 lg:block">
            <div className="flex w-full flex-col items-center gap-6 md:gap-8 lg:max-w-2xl">
              <div className="flex flex-wrap justify-center gap-6">
                {data.courses.slice(0, 3).map((course) => (
                  <CourseCard key={course.slug} course={course} />
                ))}
              </div>
              {data.source === "live" && data.courses.length > 0 && (
                <Button
                  asChild
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  data-testid="lms-catalog-cta"
                >
                  <Link href={data.catalogUrl} target="_blank" rel="noopener noreferrer">
                    Jelajahi Semua Kursus
                    <ArrowRight size={16} />
                  </Link>
                </Button>
              )}
            </div>
            <AssetImage
              src="/assets/images/icons/mascot.webp"
              alt="Maskot Jepangku"
              width={320}
              height={320}
              className="hidden shrink-0 object-contain object-top lg:absolute lg:bottom-0 lg:right-0 lg:block lg:w-110 lg:translate-y-40"
            />
          </div>
        )}
      </div>
    </section>
  );
}
