import { apiError, apiSuccess } from '@/lib/api-response';
import { db } from "@/lib/db";
import {
  publishedVideoWhere,
  serializePublicVideo,
} from "@/lib/video/serialize";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
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
}
