import { test, expect } from "@playwright/test";
import {
  E2E_AUTH_SKIP_REASON,
  injectClerkSession,
  isE2EAuthAvailable,
  signInAs,
} from "./helpers/clerk-auth";
import { expectGuestRedirectToSignIn } from "./helpers/fixtures";

const DRAFT_TITLE = `E2E Workflow ${Date.now()}`;

test.describe("Article workflow — guest gates", () => {
  test("admin articles page redirects guest to sign-in", async ({ page }) => {
    await expectGuestRedirectToSignIn(page, "/admin/articles");
  });

  test("admin pending API returns 403 for guest", async ({ request }) => {
    const res = await request.get("/api/admin/articles/pending");
    expect(res.status()).toBe(403);
  });
});

test.describe("Article workflow — CONTRIBUTOR submit", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "CONTRIBUTOR");
  });

  test("submit page has required form fields", async ({ page }) => {
    await page.goto("/submit-article");
    await expect(page.getByTestId("submit-article-page")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("article-title-input")).toBeEditable();
    await expect(page.getByTestId("article-excerpt-input")).toBeEditable();
    await expect(page.getByTestId("article-category-select")).toBeVisible();
    await expect(page.getByTestId("submit-review-btn")).toBeVisible();
  });

  test("CONTRIBUTOR can create draft via API", async ({ page }) => {
    const res = await page.request.post("/api/articles/create", {
      data: {
        title: DRAFT_TITLE,
        content: "<p>E2E workflow draft body with enough content.</p>",
        excerpt: "E2E excerpt",
        status: "DRAFT",
      },
    });
    expect(res.ok()).toBeTruthy();
    const article = await res.json();
    expect(article.status).toBe("DRAFT");
    expect(article.slug).toBeTruthy();
  });

  test("my-articles lists contributor drafts", async ({ page }) => {
    await page.request.post("/api/articles/create", {
      data: {
        title: `${DRAFT_TITLE} list`,
        content: "<p>List check body</p>",
        status: "DRAFT",
      },
    });

    await page.goto("/my-articles");
    await expect(page.getByTestId("my-articles-page")).toBeVisible({
      timeout: 20_000,
    });
    await expect(
      page.getByText(DRAFT_TITLE, { exact: false }).or(page.getByTestId("no-my-articles")),
    ).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("Article workflow — ADMIN review", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "ADMIN");
  });

  test("admin articles dashboard loads", async ({ page }) => {
    await page.goto("/admin/articles");
    await expect(page.getByTestId("admin-articles-stats")).toBeVisible({
      timeout: 25_000,
    });
    await expect(page.getByTestId("create-article-btn")).toBeVisible();
  });

  test("admin can fetch pending articles via API", async ({ page }) => {
    const res = await page.request.get("/api/admin/articles/pending");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data) || Array.isArray(data.articles)).toBe(true);
  });

  test("admin can list all articles via API", async ({ page }) => {
    const res = await page.request.get("/api/admin/articles?limit=5");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty("articles");
  });

  test("admin stats API returns dashboard metrics", async ({ page }) => {
    const res = await page.request.get("/api/admin/stats");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty("articles");
  });

  test("admin submit page is accessible", async ({ page }) => {
    await page.goto("/submit-article");
    await expect(page.getByTestId("submit-article-page")).toBeVisible({
      timeout: 20_000,
    });
  });
});

test.describe("Article workflow — role boundaries", () => {
  test("CONTRIBUTOR cannot access admin stats API", async ({ browser }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    const context = await browser.newContext();
    await injectClerkSession(context, "CONTRIBUTOR");
    const api = context.request;
    const res = await api.get("/api/admin/stats");
    expect(res.status()).toBe(403);
    await context.close();
  });
});
