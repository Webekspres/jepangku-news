import { test, expect } from "@playwright/test";
import { fetchFirstArticleSlug } from "./helpers/fixtures";

test.describe("Articles", () => {
  test("articles list page loads with filters", async ({ page }) => {
    await page.goto("/articles");
    await expect(page.getByTestId("article-list-page")).toBeVisible();
    await expect(page.getByTestId("filter-all")).toBeVisible();
    await expect(page.getByTestId("search-input")).toBeEditable();
    await expect(page.getByTestId("sort-latest")).toBeVisible();
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
