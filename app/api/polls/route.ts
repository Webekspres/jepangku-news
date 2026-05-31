import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "ACTIVE";
  const limit = Number(searchParams.get("limit") || "12");
  const page = Math.max(Number(searchParams.get("page") || "1"), 1);

  const where = { status: status.toUpperCase() as any };

  const [total, polls] = await Promise.all([
    db.poll.count({ where }),
    db.poll.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { options: { orderBy: { sortOrder: "asc" } } },
      take: limit,
      skip: (page - 1) * limit,
    }),
  ]);

  return NextResponse.json({
    total,
    polls: polls.map((p: (typeof polls)[number]) => ({
      ...p,
      totalVotes: p.options.reduce(
        (sum: number, o: { voteCount: number }) => sum + o.voteCount,
        0,
      ),
    })),
  });
}
