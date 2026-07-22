import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/api-response';
import { db } from "@/lib/db";
import { ensureInstagramThumbnail } from "@/lib/video/fetch-external-thumbnail";
import {
  publishedVideoWhere,
  serializePublicVideo,
} from "@/lib/video/serialize";
import { withRequestLogging } from '@/lib/logging/request-logger';

const GET = withRequestLogging(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || "12"), 1), 48);
  const page = Math.max(Number(searchParams.get("page") || "1"), 1);
  const sort = searchParams.get("sort") || "newest";

  const orderBy =
    sort === "trending"
      ? [{ viewCount: "desc" as const }, { publishedAt: "desc" as const }]
      : [{ publishedAt: "desc" as const }, { createdAt: "desc" as const }];

  const [total, videosRaw] = await Promise.all([
    db.video.count({ where: publishedVideoWhere }),
    db.video.findMany({
      where: publishedVideoWhere,
      orderBy,
      take: limit,
      skip: (page - 1) * limit,
    }),
  ]);

  const videos = await Promise.all(
    videosRaw.map((video) => ensureInstagramThumbnail(video)),
  );

  return apiSuccess({
    total,
    page,
    limit,
    videos: videos.map(serializePublicVideo),
  });
});

export { GET };
