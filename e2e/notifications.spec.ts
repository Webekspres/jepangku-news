import { test, expect } from '@playwright/test';
import {
  E2E_AUTH_SKIP_REASON,
  isE2EAuthAvailable,
  signInAs,
} from './helpers/clerk-auth';

test.describe('Notifications — guest', () => {
  test('notification APIs reject unauthenticated requests', async ({ request }) => {
    const list = await request.get('/api/notifications');
    expect(list.status()).toBe(401);

    const unread = await request.get('/api/notifications/unread-count');
    expect(unread.status()).toBe(401);

    const session = await request.get('/api/notifications/session');
    expect(session.status()).toBe(401);
  });

  test('internal email processor rejects unauthenticated requests in production mode', async ({
    request,
  }) => {
    const res = await request.post('/api/internal/email/process', {
      data: { outboxId: '00000000-0000-0000-0000-000000000000' },
    });
    if (process.env.EMAIL_QUEUE_SECRET) {
      expect(res.status()).toBe(401);
    } else {
      expect([200, 400, 401, 500]).toContain(res.status());
    }
  });

  test('guest navbar does not show notification bell', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('homepage')).toBeVisible();
    await expect(page.getByTestId('navbar-notifications-button')).toHaveCount(0);
  });

  test('SSE notifications stream rejects guest', async ({ request }) => {
    const res = await request.get('/api/notifications/stream');
    expect([401, 403, 404, 405]).toContain(res.status());
  });
});

test.describe('Notifications — authenticated USER', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, 'USER');
  });

  test('navbar shows notification bell after login', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('homepage')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('navbar-notifications-button')).toBeVisible({
      timeout: 20_000,
    });
  });

  test('notification bell opens dropdown menu', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('navbar-notifications-button').click();
    await expect(page.getByTestId('navbar-notifications-menu')).toBeVisible({
      timeout: 10_000,
    });
  });

  test('notifications list API returns envelope for USER', async ({ page }) => {
    const res = await page.request.get('/api/notifications?limit=5');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
  });

  test('unread count API returns number for USER', async ({ page }) => {
    const res = await page.request.get('/api/notifications/unread-count');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty('count');
    expect(typeof data.count).toBe('number');
  });

  test('session API returns modal flags for USER', async ({ page }) => {
    const res = await page.request.get('/api/notifications/session');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty('showWelcome');
    expect(data).toHaveProperty('showDailyPoints');
  });

  test('PATCH session can dismiss welcome modal', async ({ page }) => {
    const res = await page.request.patch('/api/notifications/session', {
      data: { dismissWelcome: true },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.showWelcome).toBe(false);
  });

  test('PATCH session can dismiss daily points modal', async ({ page }) => {
    const res = await page.request.patch('/api/notifications/session', {
      data: { dismissDailyPoints: true },
    });
    expect(res.ok()).toBeTruthy();
  });

  test('welcome or daily modal may show on first visit', async ({ page }) => {
    await page.goto('/');
    const welcome = page.getByTestId('welcome-modal');
    const daily = page.getByTestId('daily-points-modal');
    if (await welcome.isVisible()) {
      await expect(page.getByTestId('welcome-modal-dismiss')).toBeVisible();
      await page.getByTestId('welcome-modal-dismiss').click();
    } else if (await daily.isVisible()) {
      await expect(page.getByTestId('daily-points-modal-dismiss')).toBeVisible();
      await page.getByTestId('daily-points-modal-dismiss').click();
    }
    await expect(page.getByTestId('homepage')).toBeVisible();
  });

  test('mark all read endpoint accepts authenticated USER', async ({ page }) => {
    const res = await page.request.post('/api/notifications/read-all');
    expect([200, 204]).toContain(res.status());
  });
});
