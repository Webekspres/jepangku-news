"use client";

import Link from "next/link";
import { ArrowRight, Award, BarChart3, BookOpen, Clock, GraduationCap } from "lucide-react";
import LazySectionSkeleton from "@/components/home/LazySectionSkeleton";
import { Button } from "@/components/ui/button";
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
  N5: "from-jepang-red via-jepang-orange to-jepang-yellow",
  N4: "from-blue-600 to-blue-900",
  N3: "from-amber-500 to-amber-700",
  N2: "from-violet-600 to-violet-900",
  N1: "from-jepang-red to-rose-900",
};

function LmsComingSoonPlaceholder({ catalogUrl }: { catalogUrl: string }) {
  return (
    <div
      className="relative mb-10 border-2 border-white/15 bg-[#0b1a2e] px-6 py-12 text-center"
      data-testid="lms-coming-soon"
    >
      {/* Kadomaku corner brackets */}
      <div className="absolute top-2 left-2 z-20 size-5 border-t-2 border-l-2 border-white/20" aria-hidden />
      <div className="absolute top-2 right-2 z-20 size-5 border-t-2 border-r-2 border-white/20" aria-hidden />
      <div className="absolute bottom-2 left-2 z-20 size-5 border-b-2 border-l-2 border-white/20" aria-hidden />
      <div className="absolute bottom-2 right-2 z-20 size-5 border-b-2 border-r-2 border-white/20" aria-hidden />

      <div className="mx-auto mb-4 flex size-14 items-center justify-center border-2 border-white/15 bg-[#0b1a2e]">
        <BookOpen size={28} className="text-jepang-red" strokeWidth={1.5} aria-hidden />
      </div>
      <h3 className="font-heading text-xl font-bold tracking-tight text-white">
        Katalog Kursus Segera Hadir
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
        Tim Jepangku sedang menyiapkan kursus JLPT interaktif. Sementara itu, kunjungi
        portal LMS untuk info terbaru dan pendaftaran awal.
      </p>
      <Button
        asChild
        className="mt-6 bg-jepang-red text-white hover:bg-jepang-red/90"
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
      className="group flex h-full w-full max-w-sm flex-col overflow-hidden border-2 border-white/15 bg-[#0b1a2e] transition-all duration-300 hover:border-jepang-red/70 hover:bg-[#0e1f36] cursor-pointer sm:w-72"
      data-testid={`lms-course-card-${course.slug}`}
    >
      {/* ── Header — Japanese poster style ── */}
      <div
        className={cn(
          "relative flex aspect-[16/9] items-center overflow-hidden bg-linear-to-br",
          LEVEL_GRADIENT[course.level],
        )}
      >
        {/* Corner brackets (kadomaru) — Japanese framing */}
        <div className="absolute top-2 left-2 z-20 size-5 border-t-2 border-l-2 border-white/40" aria-hidden />
        <div className="absolute top-2 right-2 z-20 size-5 border-t-2 border-r-2 border-white/40" aria-hidden />
        <div className="absolute bottom-2 left-2 z-20 size-5 border-b-2 border-l-2 border-white/40" aria-hidden />
        <div className="absolute bottom-2 right-2 z-20 size-5 border-b-2 border-r-2 border-white/40" aria-hidden />

        {/* Diagonal slash — dramatic Japanese poster aesthetic */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 8px,
              rgba(255,255,255,0.06) 8px,
              rgba(255,255,255,0.06) 16px
            )`,
          }}
          aria-hidden
        />

        {/* Wave motif (seigaiha-inspired) — bottom edge */}
        <div
          className="absolute -bottom-1 left-0 right-0 h-4 opacity-25"
          style={{
            backgroundImage: `
              radial-gradient(circle 8px at 8px 0, white 7px, transparent 8px),
              radial-gradient(circle 8px at 24px 0, white 7px, transparent 8px),
              radial-gradient(circle 8px at 40px 0, white 7px, transparent 8px)
            `,
            backgroundSize: "32px 8px",
            backgroundRepeat: "repeat-x",
          }}
          aria-hidden
        />

        {/* Level stamp — square hanko-style seal */}
        <div className="relative z-10 ml-5 flex items-center gap-4">
          <div className="flex size-16 items-center justify-center border-[3px] border-white/90 bg-black/30 shadow-lg shadow-black/40">
            <span className="font-heading text-2xl font-black tracking-tighter text-white">
              {course.level}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold tracking-[0.25em] text-white/50 uppercase">
              Jlpt {course.level}
            </span>
            <span className="text-[11px] font-medium text-white/80">
              {course.badge}
            </span>
          </div>
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        {/* Title with decorative diamond prefix */}
        <h3 className="font-heading text-lg font-bold leading-snug tracking-tight text-white line-clamp-2 transition-colors duration-300 group-hover:text-jepang-red">
          <span className="mr-2 text-jepang-red" aria-hidden>◆</span>
          {course.title}
        </h3>

        <p className="text-sm leading-relaxed text-zinc-400 line-clamp-2">
          {course.description}
        </p>

        {/* Gold/red gradient divider */}
        <div className="my-1 h-px bg-linear-to-r from-transparent via-jepang-red/50 to-transparent" aria-hidden />

        {/* Metadata — Japanese-style with ・ separator */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-medium text-zinc-400">
          <span className="flex items-center gap-1.5">
            <BookOpen size={12} className="shrink-0 text-jepang-red" />
            {course.lessons}課
          </span>
          <span className="text-zinc-600" aria-hidden>・</span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} className="shrink-0 text-jepang-red" />
            {course.duration}
          </span>
          {course.price !== "Gratis" && (
            <span className="text-zinc-600" aria-hidden>・</span>
          )}
          <span className="ml-auto text-xs font-bold tracking-wide text-white">
            {course.price}
          </span>
        </div>

        {course.availabilityLabel && (
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            {course.availabilityLabel}
          </p>
        )}

        {/* CTA — bold, right-aligned */}
        <div className="mt-auto flex items-center justify-end gap-2 border-t border-white/10 pt-3">
          <span className="text-sm font-bold text-jepang-red transition-all duration-300 group-hover:opacity-80">
            Lihat Kursus
          </span>
          <ArrowRight
            size={16}
            strokeWidth={2.5}
            className="text-jepang-red transition-all duration-300 group-hover:translate-x-1.5 group-hover:-rotate-12"
          />
        </div>
      </div>
    </Link>
  );
}

export default function HomeLmsTeaser({ data, loading, error }: HomeLmsTeaserProps) {
  if (error) {
    return (
      <section className="relative overflow-hidden py-12 bg-jepang-navy text-white">
        <div
          className="absolute inset-0 bg-[url('/assets/images/bg-lms.webp')] bg-cover bg-center opacity-15"
          aria-hidden="true"
        />
        <div className="relative z-10 px-4 mx-auto max-w-7xl text-center text-sm text-zinc-400">
          Gagal memuat kursus bahasa Jepang.
        </div>
      </section>
    );
  }

  if (loading || !data) {
    return (
      <section className="relative overflow-hidden py-12 bg-jepang-navy text-white">
        <div
          className="absolute inset-0 bg-[url('/assets/images/bg-lms.webp')] bg-cover bg-center opacity-15"
          aria-hidden="true"
        />
        <div className="relative z-10 px-4 mx-auto max-w-7xl">
          <LmsSkeleton />
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden py-12 bg-jepang-navy text-white" data-testid="home-lms-teaser">
        <div
          className="absolute inset-0 bg-[url('/assets/images/bg-lms.webp')] bg-cover bg-center opacity-15"
          aria-hidden="true"
        />
      <div className="relative z-10 px-4 mx-auto max-w-7xl">
        <AssetImage
          src="/assets/images/icons/sensei-mascot.webp"
          alt="Sensei Jepangku"
          width={320}
          height={320}
          className="hidden shrink-0 object-contain object-bottom lg:absolute lg:-bottom-25 lg:-right-40 lg:block lg:w-130"
        />
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8 pb-3 border-b-2 border-jepang-red">
          <div>
            <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tighter flex items-center gap-3">
              <BookOpen size={32} strokeWidth={1.5} className="text-jepang-red shrink-0" />
              <span className="bg-linear-to-r from-jepang-red via-jepang-orange to-jepang-yellow bg-clip-text text-transparent">
                Belajar Bahasa Jepang
              </span>
            </h2>
            <p className="mt-2 text-sm text-zinc-300 max-w-2xl">
              Kursus JLPT interaktif dengan progress tracking — powered by Jepangku LMS.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 self-start md:self-end">
            <Link
              href={data.catalogUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="lms-nihongo-logo-link"
            >
              <AssetImage
                src="/assets/images/logo/logo-nihongo.webp"
                alt="Jepangku Nihongo LMS"
                width={400}
                height={98}
                className="w-56 h-auto opacity-90 transition-opacity hover:opacity-100 md:w-72"
                unoptimized={true}
              />
            </Link>
          </div>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {data.highlights.map((item, index) => {
            const Icon = HIGHLIGHT_ICONS[index] ?? GraduationCap;
            return (
              <li
                key={item.title}
                className="relative flex gap-3 border-2 border-white/15 bg-[#0b1a2e] p-4 transition-all duration-300 hover:border-white/25 hover:bg-[#0e1f36]"
                data-testid={`lms-highlight-${index}`}
              >
                {/* Kadomaku corner brackets */}
                <div className="absolute top-1 left-1 size-3 border-t border-l border-white/20" aria-hidden />
                <div className="absolute top-1 right-1 size-3 border-t border-r border-white/20" aria-hidden />
                <div className="absolute bottom-1 left-1 size-3 border-b border-l border-white/20" aria-hidden />
                <div className="absolute bottom-1 right-1 size-3 border-b border-r border-white/20" aria-hidden />

                <Icon size={20} className="shrink-0 text-jepang-red mt-0.5" strokeWidth={1.5} />
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
          <div className="relative flex flex-col items-center gap-6 md:gap-8 lg:min-h-128 lg:block">
            <div className="flex w-full flex-col items-center gap-6 md:gap-8 lg:max-w-2xl">
              <div className="flex flex-wrap justify-center gap-6">
                {data.courses.slice(0, 3).map((course) => (
                  <CourseCard key={course.slug} course={course} />
                ))}
              </div>

            </div>

            {data.source === "live" && (
              <div className="relative z-20 isolate flex w-full justify-center p-3 lg:absolute lg:right-6 lg:bottom-6 lg:w-auto lg:p-4">
                <div
                  className="pointer-events-none absolute inset-0 -z-10 border border-white/15 bg-linear-to-r from-jepang-navy/95 via-jepang-navy/90 to-jepang-red/35 shadow-xl shadow-black/40 backdrop-blur-md lg:-inset-x-6 lg:-inset-y-4"
                  aria-hidden
                />
                <div className="pointer-events-none absolute top-0 left-0 size-3 border-t-2 border-l-2 border-jepang-red" aria-hidden />
                <div className="pointer-events-none absolute right-0 bottom-0 size-3 border-r-2 border-b-2 border-jepang-red" aria-hidden />
                <Button
                  asChild
                  className="group border-2 border-white/30 bg-jepang-red px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-black/40 transition-colors hover:border-white/60 hover:bg-jepang-red-hover"
                  data-testid="lms-catalog-cta"
                >
                  <Link href={data.catalogUrl} target="_blank" rel="noopener noreferrer">
                    Jelajahi Semua Kursus
                    <ArrowRight
                      size={16}
                      strokeWidth={2}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
