import { test, expect } from '@playwright/test';

test.describe('Notifications', () => {
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
    // When EMAIL_QUEUE_SECRET is set, unauthenticated calls must be rejected.
    // Without secret, the dev server may allow local processing (200) or fail lookup (500).
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
});
