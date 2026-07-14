import type { ReactionType } from "@prisma/client";
import { db } from "@/lib/db";
import {
  homeArticleInclude,
  publishedArticleWhere,
} from "@/lib/home/article-include";
import type { HomeReactionsResponse } from "@/lib/home/types";
import { ARTICLE_REACTION_TYPES } from "@/lib/reactions";
import { CONTENT_REACTIONS, getReactionDisplay } from "@/lib/reactions-display";

const TOP_REACTED_LIMIT = 8;

/** Total reaksi per tipe + ranking artikel (all-time, artikel published saja). */
async function loadPublishedArticleReactions() {
  const rows = await db.reaction.groupBy({
    by: ["targetId", "type"],
    where: {
      targetType: "ARTICLE",
      type: { in: [...ARTICLE_REACTION_TYPES] },
    },
    _count: { _all: true },
  });

  if (rows.length === 0) {
    return {
      globalCounts: emptyCounts(),
      ranked: [] as { id: string; total: number; counts: Record<string, number> }[],
    };
  }

  const candidateIds = [...new Set(rows.map((row) => row.targetId))];
  const published = await db.article.findMany({
    where: { id: { in: candidateIds }, ...publishedArticleWhere },
    select: { id: true },
  });
  const publishedIds = new Set(published.map((article) => article.id));

  const globalCounts = emptyCounts();
  const byArticle = new Map<
    string,
    { total: number; counts: Record<string, number> }
  >();

  for (const row of rows) {
    if (!publishedIds.has(row.targetId)) continue;

    const count = row._count._all;
    globalCounts[row.type] = (globalCounts[row.type] ?? 0) + count;

    const entry = byArticle.get(row.targetId) ?? {
      total: 0,
      counts: emptyCounts(),
    };
    entry.counts[row.type] = count;
    entry.total += count;
    byArticle.set(row.targetId, entry);
  }

  const ranked = [...byArticle.entries()]
    .map(([id, agg]) => ({ id, ...agg }))
    .sort((a, b) => b.total - a.total)
    .slice(0, TOP_REACTED_LIMIT);

  return { globalCounts, ranked };
}

function emptyCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const type of ARTICLE_REACTION_TYPES) counts[type] = 0;
  return counts;
}

function dominantReaction(counts: Record<string, number>): ReactionType {
  let best: ReactionType = "LOVE";
  let bestCount = -1;
  for (const type of ARTICLE_REACTION_TYPES) {
    const count = counts[type] ?? 0;
    if (count > bestCount) {
      best = type;
      bestCount = count;
    }
  }
  return best;
}

export async function fetchHomeReactions(): Promise<HomeReactionsResponse> {
  const { globalCounts, ranked } = await loadPublishedArticleReactions();

  const articleIds = ranked.map((item) => item.id);
  const articles =
    articleIds.length === 0
      ? []
      : await db.article.findMany({
          where: { id: { in: articleIds }, ...publishedArticleWhere },
          include: homeArticleInclude,
        });

  const articleMap = new Map(articles.map((article) => [article.id, article]));

  const reactedArticles = ranked.flatMap((agg) => {
    const article = articleMap.get(agg.id);
    if (!article) return [];

    const dominant = dominantReaction(agg.counts);
    const display = getReactionDisplay(dominant);

    return [
      {
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        coverImageUrl: article.coverImageUrl,
        viewCount: article.viewCount,
        category: article.category,
        author: article.author,
        reactionTotal: agg.total,
        dominantReaction: dominant,
        dominantIconSrc: display.iconSrc,
        dominantLabel: display.label,
        reactionCounts: agg.counts,
      },
    ];
  });

  const emojiStats = CONTENT_REACTIONS.map((reaction) => ({
    type: reaction.key,
    iconSrc: reaction.iconSrc,
    label: reaction.label,
    count: globalCounts[reaction.key] ?? 0,
  }));

  return {
    period: "all-time",
    globalTotal: emojiStats.reduce((sum, item) => sum + item.count, 0),
    emojiStats,
    articles: reactedArticles,
  };
}
