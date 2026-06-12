import type { Video } from "@prisma/client";
import { youtubeThumbnailUrl } from "@/lib/video/youtube";

export type PublicVideo = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  youtubeId: string;
  thumbnailUrl: string;
  publishedAt: string | null;
  viewCount: number;
  isFeatured: boolean;
};

export function serializePublicVideo(video: Video): PublicVideo {
  return {
    id: video.id,
    title: video.title,
    slug: video.slug,
    description: video.description,
    youtubeId: video.youtubeId,
    thumbnailUrl: video.thumbnailUrl ?? youtubeThumbnailUrl(video.youtubeId),
    publishedAt: video.publishedAt?.toISOString() ?? null,
    viewCount: video.viewCount,
    isFeatured: video.isFeatured,
  };
}

export const publishedVideoWhere = {
  status: "PUBLISHED" as const,
  OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
};
