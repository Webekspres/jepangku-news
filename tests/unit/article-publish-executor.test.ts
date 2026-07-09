import { beforeEach, describe, expect, mock, test } from 'bun:test';
import type { ArticleStatus } from '@prisma/client';

const mockFindUnique = mock(() => Promise.resolve(null as any));
const mockUpdate = mock(() => Promise.resolve({}));
const mockRecordStatusReview = mock(() => Promise.resolve());
const mockSetLastEditor = mock(() => Promise.resolve());

mock.module('@/lib/logger', () => ({
  logger: {
    child: () => ({
      info: () => {},
      warn: () => {},
      error: () => {},
    }),
  },
}));

mock.module('@/lib/db', () => ({
  db: {
    article: {
      findUnique: mockFindUnique,
      update: mockUpdate,
    },
  },
}));

mock.module('@/lib/article-audit', () => ({
  recordStatusReview: mockRecordStatusReview,
  setLastEditor: mockSetLastEditor,
}));

const { executeArticlePublish } = await import('@/lib/articles/publish-executor');

describe('executeArticlePublish', () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
    mockUpdate.mockReset();
    mockRecordStatusReview.mockReset();
    mockSetLastEditor.mockReset();
  });

  test('publishes SCHEDULED article and records review', async () => {
    const scheduledAt = new Date(Date.now() - 5_000);
    mockFindUnique.mockImplementation(() =>
      Promise.resolve({
        id: 'art-1',
        slug: 'test-slug',
        title: 'Test',
        status: 'SCHEDULED' as ArticleStatus,
        publishedAt: null,
        scheduledPublishAt: scheduledAt,
        qstashMessageId: 'msg-1',
      }),
    );

    const result = await executeArticlePublish({
      articleId: 'art-1',
      reviewerId: 'system',
      source: 'qstash',
    });

    expect(result.ok).toBe(true);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockRecordStatusReview).toHaveBeenCalledWith(
      expect.objectContaining({
        articleId: 'art-1',
        previousStatus: 'SCHEDULED',
        newStatus: 'PUBLISHED',
      }),
    );
  });

  test('is idempotent when already published', async () => {
    mockFindUnique.mockImplementation(() =>
      Promise.resolve({
        id: 'art-1',
        slug: 'test-slug',
        title: 'Test',
        status: 'PUBLISHED' as ArticleStatus,
        publishedAt: new Date(),
        scheduledPublishAt: null,
        qstashMessageId: null,
      }),
    );

    const result = await executeArticlePublish({
      articleId: 'art-1',
      reviewerId: 'system',
      source: 'qstash',
    });

    expect(result.ok).toBe(true);
    expect(result.alreadyPublished).toBe(true);
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockRecordStatusReview).not.toHaveBeenCalled();
  });

  test('rejects invalid status', async () => {
    mockFindUnique.mockImplementation(() =>
      Promise.resolve({
        id: 'art-1',
        slug: 'test-slug',
        title: 'Test',
        status: 'DRAFT' as ArticleStatus,
        publishedAt: null,
        scheduledPublishAt: null,
        qstashMessageId: null,
      }),
    );

    const result = await executeArticlePublish({
      articleId: 'art-1',
      reviewerId: 'admin-1',
      source: 'admin_approve',
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('invalid_status');
  });
});
