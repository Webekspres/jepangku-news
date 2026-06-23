"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { parseApiResponse } from "@/lib/fetch-api";
import SectionHeader from "@/components/SectionHeader";
import ExploreContentSections from "@/components/explore/ExploreContentSections";
import type { ExploreResponse } from "@/lib/explore/types";
import { Compass } from "lucide-react";

export default function ExplorePage() {
  const [data, setData] = useState<ExploreResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/explore")
      .then((r) => parseApiResponse(r))
      .then((d) => setData(d as ExploreResponse))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
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
        subtitle="Temukan artikel, kuis, polling, video, dan komunitas Jepangku — semuanya dalam satu tempat."
      />

      <div className="px-4 mx-auto max-w-7xl py-12">
        {error ? (
          <p className="text-center text-sm text-jepang-muted py-12">
            Gagal memuat konten. Silakan muat ulang halaman.
          </p>
        ) : (
          <ExploreContentSections data={data} loading={loading} />
        )}
      </div>
    </div>
  );
}
