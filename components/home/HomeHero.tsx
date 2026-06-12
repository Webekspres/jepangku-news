"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

const QUICK_LINKS = [
  { label: "Berita", href: "/articles" },
  { label: "Jepangku TV", href: "#home-section-tv" },
  { label: "Kursus", href: "https://dev.kursus.jepangku.com/kursus" },
  { label: "Kuis", href: "/quizzes" },
  { label: "Poll", href: "/polls" },
] as const;

export default function HomeHero() {
  const router = useRouter();
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
          <span className="text-jepang-red">Belajar Bahasa Jepang</span>
        </>
      }
      subtitle="Pusat ekosistem Jepangku — baca berita, tonton video, belajar bahasa, ikut kuis & polling, raih poin!"
      dark
      className="relative border-b border-jepang-border bg-jepang-navy overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="asanoha-bg" />
      </div>

      <div className="relative flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {QUICK_LINKS.map((link) => {
            const isExternal = link.href.startsWith("http");
            return (
              <Link
                key={link.label}
                href={link.href}
                {...(isExternal
                  ? {
                      target: "_blank",
                      rel: "noopener noreferrer",
                    }
                  : {})}
                className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:border-jepang-red hover:bg-jepang-red/20"
                data-testid={`hero-quick-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <form
            onSubmit={handleHeroSearch}
            className="flex w-full max-w-xl shrink-0"
            data-testid="hero-search-form"
          >
            <input
              type="text"
              placeholder="Cari artikel, topik, atau budaya Jepang..."
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              className="min-w-0 flex-1 bg-white text-foreground px-4 py-3 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-jepang-red"
              data-testid="hero-search-input"
            />
            <button
              type="submit"
              className="bg-jepang-red text-white px-5 py-3 hover:bg-jepang-red-hover transition-colors shrink-0"
              aria-label="Cari"
              data-testid="hero-search-submit"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
          </form>
          <Link
            href="/sign-up"
            className="jepang-btn-primary hidden md:inline-flex shrink-0"
            data-testid="hero-register-btn"
          >
            Gabung Sekarang
            <ArrowRight className="inline ml-2" size={16} />
          </Link>
        </div>
      </div>
    </SectionHeader>
  );
}
