import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { db } from "@/lib/db";
import { ensureInstagramThumbnail } from "@/lib/video/fetch-external-thumbnail";
import {
  publishedVideoWhere,
  serializePublicVideo,
} from "@/lib/video/serialize";
import { withRequestLogging } from '@/lib/logging/request-logger';

type Params = { params: Promise<{ slug: string }> };

const GET = withRequestLogging(async (_request: NextRequest, { params }: Params) => {
  const { slug } = await params;

  const video = await db.video.findFirst({
    where: { slug, ...publishedVideoWhere },
  });

  if (!video) {
    return apiError("Video not found" , { status: 404 });
  }

  const withThumb = await ensureInstagramThumbnail(video);

  const updated = await db.video.update({
    where: { id: withThumb.id },
    data: { viewCount: { increment: 1 } },
  });

  // Pertahankan thumbnail yang baru di-backfill (increment tidak mengubah field lain)
  return apiSuccess(
    serializePublicVideo({
      ...updated,
      thumbnailUrl: withThumb.thumbnailUrl ?? updated.thumbnailUrl,
    }),
  );
});

export { GET };
