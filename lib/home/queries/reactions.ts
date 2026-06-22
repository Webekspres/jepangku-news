import type { ReactionType } from "@prisma/client";
import { db } from "@/lib/db";
import {
  homeArticleInclude,
  publishedArticleWhere,
} from "@/lib/home/article-include";
import type { HomeReactionsResponse } from "@/lib/home/types";
import { ARTICLE_REACTION_TYPES } from "@/lib/reactions";
import { CONTENT_REACTIONS, getReactionDisplay } from "@/lib/reactions-display";

const ROLLING_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const TOP_REACTED_LIMIT = 6;

type ArticleAgg = {
  total: number;
  counts: Record<string, number>;
};

function emptyContentCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const type of ARTICLE_REACTION_TYPES) counts[type] = 0;
  return counts;
}

function aggregateRows(
  rows: { targetId: string; type: ReactionType; _count: { type: number } }[],
) {
  const globalCounts = emptyContentCounts();
  const byArticle = new Map<string, ArticleAgg>();

  for (const row of rows) {
    globalCounts[row.type] = (globalCounts[row.type] ?? 0) + row._count.type;

    const entry = byArticle.get(row.targetId) ?? {
      total: 0,
      counts: emptyContentCounts(),
    };
    entry.counts[row.type] = row._count.type;
    entry.total += row._count.type;
    byArticle.set(row.targetId, entry);
  }

  const ranked = [...byArticle.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, TOP_REACTED_LIMIT);

  return { globalCounts, ranked };
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

async function loadReactionAggregate(since: Date | null) {
  const rows = await db.reaction.groupBy({
    by: ["targetId", "type"],
    where: {
      targetType: "ARTICLE",
      type: { in: [...ARTICLE_REACTION_TYPES] },
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    _count: { type: true },
  });

  return aggregateRows(rows);
}

export async function fetchHomeReactions(): Promise<HomeReactionsResponse> {
  const since = new Date(Date.now() - ROLLING_WINDOW_MS);

  let period: HomeReactionsResponse["period"] = "week";
  let { globalCounts, ranked } = await loadReactionAggregate(since);

  if (ranked.length === 0) {
    period = "all-time";
    ({ globalCounts, ranked } = await loadReactionAggregate(null));
  }

  const articleIds = ranked.map(([id]) => id);
  const articles =
    articleIds.length === 0
      ? []
      : await db.article.findMany({
          where: {
            id: { in: articleIds },
            ...publishedArticleWhere,
          },
          include: homeArticleInclude,
        });

  const articleMap = new Map(articles.map((a) => [a.id, a]));

  const reactedArticles = ranked
    .map(([id, agg]) => {
      const article = articleMap.get(id);
      if (!article) return null;

      const dominant = dominantReaction(agg.counts);
      const display = getReactionDisplay(dominant);

      return {
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        coverImageUrl: article.coverImageUrl,
        category: article.category,
        author: article.author,
        reactionTotal: agg.total,
        dominantReaction: dominant,
        dominantIconSrc: display.iconSrc,
        dominantLabel: display.label,
        reactionCounts: agg.counts,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const emojiStats = CONTENT_REACTIONS.map((reaction) => ({
    type: reaction.key,
    iconSrc: reaction.iconSrc,
    label: reaction.label,
    count: globalCounts[reaction.key] ?? 0,
  }));

  const globalTotal = emojiStats.reduce((sum, item) => sum + item.count, 0);

  return {
    period,
    globalTotal,
    emojiStats,
    articles: reactedArticles,
  };
}
