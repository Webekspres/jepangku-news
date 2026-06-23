import { db } from "@/lib/db";
import {
  publishedVideoWhere,
  serializePublicVideo,
} from "@/lib/video/serialize";
import type { HomeTvResponse } from "@/lib/home/types";

export async function fetchHomeTv(): Promise<HomeTvResponse> {
  const featured = await db.video.findFirst({
    where: publishedVideoWhere,
    orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
  });

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
