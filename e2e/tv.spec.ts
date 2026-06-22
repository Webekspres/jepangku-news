import { test, expect } from "@playwright/test";
import {
  E2E_AUTH_SKIP_REASON,
  isE2EAuthAvailable,
  signInAs,
} from "./helpers/clerk-auth";
import { fetchFirstVideoSlug } from "./helpers/fixtures";

test.describe("TV — archive list", () => {
  test("TV archive page loads", async ({ page }) => {
    await page.goto("/tv");
    await expect(page.getByTestId("tv-archive-page")).toBeVisible({
      timeout: 20_000,
    });
  });

  test("TV archive shows video grid cards when videos exist", async ({
    page,
    request,
  }) => {
    const slug = await fetchFirstVideoSlug(request);
    test.skip(!slug, "No published videos in database");

    await page.goto("/tv");
    await expect(page.getByTestId("tv-archive-page")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId(`video-card-${slug}`)).toBeVisible({
      timeout: 20_000,
    });
  });

  test("homepage TV API loads featured and sidebar on scroll", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    await page.getByTestId("home-sentinel-tv").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("tv-loading")).toBeHidden({
      timeout: 25_000,
    });

    const res = await request.get("/api/home/tv");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty("featuredVideo");
    expect(Array.isArray(data.sidebarVideos)).toBe(true);
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

  test("GET /api/videos returns published videos envelope", async ({ request }) => {
    const res = await request.get("/api/videos?limit=5");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty("videos");
    expect(data).toHaveProperty("total");
    expect(Array.isArray(data.videos)).toBe(true);
  });

  test("GET /api/videos/[slug] returns complete public video fields", async ({
    request,
  }) => {
    const slug = await fetchFirstVideoSlug(request);
    test.skip(!slug, "No published videos in database");

    const res = await request.get(`/api/videos/${slug}`);
    expect(res.ok()).toBeTruthy();
    const video = await res.json();
    for (const field of [
      "id",
      "title",
      "slug",
      "youtubeId",
      "thumbnailUrl",
      "viewCount",
      "isFeatured",
    ]) {
      expect(video).toHaveProperty(field);
    }
    expect(video.slug).toBe(slug);
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

test.describe("TV — admin CRUD", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "ADMIN");
  });

  test("admin videos page loads with create button", async ({ page }) => {
    await page.goto("/admin/videos");
    await expect(page.getByTestId("admin-videos-page")).toBeVisible({
      timeout: 25_000,
    });
    await expect(page.getByTestId("create-video-btn")).toBeVisible();
  });

  test("admin create video page has form fields", async ({ page }) => {
    await page.goto("/admin/videos/create");
    await expect(page.getByTestId("admin-create-video-page")).toBeVisible({
      timeout: 25_000,
    });
    await expect(page.getByTestId("video-title-input")).toBeEditable();
    await expect(page.getByTestId("video-youtube-input")).toBeEditable();
    await expect(page.getByTestId("create-video-submit")).toBeVisible();
  });

  test("admin video CRUD API create edit delete draft", async ({ page }) => {
    const title = `E2E Video ${Date.now()}`;
    const createRes = await page.request.post("/api/admin/videos", {
      data: {
        title,
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        status: "DRAFT",
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const { id } = await createRes.json();

    const patchRes = await page.request.patch(`/api/admin/videos/${id}`, {
      data: { title: `${title} (edited)` },
    });
    expect(patchRes.ok()).toBeTruthy();

    const deleteRes = await page.request.delete(`/api/admin/videos/${id}`);
    expect(deleteRes.ok()).toBeTruthy();
  });
});
