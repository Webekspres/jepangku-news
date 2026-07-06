import { beforeEach, describe, expect, mock, test } from 'bun:test';

const mockCreateMany = mock(() => Promise.resolve({ count: 1 }));
const mockAggregate = mock(() => Promise.resolve({ _sum: { points: 10 } }));
const mockFindMany = mock(() => Promise.resolve([]));

mock.module('@/lib/logger', () => ({
  logger: { info: () => {}, warn: () => {} },
}));

mock.module('@/lib/db', () => ({
  db: {
    pointTransaction: {
      createMany: mockCreateMany,
      aggregate: mockAggregate,
      findMany: mockFindMany,
    },
  },
}));

// Re-export real helpers so hoisted mock.module does not strip exports other tests need.
import {
  getJakartaDayBounds,
  isWithinJakartaDay,
} from '../../lib/jakarta-calendar';

mock.module('@/lib/jakarta-calendar', () => ({
  getJakartaDateKey: () => '2026-06-22',
  getJakartaDayBounds,
  isWithinJakartaDay,
}));

const { awardPoints, checkDailyLogin, getUserPointBalance, getUserPointTransactions } =
  await import('@/lib/points');

describe('awardPoints', () => {
  beforeEach(() => {
    mockCreateMany.mockReset();
    mockAggregate.mockReset();
    mockCreateMany.mockImplementation(() => Promise.resolve({ count: 1 }));
    mockAggregate.mockImplementation(() => Promise.resolve({ _sum: { points: 10 } }));
  });

  test('returns empty result when points <= 0', async () => {
    expect(await awardPoints('user-1', 'quiz', 'quiz', 'q-1', 0)).toEqual({
      awarded: false,
      currentPoints: null,
      totalXp: null,
      currentLevel: null,
    });
    expect(await awardPoints('user-1', 'quiz', 'quiz', 'q-1', -5)).toEqual({
      awarded: false,
      currentPoints: null,
      totalXp: null,
      currentLevel: null,
    });
    expect(mockCreateMany).not.toHaveBeenCalled();
  });

  test('creates transaction and returns balance on success', async () => {
    mockAggregate.mockImplementation(() => Promise.resolve({ _sum: { points: 15 } }));

    const result = await awardPoints('user-1', 'read_complete', 'article', 'art-1', 2, 'Baca artikel');

    expect(mockCreateMany).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        sourceApp: 'news',
        activityType: 'read_complete',
        sourceType: 'article',
        sourceId: 'art-1',
        points: 2,
        description: 'Baca artikel',
      },
      skipDuplicates: true,
    });
    expect(result).toEqual({
      awarded: true,
      currentPoints: 15,
      totalXp: null,
      currentLevel: null,
    });
  });

  test('uses null description when omitted', async () => {
    await awardPoints('user-1', 'share', 'article', 'art-2', 5);

    expect(mockCreateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ description: null }),
        skipDuplicates: true,
      }),
    );
  });

  test('returns awarded:false on unique constraint (anti-duplikat)', async () => {
    mockCreateMany.mockImplementation(() => Promise.resolve({ count: 0 }));
    mockAggregate.mockImplementation(() => Promise.resolve({ _sum: { points: 8 } }));

    const result = await awardPoints('user-1', 'daily_login', 'system', '2026-06-22', 3);

    expect(result).toEqual({
      awarded: false,
      currentPoints: 8,
      totalXp: null,
      currentLevel: null,
    });
  });

  test('returns empty result on other database errors', async () => {
    mockCreateMany.mockImplementation(() => Promise.reject(new Error('connection lost')));

    const result = await awardPoints('user-1', 'poll', 'poll', 'p-1', 1);

    expect(result).toEqual({
      awarded: false,
      currentPoints: null,
      totalXp: null,
      currentLevel: null,
    });
  });
});

describe('checkDailyLogin', () => {
  beforeEach(() => {
    mockCreateMany.mockReset();
    mockAggregate.mockReset();
    mockAggregate.mockImplementation(() => Promise.resolve({ _sum: { points: 3 } }));
  });

  test('awards daily_login points with Jakarta date key as sourceId', async () => {
    mockCreateMany.mockImplementation(() => Promise.resolve({ count: 1 }));

    const awarded = await checkDailyLogin('user-daily');

    expect(awarded).toBe(true);
    expect(mockCreateMany).toHaveBeenCalledWith({
      data: expect.objectContaining({
        activityType: 'daily_login',
        sourceType: 'system',
        sourceId: '2026-06-22',
        points: 3,
      }),
      skipDuplicates: true,
    });
  });

  test('returns false when daily login already claimed (duplicate)', async () => {
    mockCreateMany.mockImplementation(() => Promise.resolve({ count: 0 }));

    const awarded = await checkDailyLogin('user-daily');

    expect(awarded).toBe(false);
  });
});

describe('getUserPointBalance', () => {
  test('sums news portal transactions', async () => {
    mockAggregate.mockImplementation(() => Promise.resolve({ _sum: { points: 42 } }));

    const balance = await getUserPointBalance('user-balance');

    expect(balance).toBe(42);
    expect(mockAggregate).toHaveBeenCalledWith({
      where: { userId: 'user-balance', sourceApp: 'news' },
      _sum: { points: true },
    });
  });

  test('returns 0 when no transactions', async () => {
    mockAggregate.mockImplementation(() => Promise.resolve({ _sum: { points: null } }));

    expect(await getUserPointBalance('user-empty')).toBe(0);
  });
});

describe('getUserPointTransactions', () => {
  test('fetches recent transactions with default limit', async () => {
    const rows = [{ id: 'tx-1', points: 5 }];
    mockFindMany.mockImplementation(() => Promise.resolve(rows));

    const result = await getUserPointTransactions('user-tx');

    expect(result).toEqual(rows);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-tx', sourceApp: 'news' }, take: 100 }),
    );
  });
});
