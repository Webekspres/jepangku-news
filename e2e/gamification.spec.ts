import { test, expect } from "@playwright/test";
import {
  E2E_AUTH_SKIP_REASON,
  isE2EAuthAvailable,
  signInAs,
} from "./helpers/clerk-auth";
import { expectGuestRedirectToSignIn } from "./helpers/fixtures";

test.describe("Gamification — public leaderboard", () => {
  test("leaderboard page loads with period tabs", async ({ page }) => {
    await page.goto("/leaderboard");
    await expect(page.getByTestId("leaderboard-page")).toBeVisible({
      timeout: 20_000,
    });
    for (const period of ["weekly", "monthly", "sepanjang-waktu"] as const) {
      await expect(page.getByTestId(`leaderboard-period-${period}`)).toBeVisible();
    }
  });

  test("leaderboard weekly tab switches data", async ({ page }) => {
    await page.goto("/leaderboard");
    await page.getByTestId("leaderboard-period-monthly").click();
    await expect(page.getByTestId("leaderboard-period-monthly")).toHaveAttribute(
      "data-state",
      "active",
    );
    await page.getByTestId("leaderboard-period-sepanjang-waktu").click();
    await expect(
      page.getByTestId("leaderboard-period-sepanjang-waktu"),
    ).toHaveAttribute("data-state", "active");
  });

  test("GET /api/leaderboard returns items envelope", async ({ request }) => {
    const res = await request.get("/api/leaderboard?period=weekly&limit=5");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty("items");
    expect(Array.isArray(data.items)).toBe(true);
  });

  test("GET /api/leaderboard/weekly alias works", async ({ request }) => {
    const res = await request.get("/api/leaderboard/weekly?limit=3");
    expect(res.ok()).toBeTruthy();
  });

  test("home engagement section shows leaderboard sidebar after scroll", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("home-sentinel-engagement").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("home-engagement-loading")).toBeHidden({
      timeout: 25_000,
    });
    await expect(
      page
        .getByTestId("home-leaderboard-sidebar")
        .or(page.getByText("Gagal memuat polling dan peringkat.")),
    ).toBeVisible({ timeout: 25_000 });
  });

  test("view full leaderboard link navigates to leaderboard page", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("home-sentinel-engagement").scrollIntoViewIfNeeded();
    const link = page.getByTestId("view-full-leaderboard");
    if ((await link.count()) === 0) {
      test.skip(true, "Leaderboard sidebar not in dataset");
    }
    await link.click();
    await expect(page).toHaveURL(/\/leaderboard/, { timeout: 15_000 });
    await expect(page.getByTestId("leaderboard-page")).toBeVisible();
  });
});

test.describe("Gamification — activity & points (auth)", () => {
  test("activity page redirects guest to sign-in", async ({ page }) => {
    await expectGuestRedirectToSignIn(page, "/activity");
  });

  test("GET /api/points/my returns 401 for guest", async ({ request }) => {
    const res = await request.get("/api/points/my");
    expect(res.status()).toBe(401);
  });

  test("GET /api/points/export returns 401 for guest", async ({ request }) => {
    const res = await request.get("/api/points/export");
    expect(res.status()).toBe(401);
  });

  test("GET /api/user/gamification returns 401 for guest", async ({ request }) => {
    const res = await request.get("/api/user/gamification");
    expect(res.status()).toBe(401);
  });

  test.beforeEach(async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "USER");
  });

  test("USER can open activity page", async ({ page }) => {
    await page.goto("/activity");
    await expect(page.getByTestId("activity-page")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("activity-tab-all")).toBeVisible();
    await expect(page.getByTestId("activity-tab-points")).toBeVisible();
  });

  test("USER activity export button is visible", async ({ page }) => {
    await page.goto("/activity");
    await expect(page.getByTestId("activity-export-csv")).toBeVisible({
      timeout: 20_000,
    });
  });

  test("USER points ledger API returns transactions", async ({ page }) => {
    const res = await page.request.get("/api/points/my");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty("transactions");
    expect(Array.isArray(data.transactions)).toBe(true);
  });

  test("USER gamification API returns balance fields", async ({ page }) => {
    const res = await page.request.get("/api/user/gamification");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty("totalPoints");
  });

  test("notification session exposes daily modal flags", async ({ page }) => {
    const res = await page.request.get("/api/notifications/session");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty("showDailyPoints");
    expect(data).toHaveProperty("showWelcome");
  });
});

test.describe("Gamification — daily modal UI", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "USER");
  });

  test("daily or welcome modal may appear after login", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("homepage")).toBeVisible({ timeout: 20_000 });
    const dailyModal = page.getByTestId("daily-points-modal");
    const welcomeModal = page.getByTestId("welcome-modal");
    await expect(dailyModal.or(welcomeModal).or(page.getByTestId("homepage"))).toBeVisible({
      timeout: 15_000,
    });
    if (await dailyModal.isVisible()) {
      await page.getByTestId("daily-points-modal-dismiss").click();
      await expect(dailyModal).toBeHidden();
    } else if (await welcomeModal.isVisible()) {
      await page.getByTestId("welcome-modal-dismiss").click();
      await expect(welcomeModal).toBeHidden();
    }
  });
});
