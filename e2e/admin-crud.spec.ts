import { test, expect } from "@playwright/test";
import {
  E2E_AUTH_SKIP_REASON,
  isE2EAuthAvailable,
  signInAs,
} from "./helpers/clerk-auth";
import { expectGuestRedirectToSignIn } from "./helpers/fixtures";

test.describe("Admin CRUD — guest gates", () => {
  const adminRoutes = [
    "/admin/categories",
    "/admin/tags",
    "/admin/videos",
    "/admin/ads",
  ] as const;

  for (const route of adminRoutes) {
    test(`${route} redirects guest to sign-in`, async ({ page }) => {
      await expectGuestRedirectToSignIn(page, route);
    });
  }

  test("admin category API returns 403 for guest", async ({ request }) => {
    const res = await request.get("/api/admin/categories");
    expect(res.status()).toBe(403);
  });

  test("admin tags API returns 403 for guest", async ({ request }) => {
    const res = await request.get("/api/admin/tags");
    expect(res.status()).toBe(403);
  });

  test("admin videos API returns 403 for guest", async ({ request }) => {
    const res = await request.get("/api/admin/videos");
    expect(res.status()).toBe(403);
  });

  test("admin ads API returns 403 for guest", async ({ request }) => {
    const res = await request.get("/api/admin/ads");
    expect(res.status()).toBe(403);
  });
});

test.describe("Admin CRUD — CONTRIBUTOR blocked", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "CONTRIBUTOR");
  });

  test("CONTRIBUTOR cannot access admin categories page", async ({ page }) => {
    await page.goto("/admin/categories");
    await expect(page).not.toHaveURL(/\/admin\/categories/, { timeout: 10_000 });
  });

  test("CONTRIBUTOR admin stats API returns 403", async ({ page }) => {
    const res = await page.request.get("/api/admin/stats");
    expect(res.status()).toBe(403);
  });
});

test.describe("Admin CRUD — ADMIN smoke", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "ADMIN");
  });

  test("admin categories page loads with create button", async ({ page }) => {
    await page.goto("/admin/categories");
    await expect(page.getByTestId("toggle-create-form-btn")).toBeVisible({
      timeout: 25_000,
    });
  });

  test("admin categories create modal opens", async ({ page }) => {
    await page.goto("/admin/categories");
    await page.getByTestId("toggle-create-form-btn").click();
    await expect(page.getByTestId("create-category-modal")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByTestId("category-name-input")).toBeEditable();
  });

  test("admin tags page loads with create button", async ({ page }) => {
    await page.goto("/admin/tags");
    await expect(page.getByTestId("toggle-create-form-btn")).toBeVisible({
      timeout: 25_000,
    });
  });

  test("admin tags create modal opens", async ({ page }) => {
    await page.goto("/admin/tags");
    await page.getByTestId("toggle-create-form-btn").click();
    await expect(page.getByTestId("create-tag-modal")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByTestId("tag-name-input")).toBeEditable();
  });

  test("admin videos page loads with create button", async ({ page }) => {
    await page.goto("/admin/videos");
    await expect(page.getByTestId("create-video-btn")).toBeVisible({
      timeout: 25_000,
    });
  });

  test("admin ads page loads with create button", async ({ page }) => {
    await page.goto("/admin/ads");
    await expect(page.getByTestId("create-ad-btn")).toBeVisible({
      timeout: 25_000,
    });
  });

  test("admin categories API returns list for ADMIN", async ({ page }) => {
    const res = await page.request.get("/api/admin/categories");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test("admin tags API returns list for ADMIN", async ({ page }) => {
    const res = await page.request.get("/api/admin/tags");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test("admin videos API returns list for ADMIN", async ({ page }) => {
    const res = await page.request.get("/api/admin/videos?limit=5");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test("admin ads API returns list for ADMIN", async ({ page }) => {
    const res = await page.request.get("/api/admin/ads?limit=5");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test("admin homepage page loads featured and hot tabs", async ({ page }) => {
    await page.goto("/admin/homepage");
    await expect(page.getByTestId("admin-homepage-page")).toBeVisible({
      timeout: 25_000,
    });
    await expect(page.getByTestId("homepage-tab-articles")).toBeVisible();
    await expect(page.getByTestId("homepage-tab-featured")).toBeVisible();
    await expect(page.getByTestId("homepage-tab-hot")).toBeVisible();
    await expect(page.getByTestId("homepage-search")).toBeEditable({
      timeout: 15_000,
    });

    await page.getByTestId("homepage-tab-featured").click();
    await expect(page.getByText("PILIHAN UTAMA (0)")).toBeVisible();
    await page.getByTestId("homepage-tab-hot").click();
    await expect(page.getByText(/^HOT \(\d+\)$/)).toBeVisible();
  });

  test("admin homepage API returns featured and hot arrays", async ({ page }) => {
    const res = await page.request.get("/api/admin/homepage");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data.featured)).toBe(true);
    expect(Array.isArray(data.hot)).toBe(true);
  });
});
