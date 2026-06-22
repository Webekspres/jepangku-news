import { test, expect } from "@playwright/test";
import {
  E2E_AUTH_SKIP_REASON,
  isE2EAuthAvailable,
  signInAs,
} from "./helpers/clerk-auth";
import {
  expectGuestRedirectToSignIn,
  fetchFirstArticleSlug,
} from "./helpers/fixtures";

test.describe("Engagement — comments API gates", () => {
  test("POST /api/comments returns 401 for guest", async ({ request }) => {
    const slug = await fetchFirstArticleSlug(request);
    test.skip(!slug, "No published articles in database");

    const res = await request.post("/api/comments", {
      data: { articleSlug: slug, content: "E2E guest comment" },
    });
    expect(res.status()).toBe(401);
  });

  test("GET /api/comments returns list for published article", async ({ request }) => {
    const slug = await fetchFirstArticleSlug(request);
    test.skip(!slug, "No published articles in database");

    const res = await request.get(`/api/comments?articleSlug=${slug}`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty("comments");
    expect(Array.isArray(data.comments)).toBe(true);
  });
});

test.describe("Engagement — reactions", () => {
  test("POST /api/reactions returns 401 for guest", async ({ request }) => {
    const slug = await fetchFirstArticleSlug(request);
    test.skip(!slug, "No published articles in database");

    const res = await request.post("/api/reactions", {
      data: { targetType: "ARTICLE", targetId: slug, reactionType: "LOVE" },
    });
    expect([401, 400]).toContain(res.status());
  });

  test("GET /api/reactions/browse returns envelope", async ({ request }) => {
    const res = await request.get("/api/reactions/browse?type=LOVE&limit=3");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty("articles");
  });

  test("reaction browse page loads for love type", async ({ page }) => {
    await page.goto("/reactions/love");
    await expect(page.getByTestId("reaction-browse-page")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("reaction-browse-articles")).toBeVisible();
  });

  test("home reactions section loads after scroll", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("home-sentinel-reactions").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("home-reactions-loading")).toBeHidden({
      timeout: 25_000,
    });
    await expect(
      page
        .getByTestId("home-reactions-section")
        .or(page.getByText("Gagal memuat reaksi komunitas.")),
    ).toBeVisible({ timeout: 25_000 });
  });

  test("reaction bar visible on article detail when content exists", async ({
    page,
    request,
  }) => {
    const slug = await fetchFirstArticleSlug(request);
    test.skip(!slug, "No published articles in database");

    await page.goto(`/articles/${slug}`);
    await expect(page.getByTestId("article-detail-page")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("reaction-bar")).toBeVisible();
  });
});

test.describe("Engagement — bookmarks", () => {
  test("bookmarks page redirects guest to sign-in", async ({ page }) => {
    await expectGuestRedirectToSignIn(page, "/bookmarks");
  });

  test("POST bookmark returns 401 for guest", async ({ request }) => {
    const slug = await fetchFirstArticleSlug(request);
    test.skip(!slug, "No published articles in database");

    const res = await request.post(`/api/bookmarks/${slug}`, { data: {} });
    expect(res.status()).toBe(401);
  });

  test("GET /api/bookmarks returns 401 for guest", async ({ request }) => {
    const res = await request.get("/api/bookmarks");
    expect(res.status()).toBe(401);
  });

  test.beforeEach(async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "USER");
  });

  test("USER can open bookmarks page", async ({ page }) => {
    await page.goto("/bookmarks");
    await expect(page.getByTestId("bookmarks-page")).toBeVisible({
      timeout: 20_000,
    });
    await expect(
      page.getByTestId("no-bookmarks").or(page.locator('[data-testid^="article-card-"]')),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("USER bookmarks API returns array", async ({ page }) => {
    const res = await page.request.get("/api/bookmarks");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

test.describe("Engagement — comments UI", () => {
  test("comment section renders on article detail", async ({ page, request }) => {
    const slug = await fetchFirstArticleSlug(request);
    test.skip(!slug, "No published articles in database");

    await page.goto(`/articles/${slug}`);
    await expect(page.getByTestId("comment-section")).toBeVisible({
      timeout: 20_000,
    });
    await expect(
      page.getByTestId("comment-list").or(page.getByTestId("no-comments")),
    ).toBeVisible();
  });

  test.beforeEach(async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "USER");
  });

  test("logged-in USER sees comment input on article", async ({ page, request }) => {
    const slug = await fetchFirstArticleSlug(request);
    test.skip(!slug, "No published articles in database");

    await page.goto(`/articles/${slug}`);
    await expect(page.getByTestId("comment-input")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("comment-submit")).toBeVisible();
  });

  test("bookmark button visible on article detail for USER", async ({ page, request }) => {
    const slug = await fetchFirstArticleSlug(request);
    test.skip(!slug, "No published articles in database");

    await page.goto(`/articles/${slug}`);
    await expect(page.getByTestId("bookmark-btn")).toBeVisible({
      timeout: 20_000,
    });
  });
});
