"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import PopularTags from "@/components/PopularTags";
import { Compass, TrendingUp, ArrowRight } from "lucide-react";

export default function ExplorePage() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(() => setCategories([]));
  }, []);

  return (
    <div className="bg-white min-h-screen" data-testid="explore-page">
      <SectionHeader
        label="探索 / Jelajahi"
        title={
          <span className="flex items-center gap-3">
            <Compass size={36} strokeWidth={1.5} className="text-jepang-red" />
            Jelajahi Konten
          </span>
        }
        subtitle="Temukan artikel lewat tag populer, kategori, dan artikel yang sedang tren."
      />

      <div className="px-4 mx-auto max-w-7xl py-12 space-y-14">
        <section>
          <Link
            href="/trending"
            className="group flex items-center justify-between border-2 border-foreground p-6 hover:bg-foreground hover:text-white transition-colors"
            data-testid="explore-trending-cta"
          >
            <div className="flex items-center gap-4">
              <TrendingUp size={28} strokeWidth={1.5} className="text-jepang-red group-hover:text-white" />
              <div>
                <h2 className="font-heading font-black text-2xl tracking-tighter">
                  Artikel Sedang Tren
                </h2>
                <p className="text-sm text-jepang-muted group-hover:text-zinc-300 mt-1">
                  Paling banyak dibaca minggu ini
                </p>
              </div>
            </div>
            <ArrowRight size={20} className="shrink-0" />
          </Link>
        </section>

        <section>
          <PopularTags limit={24} title="Tag Populer" />
        </section>

        <section>
          <h2 className="font-heading font-black text-2xl tracking-tighter mb-6">
            Kategori
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/articles?category=${cat.slug}`}
                className="block p-4 border border-jepang-border hover:border-foreground hover:bg-foreground hover:text-white transition-all group"
                data-testid={`explore-category-${cat.slug}`}
              >
                <p className="font-heading font-bold text-lg">{cat.name}</p>
                <p className="text-[10px] font-mono uppercase tracking-wider text-jepang-muted group-hover:text-zinc-400 mt-1">
                  Jelajahi →
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
