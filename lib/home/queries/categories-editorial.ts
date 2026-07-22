import { db } from "@/lib/db";
import {
  homeArticleInclude,
  publishedArticleWhere,
  type HomeArticle,
} from "@/lib/home/article-include";
import {
  EDITORIAL_LAYOUT_ROWS,
  editorialViewMoreHref,
} from "@/lib/home/editorial-groups";
import { seedDatabase } from "@/lib/seed";
import type {
  EditorialFeaturedColumn,
  EditorialLayoutRow,
  EditorialListColumn,
  HomeCategoriesEditorialResponse,
} from "@/lib/home/types";

type ScoredArticle = {
  article: HomeArticle;
  score: number;
};

type RankedCategory = {
  id: string;
  name: string;
  slug: string;
  score: number;
  articles: ScoredArticle[];
};

function articleEngagementScore(
  viewCount: number,
  reactionCount: number,
  commentCount: number,
): number {
  return viewCount + reactionCount + commentCount;
}

async function loadCategoriesBySlug(): Promise<Map<string, RankedCategory>> {
  const articles = await db.article.findMany({
    where: {
      ...publishedArticleWhere,
      categoryId: { not: null },
    },
    include: homeArticleInclude,
  });

  if (articles.length === 0) return new Map();

  const articleIds = articles.map((article) => article.id);

  const [reactionGroups, commentGroups] = await Promise.all([
    db.reaction.groupBy({
      by: ["targetId"],
      where: { targetType: "ARTICLE", targetId: { in: articleIds } },
      _count: { _all: true },
    }),
    db.comment.groupBy({
      by: ["targetId"],
      where: {
        targetType: "ARTICLE",
        targetId: { in: articleIds },
        status: "VISIBLE",
        deletedAt: null,
      },
      _count: { _all: true },
    }),
  ]);

  const reactionMap = new Map(
    reactionGroups.map((row) => [row.targetId, row._count._all]),
  );
  const commentMap = new Map(
    commentGroups.map((row) => [row.targetId, row._count._all]),
  );

  const byCategory = new Map<string, RankedCategory>();

  for (const article of articles) {
    if (!article.categoryId || !article.category) continue;

    const score = articleEngagementScore(
      article.viewCount,
      reactionMap.get(article.id) ?? 0,
      commentMap.get(article.id) ?? 0,
    );

    const entry = byCategory.get(article.category.slug) ?? {
      id: article.categoryId,
      name: article.category.name,
      slug: article.category.slug,
      score: 0,
      articles: [],
    };

    entry.articles.push({ article, score });
    entry.score += score;
    byCategory.set(article.category.slug, entry);
  }

  for (const category of byCategory.values()) {
    category.articles.sort((a, b) => b.score - a.score);
  }

  return byCategory;
}

function toFeaturedColumn(category: RankedCategory): EditorialFeaturedColumn {
  const sorted = category.articles.map((item) => item.article);
  return {
    slug: category.slug,
    title: category.name,
    viewMoreHref: editorialViewMoreHref(category.slug),
    featured: sorted[0] ?? null,
    list: sorted.slice(1, 4),
  };
}

function toListColumn(category: RankedCategory): EditorialListColumn {
  return {
    slug: category.slug,
    title: category.name,
    viewMoreHref: editorialViewMoreHref(category.slug),
    articles: category.articles.slice(0, 5).map((item) => item.article),
  };
}

function emptyFeaturedColumn(slug: string): EditorialFeaturedColumn {
  return {
    slug,
    title: slug,
    viewMoreHref: editorialViewMoreHref(slug),
    featured: null,
    list: [],
  };
}

function emptyListColumn(slug: string): EditorialListColumn {
  return {
    slug,
    title: slug,
    viewMoreHref: editorialViewMoreHref(slug),
    articles: [],
  };
}

export async function fetchHomeCategoriesEditorial(): Promise<HomeCategoriesEditorialResponse> {
  await seedDatabase();

  const bySlug = await loadCategoriesBySlug();

  // Nama kategori dari DB; fallback judul dari slug jika belum ada artikel
  const categories = await db.category.findMany({
    where: {
      slug: {
        in: EDITORIAL_LAYOUT_ROWS.flatMap((row) => row.categorySlugs),
      },
    },
    select: { slug: true, name: true },
  });
  const nameBySlug = new Map(categories.map((c) => [c.slug, c.name]));

  const rows: EditorialLayoutRow[] = EDITORIAL_LAYOUT_ROWS.map((row) => {
    if (row.type === "featured") {
      return {
        type: "featured" as const,
        columns: row.categorySlugs.map((slug) => {
          const category = bySlug.get(slug);
          if (category) return toFeaturedColumn(category);
          const empty = emptyFeaturedColumn(slug);
          empty.title = nameBySlug.get(slug) ?? slug;
          return empty;
        }),
      };
    }

    return {
      type: "list" as const,
      centered: row.centered,
      columns: row.categorySlugs.map((slug) => {
        const category = bySlug.get(slug);
        if (category) return toListColumn(category);
        const empty = emptyListColumn(slug);
        empty.title = nameBySlug.get(slug) ?? slug;
        return empty;
      }),
    };
  });

  return { rows };
}
