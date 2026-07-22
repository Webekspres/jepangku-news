"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import AssetImage from "@/components/AssetImage";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { MotionHoverScale } from "@/components/ui/motion";
import {
  getAuthLoginPath,
  isAuthUser,
  useAuth,
} from "@/contexts/AuthContext";

const LP_HOME_URL = "https://lp.jepangku.com/";

/** Jalur ekosistem dari https://lp.jepangku.com/ */
const PATH_BUBBLES = [
  {
    label: "Belajar",
    href: "https://kursus.jepangku.com",
    icon: "/assets/images/lp-paths/study.webp",
  },
  {
    label: "Bekerja",
    href: "https://work.jepangku.com",
    icon: "/assets/images/lp-paths/work.webp",
  },
  {
    label: "Bisnis",
    href: "https://business.jepangku.com",
    icon: "/assets/images/lp-paths/business.webp",
  },
  {
    label: "Berkarya",
    href: "https://kreator.jepangku.com",
    icon: "/assets/images/lp-paths/creator.webp",
  },
  {
    label: "Berita",
    href: "https://jepangku.com",
    icon: "/assets/images/lp-paths/news.webp",
  },
  {
    label: "Konsultan",
    href: "https://konsultan.jepangku.com",
    icon: "/assets/images/lp-paths/live.webp",
  },
  {
    label: "Wisata",
    href: "https://travel.jepangku.com",
    icon: "/assets/images/lp-paths/travel.webp",
  },
  {
    label: "Event",
    href: "https://event.jepangku.com",
    icon: "/assets/images/lp-paths/entertainment.webp",
  },
] as const;

export default function HomeHero() {
  const { user, isLoaded, isSignedIn, loading, clerkUser } = useAuth();
  const authUser = isAuthUser(user) ? user : null;
  const showAuthenticated = Boolean(
    authUser || (isSignedIn && !loading && clerkUser),
  );

  return (
    <SectionHeader
      title={
        <>
          Pilih jalan menuju
          <br />
          <span className="text-jepang-yellow">Jepang Versi Kamu</span>
        </>
      }
      bgImage="/assets/images/bg-hero.webp"
      bgImageClassName="object-cover object-left"
      dark
      titleClassName="mb-0 max-w-2xl md:text-5xl lg:max-w-3xl lg:text-6xl"
      childrenClassName="mt-2"
      className="relative border-b border-jepang-border py-8 md:py-10"
    >
      <div className="relative">
        <div className="relative z-10 flex min-w-0 flex-col gap-4 lg:max-w-[58%] xl:max-w-[55%]">
          <nav
            aria-label="Pilih jalur Jepang Versi Kamu"
            className="grid w-full grid-cols-4 gap-x-3 gap-y-3 py-1 sm:gap-x-5 sm:gap-y-4 md:gap-x-6"
          >
            {PATH_BUBBLES.map((bubble) => (
              <Link
                key={bubble.label}
                href={bubble.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group mx-auto flex w-full max-w-16 flex-col items-center gap-1 text-center sm:max-w-18 md:max-w-20"
                data-testid={`hero-path-${bubble.label.toLowerCase()}`}
              >
                <MotionHoverScale scale={1.06} className="w-full origin-center">
                  <span className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-full p-1 shadow-[0_8px_20px_rgba(31,95,168,0.25),inset_0_0_14px_rgba(255,255,255,0.35)] transition-shadow duration-300 ease-out group-hover:shadow-[0_12px_28px_rgba(31,95,168,0.35),inset_0_0_18px_rgba(255,255,255,0.5)]">
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-linear-to-br from-white/60 via-white/40 to-white/25"
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-[14%] rounded-full bg-[radial-gradient(circle,rgba(255,182,203,0.45)_0%,transparent_70%)]"
                    />
                    <AssetImage
                      src={bubble.icon}
                      alt={bubble.label}
                      width={320}
                      height={320}
                      quality={95}
                      sizes="(max-width: 640px) 112px, (max-width: 768px) 128px, 160px"
                      className="relative z-10 size-full object-contain drop-shadow-sm"
                    />
                  </span>
                </MotionHoverScale>
                <span className="text-[10px] font-bold leading-tight tracking-wide text-white drop-shadow-sm sm:text-[11px] md:text-xs">
                  {bubble.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="flex flex-row flex-wrap items-center gap-3">
            {isLoaded && showAuthenticated ? (
              <Button
                asChild
                className="bg-jepang-yellow text-jepang-navy hover:bg-jepang-yellow/90 hover:border-jepang-yellow/90"
                data-testid="hero-dashboard-btn"
              >
                <Link href="/profile">
                  <LayoutDashboard size={16} />
                  Profil Saya
                </Link>
              </Button>
            ) : isLoaded ? (
              <>
                <Button
                  asChild
                  className="border-white bg-white text-jepang-red hover:border-white/90 hover:bg-white/90"
                  data-testid="hero-lp-cta-btn"
                >
                  <a href={LP_HOME_URL} target="_blank" rel="noopener noreferrer">
                    Cari Versi Kamu
                    <ArrowRight size={16} />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:border-white/40 hover:bg-white/20 hover:text-white"
                  data-testid="hero-login-btn"
                >
                  <Link href={getAuthLoginPath()}>
                    Masuk
                    <ArrowRight size={16} />
                  </Link>
                </Button>
              </>
            ) : (
              <div className="h-12 w-40 animate-pulse rounded-lg bg-white/10" />
            )}
          </div>
        </div>

        {/* Absolute di kanan section: naik ke samping judul, kaki terpotong di bawah */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-4 -top-44 hidden w-[min(46vw,520px)] lg:block xl:-right-8 xl:w-[min(44vw,580px)]"
        >
          <AssetImage
            src="/assets/images/icons/anime-mascot.webp"
            alt=""
            width={1024}
            height={1536}
            quality={92}
            priority
            sizes="(min-width: 1280px) 560px, (min-width: 1024px) 480px, 0px"
            className="h-auto w-full translate-y-16 object-contain object-top drop-shadow-lg xl:translate-y-20"
          />
        </div>
      </div>
    </SectionHeader>
  );
}
