import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { db } from "@/lib/db";
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

  const updated = await db.video.update({
    where: { id: video.id },
    data: { viewCount: { increment: 1 } },
  });

  return apiSuccess(serializePublicVideo(updated));
});

export { GET };
