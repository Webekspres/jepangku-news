import type { CommentTargetType } from '@prisma/client';
import { db } from '@/lib/db';
import { getArticleViewHref } from '@/lib/article-view-url';
import { createNotification } from '@/lib/notifications/create';

async function resolveArticleForComment(
  targetType: CommentTargetType,
  targetId: string,
): Promise<{
  id: string;
  title: string;
  slug: string | null;
  status: string;
  authorId: string;
} | null> {
  if (targetType !== 'ARTICLE') return null;

  return db.article.findUnique({
    where: { id: targetId },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      authorId: true,
    },
  });
}

export async function handleCommentCreated(params: {
  commentId: string;
  targetType: CommentTargetType;
  targetId: string;
  authorId: string;
  parentId: string | null;
}): Promise<void> {
  if (params.parentId) {
    const parent = await db.comment.findUnique({
      where: { id: params.parentId },
      select: { userId: true },
    });
    if (!parent || parent.userId === params.authorId) return;

    const article = await resolveArticleForComment(params.targetType, params.targetId);
    const link = article
      ? `${getArticleViewHref(article)}#comments`
      : null;

    await createNotification({
      userId: parent.userId,
      type: 'COMMENT_REPLY',
      title: 'Balasan komentar baru',
      body: article
        ? `Seseorang membalas komentar Anda di “${article.title}”.`
        : 'Seseorang membalas komentar Anda.',
      link,
      groupKey: `comment_reply:${params.parentId}`,
      metadata: {
        commentId: params.commentId,
        parentId: params.parentId,
        targetType: params.targetType,
        targetId: params.targetId,
      },
    });
    return;
  }

  const article = await resolveArticleForComment(params.targetType, params.targetId);
  if (!article || article.authorId === params.authorId) return;

  await createNotification({
    userId: article.authorId,
    type: 'COMMENT_ON_ARTICLE',
    title: 'Komentar baru pada artikel Anda',
    body: `Seseorang berkomentar di “${article.title}”.`,
    link: `${getArticleViewHref(article)}#comments`,
    groupKey: `comment_article:${article.id}`,
    metadata: {
      commentId: params.commentId,
      articleId: article.id,
      targetType: params.targetType,
      targetId: params.targetId,
    },
  });
}

export async function notifyWelcomeUser(userId: string): Promise<void> {
  await createNotification({
    userId,
    type: 'WELCOME',
    title: 'Selamat datang di Jepangku!',
    body: 'Jelajahi artikel, kumpulkan poin, dan ikuti kuis & polling komunitas.',
    link: '/',
    dedupeKey: `welcome:${userId}`,
    priority: 'NORMAL',
  });
}
