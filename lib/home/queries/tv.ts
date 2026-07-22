import { db } from "@/lib/db";
import { ensureInstagramThumbnail } from "@/lib/video/fetch-external-thumbnail";
import {
  publishedVideoWhere,
  serializePublicVideo,
} from "@/lib/video/serialize";
import type { HomeTvResponse } from "@/lib/home/types";

/**
 * Featured = video admin bertanda isFeatured.
 * Fallback = viewCount tertinggi jika belum ada yang di-flag.
 */
export async function fetchHomeTv(): Promise<HomeTvResponse> {
  const flagged = await db.video.findFirst({
    where: { ...publishedVideoWhere, isFeatured: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  const featuredRaw =
    flagged ??
    (await db.video.findFirst({
      where: publishedVideoWhere,
      orderBy: [
        { viewCount: "desc" },
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
    }));

  const sidebarRaw = await db.video.findMany({
    where: {
      ...publishedVideoWhere,
      ...(featuredRaw ? { id: { not: featuredRaw.id } } : {}),
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 7,
  });

  const [featured, ...sidebar] = await Promise.all([
    featuredRaw ? ensureInstagramThumbnail(featuredRaw) : Promise.resolve(null),
    ...sidebarRaw.map((video) => ensureInstagramThumbnail(video)),
  ]);

  return {
    featuredVideo: featured ? serializePublicVideo(featured) : null,
    sidebarVideos: sidebar.map(serializePublicVideo),
  };
}
