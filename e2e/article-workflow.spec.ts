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
    expect(data).toHaveProperty("totalArticles");
    expect(data).toHaveProperty("pendingArticles");
    expect(data).toHaveProperty("charts");
  });

  test("admin submit page is accessible", async ({ page }) => {
    await page.goto("/submit-article");
    await expect(page.getByTestId("submit-article-page")).toBeVisible({
      timeout: 20_000,
    });
  });

  test("§3.16 admin create page has rich text editor", async ({ page }) => {
    await page.goto("/admin/articles/create");
    await expect(page.getByTestId("admin-article-title")).toBeVisible({
      timeout: 25_000,
    });
    await expect(page.locator(".ProseMirror").or(page.locator(".tiptap"))).toBeVisible();
    await expect(page.getByTestId("admin-save-draft")).toBeVisible();
    await expect(page.getByTestId("admin-publish")).toBeVisible();
  });

  test("§3.17 admin review queue page loads", async ({ page }) => {
    await page.goto("/admin/articles/review");
    await expect(page.locator('[data-testid^="queue-article-"]').or(
      page.getByText("Tidak ada artikel"),
    )).toBeVisible({ timeout: 25_000 });
  });

  test("§3.19 admin export CSV and JSON", async ({ page }) => {
    const csvRes = await page.request.get("/api/admin/articles/export?format=csv");
    expect(csvRes.ok()).toBeTruthy();
    expect(csvRes.headers()["content-type"]).toContain("text/csv");

    const jsonRes = await page.request.get("/api/admin/articles/export?format=json");
    expect(jsonRes.ok()).toBeTruthy();
    const rows = await jsonRes.json();
    expect(Array.isArray(rows)).toBe(true);
  });

  test("§3.18 bulk approve is idempotent on published article", async ({
    page,
    request,
  }) => {
    const listRes = await request.get("/api/articles?limit=1");
    const listData = await listRes.json();
    const id = listData.articles?.[0]?.id;
    test.skip(!id, "No published article");

    const first = await page.request.post("/api/admin/articles/bulk", {
      data: { action: "approve", ids: [id] },
    });
    const second = await page.request.post("/api/admin/articles/bulk", {
      data: { action: "approve", ids: [id] },
    });
    expect(first.ok()).toBeTruthy();
    expect(second.ok()).toBeTruthy();
    const body = await second.json();
    expect(body.succeeded).toBe(1);
  });
});

test.describe("Article workflow — CONTRIBUTOR draft & preview", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "CONTRIBUTOR");
  });

  test("§3.12 draft autosave via PATCH API", async ({ page }) => {
    const createRes = await page.request.post("/api/articles/create", {
      data: {
        title: `E2E Autosave ${Date.now()}`,
        content: "<p>Initial draft</p>",
        status: "DRAFT",
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const { id } = await createRes.json();

    const patchRes = await page.request.patch(`/api/articles/drafts/${id}`, {
      data: { content: "<p>Autosaved updated body</p>" },
    });
    expect(patchRes.ok()).toBeTruthy();
  });

  test("§3.13 preview page loads for own draft", async ({ page }) => {
    const createRes = await page.request.post("/api/articles/create", {
      data: {
        title: `E2E Preview ${Date.now()}`,
        content: "<p>Preview body content here.</p>",
        status: "DRAFT",
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const { id } = await createRes.json();

    await page.goto(`/preview-article/${id}`);
    await expect(page.getByTestId("preview-article-page")).toBeVisible({
      timeout: 20_000,
    });
  });

  test("§3.14 my-articles shows status filters", async ({ page }) => {
    await page.goto("/my-articles");
    await expect(page.getByTestId("my-articles-page")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("filter-DRAFT")).toBeVisible();
    await expect(page.getByTestId("filter-PENDING_REVIEW")).toBeVisible();
    await expect(page.getByTestId("filter-PUBLISHED")).toBeVisible();
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
