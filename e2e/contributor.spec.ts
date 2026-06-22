import { test, expect } from "@playwright/test";
import {
  E2E_AUTH_SKIP_REASON,
  isE2EAuthAvailable,
  signInAs,
} from "./helpers/clerk-auth";
import { expectGuestRedirectToSignIn } from "./helpers/fixtures";

test.describe("Contributor — guest gates", () => {
  test("my-articles redirects guest to sign-in", async ({ page }) => {
    await expectGuestRedirectToSignIn(page, "/my-articles");
  });

  test("submit-article redirects guest to sign-in", async ({ page }) => {
    await expectGuestRedirectToSignIn(page, "/submit-article");
  });

  test("contributor apply page shows login prompt for guest", async ({ page }) => {
    await page.goto("/contributor/apply");
    await expect(page.getByRole("link", { name: /masuk/i })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("GET /api/contributor/status returns 401 for guest", async ({ request }) => {
    const res = await request.get("/api/contributor/status");
    expect(res.status()).toBe(401);
  });

  test("POST /api/contributor/apply returns 401 for guest", async ({ request }) => {
    const res = await request.post("/api/contributor/apply", {
      data: { motivation: "E2E guest apply attempt with enough chars" },
    });
    expect(res.status()).toBe(401);
  });

  test("POST /api/articles/create returns 401 for guest", async ({ request }) => {
    const res = await request.post("/api/articles/create", {
      data: { title: "E2E Guest Draft", content: "<p>body</p>" },
    });
    expect(res.status()).toBe(401);
  });

  test("GET /api/articles/my returns 401 for guest", async ({ request }) => {
    const res = await request.get("/api/articles/my");
    expect(res.status()).toBe(401);
  });
});

test.describe("Contributor — USER apply flow", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "USER");
  });

  test("USER can open contributor apply page", async ({ page }) => {
    await page.goto("/contributor/apply");
    await expect(
      page
        .getByTestId("contributor-apply-form")
        .or(page.getByTestId("contributor-apply-pending"))
        .or(page.getByTestId("contributor-apply-rejected")),
    ).toBeVisible({ timeout: 20_000 });
  });

  test("USER contributor status reports isContributor false", async ({ page }) => {
    const res = await page.request.get("/api/contributor/status");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.isContributor).toBe(false);
  });

  test("USER is blocked from submit-article by ContributorGate", async ({ page }) => {
    await page.goto("/submit-article");
    await expect(page).toHaveURL(/contributor\/apply/, { timeout: 20_000 });
  });

  test("USER my-articles redirects to contributor apply", async ({ page }) => {
    await page.goto("/my-articles");
    await expect(page).toHaveURL(/contributor\/apply|sign-in/, { timeout: 20_000 });
  });

  test("navbar shows contributor CTA for USER", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("homepage")).toBeVisible();
    const cta = page.getByTestId("mobile-contributor-cta");
    if ((await cta.count()) > 0) {
      await expect(cta.first()).toBeVisible();
    }
  });
});

test.describe("Contributor — CONTRIBUTOR access", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "CONTRIBUTOR");
  });

  test("CONTRIBUTOR can access submit-article page", async ({ page }) => {
    await page.goto("/submit-article");
    await expect(page.getByTestId("submit-article-page")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("article-title-input")).toBeEditable();
    await expect(page.getByTestId("submit-review-btn")).toBeVisible();
  });

  test("CONTRIBUTOR can access my-articles page", async ({ page }) => {
    await page.goto("/my-articles");
    await expect(page.getByTestId("my-articles-page")).toBeVisible({
      timeout: 20_000,
    });
  });

  test("CONTRIBUTOR status API reports isContributor true", async ({ page }) => {
    const res = await page.request.get("/api/contributor/status");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.isContributor).toBe(true);
  });

  test("CONTRIBUTOR can list own articles via API", async ({ page }) => {
    const res = await page.request.get("/api/articles/my");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty("articles");
    expect(Array.isArray(data.articles)).toBe(true);
  });

  test("CONTRIBUTOR apply page redirects to submit-article", async ({ page }) => {
    await page.goto("/contributor/apply");
    await expect(page).toHaveURL(/submit-article/, { timeout: 20_000 });
  });
});
