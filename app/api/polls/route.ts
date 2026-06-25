import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from '@/lib/api-response';
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "ACTIVE";
  const sort = searchParams.get("sort") || "createdAt:desc";
  const limit = Number(searchParams.get("limit") || "12");
  const page = Math.max(Number(searchParams.get("page") || "1"), 1);

  const where = { status: status.toUpperCase() as any };

  // Parse sort parameter (format: field:direction)
  let orderBy: any = { createdAt: "desc" };
  if (sort.includes(':')) {
    const [field, direction] = sort.split(':');
    orderBy = { [field]: direction };
  }

  const [total, polls] = await Promise.all([
    db.poll.count({ where }),
    db.poll.findMany({
      where,
      orderBy,
      include: {
        questions: {
          orderBy: { sortOrder: "asc" },
          include: {
            options: { select: { voteCount: true } },
          },
        },
      },
      take: limit,
      skip: (page - 1) * limit,
    }),
  ]);

  return apiSuccess({
    total,
    polls: polls.map((p) => {
      const totalVotes = p.questions.reduce(
        (sum, q) =>
          sum + q.options.reduce((s, o) => s + o.voteCount, 0),
        0,
      );
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        thumbnailUrl: p.thumbnailUrl,
        pollType: p.pollType,
        status: p.status,
        pointsReward: p.pointsReward,
        questionCount: p.questions.length,
        totalVotes,
        createdAt: p.createdAt,
      };
    }),
  });
}
