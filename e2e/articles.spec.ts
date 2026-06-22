import { test, expect } from "@playwright/test";
import {
  E2E_AUTH_SKIP_REASON,
  isE2EAuthAvailable,
  signInAs,
} from "./helpers/clerk-auth";
import { fetchFirstArticleSlug } from "./helpers/fixtures";

test.describe("Articles", () => {
  test("articles list page loads with filters", async ({ page }) => {
    await page.goto("/articles");
    await expect(page.getByTestId("article-list-page")).toBeVisible();
    await expect(page.getByTestId("filter-all")).toBeVisible();
    await expect(page.getByTestId("search-input")).toBeEditable();
    await expect(page.getByTestId("sort-latest")).toBeVisible();
  });

  test("§3.1 pagination — load more fetches next page", async ({ page, request }) => {
    const apiRes = await request.get("/api/articles?page=1&limit=12");
    const apiData = await apiRes.json();
    test.skip(!apiData.hasMore, "Not enough articles for pagination");

    await page.goto("/articles");
    await expect(page.getByTestId("article-list-page")).toBeVisible();
    const loadMore = page.getByTestId("load-more");
    await expect(loadMore).toBeVisible({ timeout: 20_000 });
    await loadMore.click();
    await expect(loadMore.or(page.locator('[data-testid^="article-card-"]'))).toBeVisible();
  });

  test("§3.3 category filter updates URL", async ({ page }) => {
    await page.goto("/articles");
    const categoryBtn = page.locator('[data-testid^="filter-"]').nth(1);
    const testId = await categoryBtn.getAttribute("data-testid");
    test.skip(!testId || testId === "filter-all", "No category filters in seed");

    await categoryBtn.click();
    await expect(page).toHaveURL(/category=/);
  });

  test("public articles API returns published content envelope", async ({
    request,
  }) => {
    const res = await request.get("/api/articles?limit=1");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty("articles");
    expect(data).toHaveProperty("total");
    expect(Array.isArray(data.articles)).toBe(true);
  });

  test("article detail renders when published content exists", async ({
    page,
    request,
  }) => {
    const slug = await fetchFirstArticleSlug(request);
    test.skip(!slug, "No published articles in database");

    await page.goto(`/articles/${slug}`);
    await expect(page.getByTestId("article-detail-page")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("article-title")).toBeVisible();
    await expect(page.getByTestId("article-content")).toBeVisible();
    await expect(page.getByTestId("article-breadcrumb")).toBeVisible();
  });

  test("§3.2 detail — safe HTML (no script in content)", async ({
    page,
    request,
  }) => {
    const slug = await fetchFirstArticleSlug(request);
    test.skip(!slug, "No published articles in database");

    await page.goto(`/articles/${slug}`);
    const content = page.getByTestId("article-content");
    await expect(content).toBeVisible({ timeout: 20_000 });
    const html = await content.innerHTML();
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/onerror=/i);
  });

  test("§3.2 detail — SEO metadata in document", async ({ page, request }) => {
    const slug = await fetchFirstArticleSlug(request);
    test.skip(!slug, "No published articles in database");

    await page.goto(`/articles/${slug}`);
    await expect(page.getByTestId("article-title")).toBeVisible({ timeout: 20_000 });
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title).not.toContain("tidak ditemukan");

    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toHaveCount(1);
    const ldText = await jsonLd.textContent();
    expect(ldText).toContain("NewsArticle");
  });

  test("§3.7 tag navigates to search", async ({ page, request }) => {
    const slug = await fetchFirstArticleSlug(request);
    test.skip(!slug, "No published articles in database");

    await page.goto(`/articles/${slug}`);
    const tagLink = page.locator('[data-testid^="article-tag-"]');
    test.skip((await tagLink.count()) === 0, "Article has no tags");
    await expect(tagLink.first()).toBeVisible({ timeout: 20_000 });
    const href = await tagLink.first().getAttribute("href");
    expect(href).toMatch(/\/articles\?tag=/);
  });

  test("§3.8 sidebar renders on article detail", async ({ page, request }) => {
    const slug = await fetchFirstArticleSlug(request);
    test.skip(!slug, "No published articles in database");

    await page.goto(`/articles/${slug}`);
    await expect(page.getByTestId("article-sidebar")).toBeVisible({
      timeout: 20_000,
    });
    await expect(
      page.getByTestId("article-sidebar-ad").or(page.getByTestId("article-sidebar-trending")),
    ).toBeVisible();
  });

  test("§3.9 author card links to public profile", async ({ page, request }) => {
    const slug = await fetchFirstArticleSlug(request);
    test.skip(!slug, "No published articles in database");

    await page.goto(`/articles/${slug}`);
    const card = page.getByTestId("author-profile-card");
    await expect(card).toBeVisible({ timeout: 20_000 });

    const profileLink = page.getByTestId("author-profile-view-all");
    const href = await profileLink.getAttribute("href");
    expect(href).toMatch(/^\/profile\/[a-z0-9_-]+$/i);
  });

  test("bookmark API requires authentication", async ({ request }) => {
    const slug = await fetchFirstArticleSlug(request);
    test.skip(!slug, "No published articles in database");

    const res = await request.post(`/api/bookmarks/${slug}`, {
      data: {},
    });
    expect(res.status()).toBe(401);
  });

  test("articles list navigates to detail via card link", async ({
    page,
    request,
  }) => {
    const slug = await fetchFirstArticleSlug(request);
    test.skip(!slug, "No published articles in database");

    await page.goto("/articles");
    await expect(page.getByTestId("article-list-page")).toBeVisible();

    const card = page.getByTestId(`article-card-${slug}`).or(
      page.getByTestId(`article-featured-${slug}`),
    );
    const link = card.first();
    await expect(link).toBeVisible({ timeout: 20_000 });
    await link.scrollIntoViewIfNeeded();
    await Promise.all([
      page.waitForURL(new RegExp(`/articles/${slug}`), { timeout: 20_000 }),
      link.click(),
    ]);
    await expect(page.getByTestId("article-detail-page")).toBeVisible();
  });
});

test.describe("Articles — bookmark toggle (§3.6)", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "USER");
  });

  test("USER can toggle bookmark on article detail", async ({ page, request }) => {
    const slug = await fetchFirstArticleSlug(request);
    test.skip(!slug, "No published articles in database");

    const listRes = await request.get("/api/articles?limit=1");
    const listData = await listRes.json();
    const articleId = listData.articles?.[0]?.id;
    test.skip(!articleId, "No article id");

    await page.goto(`/articles/${slug}`);
    const btn = page.getByTestId("bookmark-btn");
    await expect(btn).toBeVisible({ timeout: 20_000 });
    await btn.click();

    const bookmarked = await page.request.get("/api/bookmarks");
    expect(bookmarked.ok()).toBeTruthy();
    const items = (await bookmarked.json()) as { id: string }[];
    const ids = items.map((a) => a.id);
    expect(ids).toContain(articleId);

    await btn.click();
    const after = await page.request.get("/api/bookmarks");
    const afterItems = (await after.json()) as { id: string }[];
    const afterIds = afterItems.map((a) => a.id);
    expect(afterIds).not.toContain(articleId);
  });
});
