"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { parseApiResponse } from "@/lib/fetch-api";
import ArticleDetailContent from "@/components/articles/ArticleDetailContent";
import ArticleDetailHero from "@/components/articles/ArticleDetailHero";
import ArticleSidebarAd from "@/components/articles/ArticleSidebarAd";
import CommentSection from "@/components/CommentSection";
import ReactionBar from "@/components/ReactionBar";
import LazyVideoEmbed from "@/components/video/LazyVideoEmbed";
import VideoBreadcrumb from "@/components/videos/VideoBreadcrumb";
import VideoDetailMetaBar from "@/components/videos/VideoDetailMetaBar";
import type { PublicVideoSummary } from "@/lib/home/types";

type VideoDetailClientProps = {
  slug: string;
};

export default function VideoDetailClient({ slug }: VideoDetailClientProps) {
  const router = useRouter();
  const [video, setVideo] = useState<PublicVideoSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const isLoading = loading && !video;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/videos/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return parseApiResponse<PublicVideoSummary>(r);
      })
      .then(setVideo)
      .catch(() => router.push("/tv"))
      .finally(() => setLoading(false));
  }, [router, slug]);

  if (!video && !loading) return null;

  return (
    <div className="bg-white" data-testid="tv-detail-page">
      <article className="px-4 mx-auto max-w-7xl py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <div className="mx-auto w-full max-w-4xl min-w-0 lg:mx-0">
            <VideoBreadcrumb isLoading={isLoading} title={video?.title} />

            {!isLoading && video ? (
              <div className="mb-8 overflow-hidden rounded-lg border border-jepang-border shadow-jepang">
                <LazyVideoEmbed
                  platform={(video.platform ?? "YOUTUBE") as import("@/lib/video/platform").VideoPlatform}
                  embedUrl={video.embedUrl ?? null}
                  videoUrl={video.videoUrl ?? `https://www.youtube.com/watch?v=${video.youtubeId}`}
                  title={video.title}
                  thumbnailUrl={video.thumbnailUrl}
                />
              </div>
            ) : (
              <div className="mb-8 aspect-video w-full animate-pulse rounded-lg bg-jepang-red/10" />
            )}

            <ArticleDetailHero
              isLoading={isLoading}
              title={video?.title}
              excerpt={video?.description}
            />

            <VideoDetailMetaBar
              isLoading={isLoading}
              viewCount={video?.viewCount}
              publishedAt={video?.publishedAt}
            />

            <ArticleDetailContent
              isLoading={isLoading}
              html={video?.content}
            />

            {video && (
              <>
                <ReactionBar targetType="VIDEO" targetId={video.id} />
                <CommentSection targetType="VIDEO" targetId={video.id} />
              </>
            )}
          </div>

          <aside className="hidden lg:block self-start">
            <div className="sticky top-24">
              <ArticleSidebarAd />
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}
