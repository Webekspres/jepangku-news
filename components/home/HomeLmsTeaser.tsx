"use client";

import Link from "next/link";
import { ArrowRight, Award, BarChart3, BookOpen, GraduationCap } from "lucide-react";
import LazySectionSkeleton from "@/components/home/LazySectionSkeleton";
import { Button } from "@/components/ui/button";
import { MotionHoverScale } from "@/components/ui/motion";
import type { HomeLmsTeaserResponse, LmsTeaserCourse } from "@/lib/home/types";
import { cn } from "@/lib/utils";

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
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-white/15 bg-white/5 transition-colors hover:border-white/30 hover:bg-white/10"
      data-testid={`lms-course-card-${course.slug}`}
    >
      <div className="relative aspect-16/10 overflow-hidden bg-jepang-navy">
        <MotionHoverScale className="h-full w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </MotionHoverScale>
        <span
          className={cn(
            "absolute left-3 top-3 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            LEVEL_BADGE[course.level],
          )}
        >
          {course.level}
        </span>
        <span className="absolute right-3 top-3 rounded bg-black/50 px-2 py-0.5 text-[10px] font-mono text-white">
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
            <p className="section-label mb-1 text-jepang-orange">学ぶ / BELAJAR BAHASA JEPANG</p>
            <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tighter flex items-center gap-3">
              <BookOpen size={32} strokeWidth={1.5} className="text-jepang-orange shrink-0" />
              <span className="section-title-gradient">Belajar Bahasa Jepang</span>
            </h2>
            <p className="mt-2 text-sm text-zinc-300 max-w-2xl">
              Kursus JLPT interaktif dengan progress tracking — powered by Jepangku LMS.
            </p>
          </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {data.courses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>

        <div className="flex justify-center">
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
        </div>
      </div>
    </section>
  );
}
