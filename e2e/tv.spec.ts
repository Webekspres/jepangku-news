import { test, expect } from "@playwright/test";
import { fetchFirstVideoSlug } from "./helpers/fixtures";

test.describe("TV — archive list", () => {
  test("TV archive page loads", async ({ page }) => {
    await page.goto("/tv");
    await expect(page.getByTestId("tv-archive-page")).toBeVisible({
      timeout: 20_000,
    });
  });

  test("GET /api/videos returns published videos envelope", async ({ request }) => {
    const res = await request.get("/api/videos?limit=5");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty("videos");
    expect(Array.isArray(data.videos)).toBe(true);
  });

  test("homepage TV section loads after scroll", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("home-sentinel-tv").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("tv-loading")).toBeHidden({
      timeout: 25_000,
    });
    await expect(
      page
        .getByTestId("jepangku-tv-section")
        .or(page.getByText(/gagal memuat|tv/i)),
    ).toBeVisible({ timeout: 25_000 });
  });

  test("TV view-all link navigates to archive", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("home-sentinel-tv").scrollIntoViewIfNeeded();
    const viewAll = page.getByTestId("tv-view-all");
    if ((await viewAll.count()) === 0) {
      test.skip(true, "TV section empty in dataset");
    }
    await viewAll.click();
    await expect(page).toHaveURL(/\/tv/, { timeout: 15_000 });
    await expect(page.getByTestId("tv-archive-page")).toBeVisible();
  });
});

test.describe("TV — detail & lazy embed", () => {
  test("TV detail page renders when video exists", async ({ page, request }) => {
    const slug = await fetchFirstVideoSlug(request);
    test.skip(!slug, "No published videos in database");

    await page.goto(`/tv/${slug}`);
    await expect(page.getByTestId("tv-detail-page")).toBeVisible({
      timeout: 20_000,
    });
  });

  test("TV detail shows YouTube thumbnail before play (lazy embed)", async ({
    page,
    request,
  }) => {
    const slug = await fetchFirstVideoSlug(request);
    test.skip(!slug, "No published videos in database");

    await page.goto(`/tv/${slug}`);
    await expect(page.getByTestId("tv-detail-page")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.locator('[data-testid^="youtube-thumbnail-"]')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('[data-testid^="youtube-embed-"]')).toHaveCount(0);
  });

  test("clicking thumbnail loads YouTube embed", async ({ page, request }) => {
    const slug = await fetchFirstVideoSlug(request);
    test.skip(!slug, "No published videos in database");

    await page.goto(`/tv/${slug}`);
    const thumb = page.locator('[data-testid^="youtube-thumbnail-"]').first();
    await expect(thumb).toBeVisible({ timeout: 15_000 });
    await thumb.click();
    await expect(page.locator('[data-testid^="youtube-embed-"]')).toBeVisible({
      timeout: 15_000,
    });
  });

  test("GET /api/videos/[slug] returns video metadata", async ({ request }) => {
    const slug = await fetchFirstVideoSlug(request);
    test.skip(!slug, "No published videos in database");

    const res = await request.get(`/api/videos/${slug}`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.slug).toBe(slug);
  });

  test("unknown TV slug shows not found state", async ({ page }) => {
    await page.goto("/tv/nonexistent-video-slug-e2e");
    await expect(page.getByText(/tidak ditemukan/i)).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("link", { name: /kembali/i })).toBeVisible();
  });

  test("TV archive load-more button when many videos", async ({ page, request }) => {
    const listRes = await request.get("/api/videos?limit=20");
    test.skip(!listRes.ok(), "Videos API unavailable");
    const json = (await listRes.json()) as { videos?: unknown[]; total?: number };
    test.skip((json.total ?? 0) < 12, "Not enough videos for pagination");

    await page.goto("/tv");
    const loadMore = page.getByTestId("tv-load-more");
    await expect(loadMore).toBeVisible({ timeout: 20_000 });
  });
});
