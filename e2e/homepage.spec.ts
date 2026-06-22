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

  test("wave 1 shows featured carousel or fallback and trending panel", async ({
    page,
  }) => {
    await expect(page.getByTestId("homepage-loading")).toBeHidden({
      timeout: 20_000,
    });

    await expect(
      page
        .locator(
          '[data-testid^="article-featured-"], [data-testid^="article-card-"]',
        )
        .first()
        .or(
          page.getByText("Tidak ada artikel pilihan utama tersedia."),
        ),
    ).toBeVisible();

    await expect(
      page
        .getByTestId("trending-panel")
        .or(page.getByTestId("trending-empty")),
    ).toBeVisible();
  });

  test("wave 3 TV failure does not block reactions section", async ({
    page,
  }) => {
    await page.route("**/api/home/tv", (route) =>
      route.fulfill({ status: 500, body: '{"error":"forced"}' }),
    );

    await page.goto("/");
    await expect(page.getByTestId("homepage")).toBeVisible();

    await page.getByTestId("home-sentinel-tv").scrollIntoViewIfNeeded();
    await expect(page.getByText("Gagal memuat Jepangku TV.")).toBeVisible({
      timeout: 20_000,
    });

    await page.getByTestId("home-sentinel-reactions").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("home-reactions-loading")).toBeHidden({
      timeout: 25_000,
    });
    await expect(
      page
        .getByTestId("home-reactions-section")
        .or(page.getByText("Gagal memuat reaksi komunitas.")),
    ).toBeVisible();
    await expect(page.getByTestId("homepage")).toBeVisible();
  });

  test("lazy wave 4 API fires after scroll to engagement section", async ({
    page,
    isMobile,
  }) => {
    test.skip(
      isMobile,
      "Mobile viewport preloads wave 4 via IntersectionObserver rootMargin",
    );

    let engagementRequested = false;
    page.on("request", (req) => {
      if (req.url().includes("/api/home/engagement")) {
        engagementRequested = true;
      }
    });

    await page.waitForResponse(
      (res) => res.url().includes("/api/home/feed") && res.ok(),
      { timeout: 20_000 },
    );
    expect(engagementRequested).toBe(false);

    await page
      .getByTestId("home-sentinel-engagement")
      .scrollIntoViewIfNeeded();

    await page.waitForResponse(
      (res) => res.url().includes("/api/home/engagement"),
      { timeout: 20_000 },
    );
    expect(engagementRequested).toBe(true);
  });

  test("lazy section skeletons use stable min-height", async ({ page }) => {
    await page.route("**/api/home/categories-editorial", async (route) => {
      await new Promise((r) => setTimeout(r, 800));
      await route.continue();
    });

    await page.goto("/");
    await page
      .getByTestId("home-sentinel-categories-editorial")
      .scrollIntoViewIfNeeded();

    const skeleton = page.getByTestId("editorial-loading");
    await expect(skeleton).toBeVisible({ timeout: 10_000 });
    const minHeight = await skeleton.evaluate(
      (el) => parseInt(el.style.minHeight, 10) || 0,
    );
    expect(minHeight).toBeGreaterThanOrEqual(720);
  });

  test("empty states across sections do not crash homepage", async ({
    page,
  }) => {
    await expect(page.getByTestId("homepage-loading")).toBeHidden({
      timeout: 20_000,
    });

    const sectionIds = [
      "feed",
      "hero",
      "today",
      "categories-editorial",
      "tv",
      "ads",
      "lms",
      "reactions",
      "engagement",
    ] as const;

    for (const id of sectionIds) {
      await expect(page.getByTestId(`home-section-${id}`)).toBeAttached();
    }

    await page.getByTestId("home-sentinel-engagement").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("home-engagement-loading")).toBeHidden({
      timeout: 25_000,
    });
    await expect(page.getByTestId("homepage")).toBeVisible();
  });
});

test.describe("Explore & trending — §12 discovery", () => {
  test("explore page shows popular tags and categories", async ({ page }) => {
    await page.goto("/explore");
    await expect(page.getByTestId("explore-page")).toBeVisible();
    await expect(page.getByTestId("explore-trending-cta")).toBeVisible();

    await expect(
      page
        .getByTestId("popular-tags")
        .or(page.getByTestId("popular-tags-empty"))
        .or(page.getByTestId("popular-tags-loading")),
    ).toBeVisible({ timeout: 20_000 });

    await expect(
      page.locator('[data-testid^="explore-category-"]').first(),
    ).toBeVisible({ timeout: 20_000 });
  });

  test("trending page loads articles or empty state", async ({ page }) => {
    await page.goto("/trending");
    await expect(page.getByTestId("trending-page")).toBeVisible();

    await expect(
      page
        .locator('[data-testid^="article-card-"]')
        .first()
        .or(page.getByTestId("trending-empty")),
    ).toBeVisible({ timeout: 20_000 });
  });
});
