import { test, expect } from "@playwright/test";

test.describe("Search — hero", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("homepage")).toBeVisible();
  });

  test("hero search form is visible and editable", async ({ page }) => {
    await expect(page.getByTestId("hero-search-form")).toBeVisible();
    await expect(page.getByTestId("hero-search-input")).toBeEditable();
    await expect(page.getByTestId("hero-search-submit")).toBeVisible();
  });

  test("hero search submits to search page with query", async ({ page }) => {
    await expect(page.getByTestId("homepage-loading")).toBeHidden({ timeout: 20_000 });
    await page.getByTestId("hero-search-input").fill("anime");
    await Promise.all([
      page.waitForURL(/\/search\?q=anime/, { timeout: 15_000 }),
      page.getByTestId("hero-search-form").evaluate((form) => {
        (form as HTMLFormElement).requestSubmit();
      }),
    ]);
    await expect(page.getByTestId("search-page")).toBeVisible();
  });

  test("hero search accepts keyboard input", async ({ page }) => {
    const input = page.getByTestId("hero-search-input");
    await input.focus();
    await page.keyboard.type("nihongo");
    await expect(input).toHaveValue("nihongo");
  });

  test("empty hero search does not navigate away", async ({ page }) => {
    await page.getByTestId("hero-search-submit").click();
    await expect(page).toHaveURL(/\/(\?.*)?$/);
    await expect(page.getByTestId("homepage")).toBeVisible();
  });
});

test.describe("Search — navbar overlay", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("homepage")).toBeVisible();
  });

  test("navbar search overlay is inert when closed on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.getByTestId("navbar-search-overlay-root")).toHaveAttribute(
      "inert",
      "",
    );
  });

  test("navbar search button opens overlay", async ({ page }) => {
    await page.getByTestId("navbar-search-btn").click();
    await expect(page.getByTestId("navbar-search-overlay")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByTestId("navbar-search-input")).toBeEditable();
  });

  test("navbar search submits query to search page", async ({ page }) => {
    await page.getByTestId("navbar-search-btn").click();
    await page.getByTestId("navbar-search-input").fill("tokyo");
    await page.getByTestId("navbar-search-submit").click();
    await expect(page).toHaveURL(/\/search\?q=tokyo/, { timeout: 15_000 });
    await expect(page.getByTestId("search-page")).toBeVisible();
  });

  test("navbar search backdrop closes overlay", async ({ page }) => {
    await page.getByTestId("navbar-search-btn").click();
    await expect(page.getByTestId("navbar-search-overlay")).toBeVisible();
    await page.getByTestId("navbar-search-backdrop").click({ force: true });
    await expect(page.getByTestId("navbar-search-overlay-root")).toHaveAttribute(
      "inert",
      "",
    );
  });
});

test.describe("Search — global search page", () => {
  test("search page shows empty query prompt", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByTestId("search-page")).toBeVisible();
    await expect(page.getByTestId("search-empty-query")).toBeVisible();
  });

  test("search page with query shows results or no-results", async ({ page }) => {
    await page.goto("/search?q=jepang");
    await expect(page.getByTestId("search-page")).toBeVisible();
    await expect(
      page
        .getByTestId("search-articles")
        .or(page.getByTestId("search-no-results")),
    ).toBeVisible({ timeout: 20_000 });
  });

  test("search page input preserves query", async ({ page }) => {
    await page.goto("/search?q=kuis");
    await expect(page.getByTestId("search-page-input")).toHaveValue("kuis");
  });

  test("search page form submits updated query", async ({ page }) => {
    await page.goto("/search?q=old");
    await page.getByTestId("search-page-input").fill("budaya");
    await page.getByTestId("search-page-submit").click();
    await expect(page).toHaveURL(/q=budaya/, { timeout: 10_000 });
  });

  test("GET /api/search returns multi-type results", async ({ request }) => {
    const res = await request.get("/api/search?q=a&limit=3");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty("articles");
  });

  test("articles list page has local search", async ({ page }) => {
    await page.goto("/articles");
    await expect(page.getByTestId("search-input")).toBeEditable();
    await expect(page.getByTestId("search-submit")).toBeVisible();
  });
});
