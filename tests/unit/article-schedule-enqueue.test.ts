import { describe, expect, test } from 'bun:test';
import {
  ArticleScheduleEnqueueError,
  isArticleScheduleConfigured,
} from '@/lib/articles/schedule';
import { getArticleScheduleErrorResponse } from '@/lib/articles/schedule-errors';

describe('ArticleScheduleEnqueueError', () => {
  test('maps to HTTP 503 via getArticleScheduleErrorResponse', () => {
    const error = new ArticleScheduleEnqueueError('QStash belum dikonfigurasi');
    const response = getArticleScheduleErrorResponse(error);
    expect(response.status).toBe(503);
    expect(response.message).toContain('QStash');
  });
});

describe('isArticleScheduleConfigured', () => {
  test('requires QStash token, app URL, and queue secret together', () => {
    const keys = [
      'QSTASH_TOKEN',
      'NEXT_PUBLIC_APP_URL',
      'EMAIL_QUEUE_SECRET',
    ] as const;
    const saved = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

    for (const key of keys) delete process.env[key];
    expect(isArticleScheduleConfigured()).toBe(false);

    process.env.QSTASH_TOKEN = 'token';
    process.env.NEXT_PUBLIC_APP_URL = 'https://news.example.com';
    process.env.EMAIL_QUEUE_SECRET = 'secret';
    expect(isArticleScheduleConfigured()).toBe(true);

    for (const key of keys) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });
});
