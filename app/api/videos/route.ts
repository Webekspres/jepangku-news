import { db } from "@/lib/db";
import {
  publishedVideoWhere,
  serializePublicVideo,
} from "@/lib/video/serialize";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || "12"), 1), 48);
  const page = Math.max(Number(searchParams.get("page") || "1"), 1);
  const sort = searchParams.get("sort") || "newest";

  const orderBy =
    sort === "trending"
      ? [{ viewCount: "desc" as const }, { publishedAt: "desc" as const }]
      : [{ publishedAt: "desc" as const }, { createdAt: "desc" as const }];

  const [total, videos] = await Promise.all([
    db.video.count({ where: publishedVideoWhere }),
    db.video.findMany({
      where: publishedVideoWhere,
      orderBy,
      take: limit,
      skip: (page - 1) * limit,
    }),
  ]);

  return apiSuccess({
    total,
    page,
    limit,
    videos: videos.map(serializePublicVideo),
  });
}
