import { test, expect } from "@playwright/test";
import {
  E2E_AUTH_SKIP_REASON,
  isE2EAuthAvailable,
  signInAs,
} from "./helpers/clerk-auth";
import {
  expectGuestRedirectToSignIn,
  fetchFirstArticleId,
  fetchFirstArticleSlug,
  fetchFirstCategoryId,
  fetchFirstPollSlug,
  fetchFirstQuizSlug,
} from "./helpers/fixtures";

test.describe("Engagement — comments API gates", () => {
  test("POST /api/comments returns 401 for guest", async ({ request }) => {
    const articleId = await fetchFirstArticleId(request);
    test.skip(!articleId, "No published articles in database");

    const res = await request.post("/api/comments", {
      data: {
        targetType: "ARTICLE",
        targetId: articleId,
        content: "E2E guest comment",
      },
    });
    expect(res.status()).toBe(401);
  });

  test("GET /api/comments returns thread for published article", async ({
    request,
  }) => {
    const articleId = await fetchFirstArticleId(request);
    test.skip(!articleId, "No published articles in database");

    const res = await request.get(
      `/api/comments?targetType=ARTICLE&targetId=${articleId}`,
    );
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty("comments");
    expect(Array.isArray(data.comments)).toBe(true);
  });
});

test.describe("Engagement — reactions", () => {
  test("POST /api/reactions returns 401 for guest", async ({ request }) => {
    const articleId = await fetchFirstArticleId(request);
    test.skip(!articleId, "No published articles in database");

    const res = await request.post("/api/reactions", {
      data: { targetType: "ARTICLE", targetId: articleId, type: "LOVE" },
    });
    expect(res.status()).toBe(401);
  });

  test("GET /api/reactions/browse returns envelope", async ({ request }) => {
    const res = await request.get(
      "/api/reactions/browse?type=LOVE&targetType=ARTICLE&limit=3",
    );
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty("items");
    expect(data.targetType).toBe("ARTICLE");
  });

  test("GET /api/reactions/browse filters by targetType", async ({ request }) => {
    for (const targetType of ["ARTICLE", "QUIZ", "POLL"]) {
      const res = await request.get(
        `/api/reactions/browse?type=LOVE&targetType=${targetType}&limit=2`,
      );
      expect(res.ok()).toBeTruthy();
      const data = await res.json();
      expect(data.targetType).toBe(targetType);
    }
  });

  test("reaction browse page shows articles quizzes and polls sections", async ({
    page,
  }) => {
    await page.goto("/reactions/love");
    await expect(page.getByTestId("reaction-browse-page")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("reaction-browse-articles")).toBeVisible();
    await expect(page.getByTestId("reaction-browse-quizzes")).toBeVisible();
    await expect(page.getByTestId("reaction-browse-polls")).toBeVisible();
  });

  test("home reactions section loads after scroll", async ({ page, request }) => {
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

    const res = await request.get("/api/home/reactions");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data.articles)).toBe(true);
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
    const reactionBar = page.getByTestId("reaction-bar");
    await reactionBar.scrollIntoViewIfNeeded();
    await expect(reactionBar).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("reaction-LOVE")).toBeVisible();
  });

  test("reaction bar visible on quiz and poll detail", async ({ page, request }) => {
    const quizSlug = await fetchFirstQuizSlug(request);
    const pollSlug = await fetchFirstPollSlug(request);
    test.skip(!quizSlug && !pollSlug, "No active quiz or poll");

    if (quizSlug) {
      await page.goto(`/quizzes/${quizSlug}`);
      await expect(page.getByTestId("quiz-detail-page")).toBeVisible({
        timeout: 20_000,
      });
      const reactionBar = page.getByTestId("reaction-bar");
      await reactionBar.scrollIntoViewIfNeeded();
      await expect(reactionBar).toBeVisible({ timeout: 20_000 });
    }

    if (pollSlug) {
      await page.goto(`/polls/${pollSlug}`);
      await expect(page.getByTestId("poll-detail-page")).toBeVisible({
        timeout: 20_000,
      });
      const reactionBar = page.getByTestId("reaction-bar");
      await reactionBar.scrollIntoViewIfNeeded();
      await expect(reactionBar).toBeVisible({ timeout: 20_000 });
    }
  });
});

test.describe("Engagement — bookmarks (guest)", () => {
  test("bookmarks page redirects guest to sign-in", async ({ page }) => {
    await expectGuestRedirectToSignIn(page, "/bookmarks");
  });

  test("POST bookmark returns 401 for guest", async ({ request }) => {
    const articleId = await fetchFirstArticleId(request);
    test.skip(!articleId, "No published articles in database");

    const res = await request.post(`/api/bookmarks/${articleId}`, { data: {} });
    expect(res.status()).toBe(401);
  });

  test("GET /api/bookmarks returns 401 for guest", async ({ request }) => {
    const res = await request.get("/api/bookmarks");
    expect(res.status()).toBe(401);
  });
});

test.describe("Engagement — bookmarks (USER)", () => {
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

  test("USER can toggle bookmark via API and see article in list", async ({
    page,
    request,
  }) => {
    const articleId = await fetchFirstArticleId(request);
    const slug = await fetchFirstArticleSlug(request);
    test.skip(!articleId || !slug, "No published articles in database");

    const create = await page.request.post(`/api/bookmarks/${articleId}`);
    expect(create.ok()).toBeTruthy();

    await page.goto("/bookmarks");
    await expect(page.getByTestId("bookmarks-page")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId(`article-card-${slug}`)).toBeVisible({
      timeout: 15_000,
    });
  });
});

test.describe("Engagement — comments UI", () => {
  test("comment section renders on article detail", async ({ page, request }) => {
    const slug = await fetchFirstArticleSlug(request);
    test.skip(!slug, "No published articles in database");

    await page.goto(`/articles/${slug}`);
    const section = page.getByTestId("comment-section");
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByTestId("comment-list").or(page.getByTestId("no-comments")),
    ).toBeVisible();
  });
});

test.describe("Engagement — comments UI (USER)", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "USER");
  });

  test("logged-in USER sees comment input on article", async ({ page, request }) => {
    const slug = await fetchFirstArticleSlug(request);
    test.skip(!slug, "No published articles in database");

    await page.goto(`/articles/${slug}`);
    const input = page.getByTestId("comment-input");
    await input.scrollIntoViewIfNeeded();
    await expect(input).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("comment-submit")).toBeVisible();
  });

  test("bookmark button visible on article detail for USER", async ({ page, request }) => {
    const slug = await fetchFirstArticleSlug(request);
    test.skip(!slug, "No published articles in database");

    await page.goto(`/articles/${slug}`);
    const bookmarkBtn = page.getByTestId("bookmark-btn");
    await bookmarkBtn.scrollIntoViewIfNeeded();
    await expect(bookmarkBtn).toBeVisible({ timeout: 20_000 });
  });
});

test.describe("Engagement — share", () => {
  test("article share copy link button is visible", async ({ page, request }) => {
    const slug = await fetchFirstArticleSlug(request);
    test.skip(!slug, "No published articles in database");

    await page.goto(`/articles/${slug}`);
    const shareButtons = page.getByTestId("article-share-buttons");
    await shareButtons.scrollIntoViewIfNeeded();
    await expect(shareButtons).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("share-copy-link")).toBeVisible();
  });

  test("POST share with copy-link method for authenticated USER", async ({
    page,
    request,
  }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    const slug = await fetchFirstArticleSlug(request);
    test.skip(!slug, "No published articles in database");

    await signInAs(page, "USER");
    const res = await page.request.post(`/api/articles/${slug}/share`, {
      data: { shareMethod: "copy-link" },
    });
    expect([200, 400]).toContain(res.status());
  });
});

test.describe("Engagement — category subscribe", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "USER");
  });

  test("category subscribe button visible after selecting category filter", async ({
    page,
    request,
  }) => {
    const categoriesRes = await request.get("/api/categories");
    const categories = await categoriesRes.json();
    const categorySlug = categories[0]?.slug;
    test.skip(!categorySlug, "No categories in database");

    await page.goto("/articles");
    const filter = page.getByTestId(`filter-${categorySlug}`);
    await expect(filter).toBeVisible({ timeout: 20_000 });
    await filter.click();
    await expect(page.getByTestId("category-subscribe-banner")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId(`category-subscribe-${categorySlug}`)).toBeVisible();
  });

  test("category subscription API subscribe and unsubscribe", async ({ page, request }) => {
    const categoryId = await fetchFirstCategoryId(request);
    test.skip(!categoryId, "No categories in database");

    const subscribe = await page.request.post("/api/category-subscriptions", {
      data: { categoryId },
    });
    expect(subscribe.ok()).toBeTruthy();

    const unsubscribe = await page.request.delete(
      `/api/category-subscriptions?categoryId=${categoryId}`,
    );
    expect(unsubscribe.ok()).toBeTruthy();
  });
});

test.describe("Engagement — admin comment moderation", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "ADMIN");
  });

  test("admin comments page loads", async ({ page }) => {
    await page.goto("/admin/comments");
    await expect(page.getByTestId("admin-comments-page")).toBeVisible({
      timeout: 25_000,
    });
  });
});
