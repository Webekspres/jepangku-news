import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { prismaUniqueViolation } from '../helpers/prisma';
import { COMMENT_GROUP_MAX_COUNT } from '@/lib/notifications/types';

const mockNotificationCreate = mock(() => Promise.resolve({ id: 'notif-new' }));
const mockNotificationFindFirst = mock(() => Promise.resolve(null));
const mockNotificationUpdate = mock(() => Promise.resolve({ id: 'notif-group' }));

mock.module('@/lib/logger', () => ({
  logger: { info: () => {}, warn: () => {} },
}));

mock.module('@/lib/notifications/realtime', () => ({
  publishNotificationUpdateSafe: () => {},
}));

mock.module('@/lib/db', () => ({
  db: {
    notification: {
      create: mockNotificationCreate,
      findFirst: mockNotificationFindFirst,
      update: mockNotificationUpdate,
    },
  },
}));

const { createNotification } = await import('@/lib/notifications/create');

const basePayload = {
  userId: 'user-1',
  type: 'COMMENT_REPLY' as const,
  title: 'Komentar baru',
  body: 'Seseorang membalas',
  dedupeKey: 'comment:abc',
};

describe('createNotification dedupe', () => {
  beforeEach(() => {
    mockNotificationCreate.mockReset();
    mockNotificationFindFirst.mockReset();
    mockNotificationUpdate.mockReset();
    mockNotificationFindFirst.mockImplementation(() => Promise.resolve(null));
    mockNotificationCreate.mockImplementation(() => Promise.resolve({ id: 'notif-new' }));
  });

  test('creates notification when dedupeKey is unique', async () => {
    const result = await createNotification(basePayload);

    expect(result).toEqual({ created: true, id: 'notif-new' });
    expect(mockNotificationCreate).toHaveBeenCalledTimes(1);
  });

  test('returns deduped when unique constraint violated on dedupeKey', async () => {
    mockNotificationCreate.mockImplementation(() => Promise.reject(prismaUniqueViolation()));

    const result = await createNotification(basePayload);

    expect(result).toEqual({ created: false, id: null, deduped: true });
  });

  test('rethrows when unique violation without dedupeKey', async () => {
    mockNotificationCreate.mockImplementation(() => Promise.reject(prismaUniqueViolation()));

    await expect(
      createNotification({ ...basePayload, dedupeKey: undefined }),
    ).rejects.toThrow();
  });
});

describe('createNotification group cap', () => {
  beforeEach(() => {
    mockNotificationCreate.mockReset();
    mockNotificationFindFirst.mockReset();
    mockNotificationUpdate.mockReset();
  });

  test('groups into existing unread notification within window', async () => {
    mockNotificationFindFirst.mockImplementation(() =>
      Promise.resolve({ id: 'notif-group', metadata: { count: 2 } }),
    );

    const result = await createNotification({
      ...basePayload,
      dedupeKey: undefined,
      groupKey: 'comment:article:1',
      metadata: { commentId: 'c-3' },
    });

    expect(result).toEqual({ created: true, id: 'notif-group', grouped: true });
    expect(mockNotificationUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'notif-group' },
        data: expect.objectContaining({
          metadata: expect.objectContaining({ count: 3, lastCommentId: 'c-3' }),
        }),
      }),
    );
    expect(mockNotificationCreate).not.toHaveBeenCalled();
  });

  test('caps group at COMMENT_GROUP_MAX_COUNT without incrementing', async () => {
    mockNotificationFindFirst.mockImplementation(() =>
      Promise.resolve({ id: 'notif-capped', metadata: { count: COMMENT_GROUP_MAX_COUNT } }),
    );

    const result = await createNotification({
      ...basePayload,
      dedupeKey: undefined,
      groupKey: 'comment:article:99',
    });

    expect(result).toEqual({ created: false, id: 'notif-capped', grouped: true });
    expect(mockNotificationUpdate).not.toHaveBeenCalled();
    expect(mockNotificationCreate).not.toHaveBeenCalled();
  });

  test('creates new notification when no group match in window', async () => {
    mockNotificationFindFirst.mockImplementation(() => Promise.resolve(null));
    mockNotificationCreate.mockImplementation(() => Promise.resolve({ id: 'notif-fresh' }));

    const result = await createNotification({
      ...basePayload,
      groupKey: 'comment:article:2',
    });

    expect(result).toEqual({ created: true, id: 'notif-fresh' });
    expect(mockNotificationCreate).toHaveBeenCalledTimes(1);
  });

  test('defaults metadata count to 1 when prior count missing', async () => {
    mockNotificationFindFirst.mockImplementation(() =>
      Promise.resolve({ id: 'notif-group', metadata: {} }),
    );

    await createNotification({
      ...basePayload,
      dedupeKey: undefined,
      groupKey: 'comment:article:3',
    });

    expect(mockNotificationUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ metadata: expect.objectContaining({ count: 2 }) }),
      }),
    );
  });
});

describe('dispatchNotificationEventSafe', () => {
  test('does not throw when handler rejects', async () => {
    mock.module('@/lib/notifications/handlers/article', () => ({
      handleArticleStatusChanged: () => Promise.reject(new Error('handler failed')),
    }));
    mock.module('@/lib/notifications/handlers/contributor', () => ({
      handleContributorReviewed: () => Promise.resolve(),
    }));
    mock.module('@/lib/notifications/handlers/comment', () => ({
      handleCommentCreated: () => Promise.resolve(),
    }));
    mock.module('@/lib/notifications/handlers/admin', () => ({
      notifyAdminsContributorApplication: () => Promise.resolve(),
    }));

    const { dispatchNotificationEventSafe } = await import('@/lib/notifications/dispatch');

    expect(() =>
      dispatchNotificationEventSafe({
        type: 'article.status_changed',
        articleId: 'a-1',
        reviewerId: 'admin-1',
        previousStatus: 'PENDING_REVIEW',
        newStatus: 'PUBLISHED',
      }),
    ).not.toThrow();

    await new Promise((r) => setTimeout(r, 20));
  });
});
