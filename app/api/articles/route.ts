import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/api-response';
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category") || "";
  const tag = searchParams.get("tag") || "";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "latest";

  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
  const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
  const skip = (page - 1) * limit;

  try {
    const where: any = {
      status: "PUBLISHED",
      visibility: "public",
    };

    if (category) {
      const cat = await db.category.findUnique({
        where: { slug: category },
      });

      if (cat) where.categoryId = cat.id;
    }

    if (tag) {
      const tagDoc = await db.tag.findUnique({
        where: { slug: tag },
      });

      if (tagDoc) {
        const articleTags = await db.articleTag.findMany({
          where: { tagId: tagDoc.id },
        });

        where.id = {
          in: articleTags.map((at: { articleId: string }) => at.articleId),
        };
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy: any = { publishedAt: "desc" };

    if (sort === "popular") {
      orderBy = { viewCount: "desc" };
    } else if (sort === "trending") {
      orderBy = { weeklyViewCount: "desc" };
    } else if (sort === "reactions") {
      orderBy = { totalReactionCount: "desc" };
    }

    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              name: true,
              username: true,
            },
          },
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      }),
      db.article.count({ where }),
    ]);

    return apiSuccess({
      articles,
      total,
      limit,
      page,
      skip,
      hasMore: skip + articles.length < total,
    });
  } catch (e: any) {
    console.error("Articles error:", e);

    return apiSuccess(
      { error: e.message },
      { status: 500 },
    );
  }
}