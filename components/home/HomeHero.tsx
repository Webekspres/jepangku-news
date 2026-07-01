"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LayoutDashboard, Search } from "lucide-react";
import AssetImage from "@/components/AssetImage";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import {
  getAuthLoginPath,
  getAuthRegisterPath,
  isAuthUser,
  useAuth,
} from "@/contexts/AuthContext";
import { buildLmsUrl } from "@/lib/lms/constants";

const QUICK_LINKS = [
  { label: "Berita", href: "/articles", external: false },
  { label: "Jepangku TV", href: "/tv", external: false },
  {
    label: "Kursus",
    href: buildLmsUrl("/kursus"),
    external: true,
  },
  { label: "Kuis", href: "/quizzes", external: false },
  { label: "Poll", href: "/polls", external: false },
] as const;

export default function HomeHero() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn, loading, clerkUser } = useAuth();
  const authUser = isAuthUser(user) ? user : null;
  const showAuthenticated = Boolean(
    authUser || (isSignedIn && !loading && clerkUser),
  );

  const [heroSearch, setHeroSearch] = useState("");

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroSearch.trim()) return;
    router.push(`/search?q=${encodeURIComponent(heroSearch.trim())}`);
  };

  return (
    <SectionHeader
      label="日本のポータル / PORTAL JEPANG"
      title={
        <>
          Berita, Budaya, Video &{" "}
          <span className="text-jepang-yellow">Belajar Bahasa Jepang</span>
        </>
      }
      subtitle="Pusat ekosistem Jepangku — baca berita, tonton video, belajar bahasa, ikut kuis & polling, raih poin!"
      dark
      titleClassName="md:text-6xl"
      labelClassName="!text-white/85"
      className="relative border-b border-jepang-border overflow-visible py-10 md:py-14 bg-[linear-gradient(to_right,#ec1d24_0%,#ff4b2b_100%)]"
    >

      <div className="relative overflow-visible">
        <div className="relative z-10 flex flex-col gap-5 md:gap-6 lg:pr-64 xl:pr-80">
          <nav
            aria-label="Navigasi cepat ekosistem"
            className="flex flex-wrap gap-2"
          >
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:border-white hover:bg-white/25"
                data-testid={`hero-quick-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            <form
              onSubmit={handleHeroSearch}
              className="flex min-w-0 w-full max-w-xl flex-1 overflow-hidden rounded-md shadow-jepang lg:flex-none"
              data-testid="hero-search-form"
            >
              <input
                type="text"
                placeholder="Cari artikel, topik, atau budaya Jepang..."
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                className="min-w-0 flex-1 border-0 bg-white px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-jepang-navy"
                data-testid="hero-search-input"
              />
              <button
                type="submit"
                className="shrink-0 bg-jepang-navy px-5 py-3 text-white transition-colors hover:bg-[#2a2668]"
                aria-label="Cari"
                data-testid="hero-search-submit"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>
            </form>

            <div className="flex shrink-0 flex-row flex-wrap items-center gap-3">
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
                    data-testid="hero-register-btn"
                  >
                    <Link href={getAuthRegisterPath()}>
                      Gabung Sekarang
                      <ArrowRight size={16} />
                    </Link>
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
        </div>

        <div className="pointer-events-none hidden lg:absolute lg:bottom-0 lg:right-0 lg:block lg:w-[18rem] xl:w-88 translate-y-10">
          <AssetImage
            src="/assets/images/icons/multiple-icon.webp"
            alt="Mascot Jepangku"
            width={320}
            height={320}
            className="h-auto w-full object-contain object-top"
          />
        </div>
      </div>
    </SectionHeader>
  );
}
