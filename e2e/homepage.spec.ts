import { test, expect } from "@playwright/test";
import { HOME_SECTIONS } from "../lib/home/sections";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("homepage")).toBeVisible();
  });

  test("renders all homepage sections with wave metadata", async ({ page }) => {
    for (const section of HOME_SECTIONS) {
      const el = page.getByTestId(`home-section-${section.id}`);
      await expect(el).toBeAttached();
      await expect(el).toHaveAttribute("data-home-implemented", "true");

      const expectedWave =
        section.wave === null ? "static" : String(section.wave);
      await expect(el).toHaveAttribute("data-home-wave", expectedWave);
    }
  });

  test("wave 1 feed loads immediately without scroll", async ({ page }) => {
    await expect(page.getByTestId("homepage-loading")).toBeHidden({
      timeout: 20_000,
    });

    await expect(
      page
        .getByTestId("trending-panel")
        .or(page.getByTestId("trending-empty")),
    ).toBeVisible();
  });

  test("hero section is interactive", async ({ page }) => {
    await expect(page.getByTestId("hero-search-form")).toBeVisible();
    await expect(page.getByTestId("hero-search-input")).toBeEditable();
    await expect(page.getByTestId("hero-search-submit")).toBeVisible();
  });

  test("today section shows articles or empty state", async ({ page }) => {
    await expect(page.getByTestId("home-section-today")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Artikel Hari Ini" }),
    ).toBeVisible();

    const articleCards = page.locator(
      '[data-testid^="article-card-"], [data-testid^="article-featured-"]',
    );
    const emptyState = page.getByText("Belum ada artikel. Segera periksa kembali!");

    await expect(articleCards.first().or(emptyState)).toBeVisible({
      timeout: 20_000,
    });
  });

  test("lazy wave 2 API fires after scroll to editorial section", async ({
    page,
    isMobile,
  }) => {
    test.skip(
      isMobile,
      "Mobile viewport preloads wave 2 via IntersectionObserver rootMargin",
    );

    let editorialRequested = false;
    page.on("request", (req) => {
      if (req.url().includes("/api/home/categories-editorial")) {
        editorialRequested = true;
      }
    });

    await page.waitForResponse(
      (res) => res.url().includes("/api/home/feed") && res.ok(),
      { timeout: 20_000 },
    );
    expect(editorialRequested).toBe(false);

    await page
      .getByTestId("home-sentinel-categories-editorial")
      .scrollIntoViewIfNeeded();

    await page.waitForResponse(
      (res) => res.url().includes("/api/home/categories-editorial"),
      { timeout: 20_000 },
    );
    expect(editorialRequested).toBe(true);
  });

  test("categories editorial section loads after scroll", async ({ page }) => {
    await page
      .getByTestId("home-sentinel-categories-editorial")
      .scrollIntoViewIfNeeded();

    await expect(
      page
        .locator('[data-testid^="editorial-featured-"]')
        .first()
        .or(page.getByText("Gagal memuat kategori editorial.")),
    ).toBeVisible({ timeout: 40_000 });
  });

  test("engagement section loads after scroll to bottom", async ({ page }) => {
    await page
      .getByTestId("home-sentinel-engagement")
      .scrollIntoViewIfNeeded();

    await expect(page.getByTestId("home-engagement-loading")).toBeHidden({
      timeout: 25_000,
    });

    await expect(
      page
        .getByTestId("home-engagement-section")
        .or(page.getByText("Gagal memuat polling dan peringkat.")),
    ).toBeVisible();
  });

  test("admin API rejects unauthenticated requests", async ({ request }) => {
    const res = await request.get("/api/admin/stats");
    expect(res.status()).toBe(403);
  });

  test("no horizontal overflow on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByTestId("homepage")).toBeVisible();

    const hasOverflow = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1
      );
    });

    expect(hasOverflow).toBe(false);
  });
});
