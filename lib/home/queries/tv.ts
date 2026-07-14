import { db } from "@/lib/db";
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

  const featured =
    flagged ??
    (await db.video.findFirst({
      where: publishedVideoWhere,
      orderBy: [
        { viewCount: "desc" },
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
    }));

  const sidebar = await db.video.findMany({
    where: {
      ...publishedVideoWhere,
      ...(featured ? { id: { not: featured.id } } : {}),
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 7,
  });

  return {
    featuredVideo: featured ? serializePublicVideo(featured) : null,
    sidebarVideos: sidebar.map(serializePublicVideo),
  };
}
