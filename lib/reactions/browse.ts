import type { ReactionType } from "@prisma/client";
import { db } from "@/lib/db";
import {
  homeArticleInclude,
  publishedArticleWhere,
} from "@/lib/home/article-include";
import { ARTICLE_REACTION_TYPES } from "@/lib/reactions";

export const REACTION_BROWSE_TARGETS = ["ARTICLE", "QUIZ", "POLL"] as const;
export type ReactionBrowseTarget = (typeof REACTION_BROWSE_TARGETS)[number];

export type ReactionBrowseArticleItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  author: { name: string; username: string } | null;
  category: { name: string; slug: string } | null;
  reactionCount: number;
};

export type ReactionBrowseQuizItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  status: string;
  pointsReward: number;
  questionCount: number;
  reactionCount: number;
};

export type ReactionBrowsePollItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  pollType: string;
  status: string;
  pointsReward: number;
  questionCount: number;
  totalVotes: number;
  reactionCount: number;
};

export type ReactionBrowseResponse =
  | {
      reactionType: ReactionType;
      targetType: "ARTICLE";
      items: ReactionBrowseArticleItem[];
      total: number;
      page: number;
      limit: number;
    }
  | {
      reactionType: ReactionType;
      targetType: "QUIZ";
      items: ReactionBrowseQuizItem[];
      total: number;
      page: number;
      limit: number;
    }
  | {
      reactionType: ReactionType;
      targetType: "POLL";
      items: ReactionBrowsePollItem[];
      total: number;
      page: number;
      limit: number;
    };

export function parseReactionTypeParam(value: string | null): ReactionType | null {
  if (!value) return null;
  const normalized = value.toUpperCase();
  return (ARTICLE_REACTION_TYPES as readonly string[]).includes(normalized)
    ? (normalized as ReactionType)
    : null;
}

export function parseBrowseTargetType(
  value: string | null,
): ReactionBrowseTarget | null {
  if (!value) return null;
  const normalized = value.toUpperCase();
  return (REACTION_BROWSE_TARGETS as readonly string[]).includes(normalized)
    ? (normalized as ReactionBrowseTarget)
    : null;
}

async function filterValidTargetIds(
  targetType: ReactionBrowseTarget,
  ids: string[],
): Promise<Set<string>> {
  if (ids.length === 0) return new Set();

  if (targetType === "ARTICLE") {
    const rows = await db.article.findMany({
      where: { id: { in: ids }, ...publishedArticleWhere },
      select: { id: true },
    });
    return new Set(rows.map((row) => row.id));
  }

  if (targetType === "QUIZ") {
    const rows = await db.quiz.findMany({
      where: { id: { in: ids }, status: { in: ["ACTIVE", "INACTIVE"] } },
      select: { id: true },
    });
    return new Set(rows.map((row) => row.id));
  }

  const rows = await db.poll.findMany({
    where: { id: { in: ids }, status: { in: ["ACTIVE", "CLOSED"] } },
    select: { id: true },
  });
  return new Set(rows.map((row) => row.id));
}

export async function browseByReaction(params: {
  reactionType: ReactionType;
  targetType: ReactionBrowseTarget;
  page: number;
  limit: number;
}): Promise<ReactionBrowseResponse> {
  const { reactionType, targetType, page, limit } = params;
  const skip = (page - 1) * limit;

  const grouped = await db.reaction.groupBy({
    by: ["targetId"],
    where: { targetType, type: reactionType },
    _count: { _all: true },
    orderBy: { _count: { targetId: "desc" } },
  });

  if (grouped.length === 0) {
    return {
      reactionType,
      targetType,
      items: [],
      total: 0,
      page,
      limit,
    } as ReactionBrowseResponse;
  }

  const validIds = await filterValidTargetIds(
    targetType,
    grouped.map((row) => row.targetId),
  );
  const ranked = grouped
    .filter((row) => validIds.has(row.targetId))
    .map((row) => ({ id: row.targetId, count: row._count._all }));
  const total = ranked.length;
  const pageSlice = ranked.slice(skip, skip + limit);
  const pageIds = pageSlice.map((row) => row.id);

  if (targetType === "ARTICLE") {
    const articles = await db.article.findMany({
      where: { id: { in: pageIds } },
      include: homeArticleInclude,
    });
    const articleMap = new Map(articles.map((article) => [article.id, article]));
    const items: ReactionBrowseArticleItem[] = [];

    for (const row of pageSlice) {
      const article = articleMap.get(row.id);
      if (!article) continue;
      items.push({
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        coverImageUrl: article.coverImageUrl,
        author: article.author,
        category: article.category,
        reactionCount: row.count,
      });
    }

    return { reactionType, targetType: "ARTICLE", items, total, page, limit };
  }

  if (targetType === "QUIZ") {
    const quizzes = await db.quiz.findMany({
      where: { id: { in: pageIds } },
      include: { _count: { select: { questions: true } } },
    });
    const quizMap = new Map(quizzes.map((quiz) => [quiz.id, quiz]));
    const items: ReactionBrowseQuizItem[] = [];

    for (const row of pageSlice) {
      const quiz = quizMap.get(row.id);
      if (!quiz) continue;
      items.push({
        id: quiz.id,
        title: quiz.title,
        slug: quiz.slug,
        description: quiz.description,
        thumbnailUrl: quiz.thumbnailUrl,
        status: quiz.status,
        pointsReward: quiz.pointsReward,
        questionCount: quiz._count.questions,
        reactionCount: row.count,
      });
    }

    return { reactionType, targetType: "QUIZ", items, total, page, limit };
  }

  const polls = await db.poll.findMany({
    where: { id: { in: pageIds } },
    include: {
      questions: {
        orderBy: { sortOrder: "asc" },
        include: { options: { select: { voteCount: true } } },
      },
    },
  });
  const pollMap = new Map(polls.map((poll) => [poll.id, poll]));
  const items: ReactionBrowsePollItem[] = [];

  for (const row of pageSlice) {
    const poll = pollMap.get(row.id);
    if (!poll) continue;
    const totalVotes = poll.questions.reduce(
      (sum, question) =>
        sum + question.options.reduce((optionSum, option) => optionSum + option.voteCount, 0),
      0,
    );
    items.push({
      id: poll.id,
      title: poll.title,
      slug: poll.slug,
      description: poll.description,
      thumbnailUrl: poll.thumbnailUrl,
      pollType: poll.pollType,
      status: poll.status,
      pointsReward: poll.pointsReward,
      questionCount: poll.questions.length,
      totalVotes,
      reactionCount: row.count,
    });
  }

  return { reactionType, targetType: "POLL", items, total, page, limit };
}
