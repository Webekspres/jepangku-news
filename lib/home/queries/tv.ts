import { db } from "@/lib/db";
import {
  publishedVideoWhere,
  serializePublicVideo,
} from "@/lib/video/serialize";
import type { HomeTvResponse } from "@/lib/home/types";

export async function fetchHomeTv(): Promise<HomeTvResponse> {
  let featured = await db.video.findFirst({
    where: { ...publishedVideoWhere, isFeatured: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  if (!featured) {
    featured = await db.video.findFirst({
      where: publishedVideoWhere,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });
  }

  const sidebar = await db.video.findMany({
    where: {
      ...publishedVideoWhere,
      ...(featured ? { id: { not: featured.id } } : {}),
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 4,
  });

  return {
    featuredVideo: featured ? serializePublicVideo(featured) : null,
    sidebarVideos: sidebar.map(serializePublicVideo),
  };
}
