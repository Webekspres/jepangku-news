import type { CommentTargetType } from '@prisma/client';
import { db } from '@/lib/db';
import { getArticleViewHref } from '@/lib/article-view-url';
import { getActivityIcon, getActivityLabel } from '@/lib/activity-labels';

export type ActivityFeedKind =
  | 'points'
  | 'comment'
  | 'quiz'
  | 'poll'
  | 'bookmark'
  | 'share';

export type ActivityFeedItem = {
  id: string;
  kind: ActivityFeedKind;
  label: string;
  occurredAt: string;
  href: string | null;
  points: number | null;
};

const PER_SOURCE_LIMIT = 40;

async function commentHref(
  targetType: CommentTargetType,
  targetId: string,
): Promise<string | null> {
  if (targetType === 'ARTICLE') {
    const article = await db.article.findUnique({
      where: { id: targetId },
      select: { id: true, slug: true, status: true },
    });
    return article ? getArticleViewHref(article) : null;
  }
  if (targetType === 'POLL') {
    const poll = await db.poll.findUnique({
      where: { id: targetId },
      select: { slug: true },
    });
    return poll ? `/polls/${poll.slug}` : null;
  }
  if (targetType === 'QUIZ') {
    const quiz = await db.quiz.findUnique({
      where: { id: targetId },
      select: { slug: true },
    });
    return quiz ? `/quizzes/${quiz.slug}` : null;
  }
  if (targetType === 'VIDEO') {
    const video = await db.video.findUnique({
      where: { id: targetId },
      select: { slug: true },
    });
    return video ? `/tv/${video.slug}` : null;
  }
  return null;
}

export async function getUserActivityFeed(
  userId: string,
  limit = 80,
): Promise<ActivityFeedItem[]> {
  const [points, comments, quizzes, polls, bookmarks, shares] = await Promise.all([
    db.pointTransaction.findMany({
      where: { userId, sourceApp: 'news' },
      orderBy: { occurredAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: {
        id: true,
        activityType: true,
        points: true,
        description: true,
        occurredAt: true,
      },
    }),
    db.comment.findMany({
      where: { userId, status: 'VISIBLE', deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: {
        id: true,
        targetType: true,
        targetId: true,
        content: true,
        createdAt: true,
      },
    }),
    db.quizAttempt.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: {
        id: true,
        score: true,
        pointsAwarded: true,
        submittedAt: true,
        quiz: { select: { title: true, slug: true } },
      },
    }),
    db.pollVote.findMany({
      where: { userId },
      orderBy: { votedAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: {
        id: true,
        pointsAwarded: true,
        votedAt: true,
        poll: { select: { title: true, slug: true } },
      },
    }),
    db.bookmark.findMany({
      where: { userId, deletedAt: null },
      orderBy: { firstBookmarkedAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: {
        id: true,
        firstBookmarkedAt: true,
        article: { select: { id: true, title: true, slug: true, status: true } },
      },
    }),
    db.articleShare.findMany({
      where: { userId },
      orderBy: { sharedAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: {
        id: true,
        pointsAwarded: true,
        sharedAt: true,
        shareMethod: true,
        article: { select: { id: true, title: true, slug: true, status: true } },
      },
    }),
  ]);

  const commentLinks = await Promise.all(
    comments.map((c) => commentHref(c.targetType, c.targetId)),
  );

  const items: ActivityFeedItem[] = [
    ...points.map((row) => ({
      id: `points:${row.id}`,
      kind: 'points' as const,
      label: getActivityLabel(row.activityType, row.description),
      occurredAt: row.occurredAt.toISOString(),
      href: null,
      points: row.points,
    })),
    ...comments.map((row, i) => ({
      id: `comment:${row.id}`,
      kind: 'comment' as const,
      label: `Komentar: ${row.content.slice(0, 80)}${row.content.length > 80 ? '…' : ''}`,
      occurredAt: row.createdAt.toISOString(),
      href: commentLinks[i] ?? null,
      points: null,
    })),
    ...quizzes.map((row) => ({
      id: `quiz:${row.id}`,
      kind: 'quiz' as const,
      label: `Kuis “${row.quiz.title}” — skor ${Math.round(row.score)}%`,
      occurredAt: row.submittedAt.toISOString(),
      href: `/quizzes/${row.quiz.slug}`,
      points: row.pointsAwarded > 0 ? row.pointsAwarded : null,
    })),
    ...polls.map((row) => ({
      id: `poll:${row.id}`,
      kind: 'poll' as const,
      label: `Vote polling “${row.poll.title}”`,
      occurredAt: row.votedAt.toISOString(),
      href: `/polls/${row.poll.slug}`,
      points: row.pointsAwarded > 0 ? row.pointsAwarded : null,
    })),
    ...bookmarks.map((row) => ({
      id: `bookmark:${row.id}`,
      kind: 'bookmark' as const,
      label: `Bookmark: ${row.article.title}`,
      occurredAt: row.firstBookmarkedAt.toISOString(),
      href: getArticleViewHref(row.article),
      points: null,
    })),
    ...shares.map((row) => ({
      id: `share:${row.id}`,
      kind: 'share' as const,
      label: `Bagikan artikel “${row.article.title}”`,
      occurredAt: row.sharedAt.toISOString(),
      href: getArticleViewHref(row.article),
      points: row.pointsAwarded > 0 ? row.pointsAwarded : null,
    })),
  ];

  return items
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, limit);
}

export { getActivityIcon };
