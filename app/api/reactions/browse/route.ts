import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/api-response';
import {
  browseByReaction,
  parseBrowseTargetType,
  parseReactionTypeParam,
} from "@/lib/reactions/browse";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reactionType = parseReactionTypeParam(searchParams.get("type"));
  const targetType = parseBrowseTargetType(searchParams.get("targetType"));

  if (!reactionType || !targetType) {
    return apiSuccess(
      { error: "Parameter type dan targetType wajib diisi." },
      { status: 400 },
    );
  }

  const limit = Math.min(Math.max(Number(searchParams.get("limit") || "12"), 1), 50);
  const page = Math.max(Number(searchParams.get("page") || "1"), 1);

  const data = await browseByReaction({
    reactionType,
    targetType,
    page,
    limit,
  });

  return apiSuccess(data, { headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
    } });
}
