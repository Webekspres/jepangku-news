import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
] as const;

async function assertNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const hasOverflow = await page.evaluate(() => {
    return (
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1
    );
  });
  expect(hasOverflow).toBe(false);
}

test.describe("Non-functional — compatibility", () => {
  for (const viewport of VIEWPORTS) {
    test(`no horizontal overflow on ${viewport.name} (${viewport.width}px)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");
      await expect(page.getByTestId("homepage")).toBeVisible();
      await assertNoHorizontalOverflow(page);
    });
  }
});

test.describe("Non-functional — reliability", () => {
  test("health endpoint returns ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.status).toBe("ok");
    expect(json.db).toBe("ok");
  });

  test("one failed home API does not break the rest of the homepage", async ({
    page,
  }) => {
    await page.route("**/api/home/reactions", (route) =>
      route.fulfill({ status: 500, body: "Internal Server Error" }),
    );

    await page.goto("/");
    await expect(page.getByTestId("homepage")).toBeVisible();
    await expect(page.getByTestId("hero-search-form")).toBeVisible();
    await expect(page.getByTestId("home-section-today")).toBeVisible();

    await page.getByTestId("home-sentinel-reactions").scrollIntoViewIfNeeded();
    await expect(
      page
        .getByTestId("home-reactions-section")
        .or(page.getByText("Gagal memuat reaksi komunitas.")),
    ).toBeVisible({ timeout: 25_000 });

    await expect(page.getByTestId("hero-search-input")).toBeEditable();
  });
});

test.describe("Non-functional — performance", () => {
  test("P2 featured LCP image uses fetchpriority high", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("homepage-loading")).toBeHidden({ timeout: 20_000 });

    const lcpImg = page.locator('img[fetchpriority="high"]').first();
    if ((await lcpImg.count()) === 0) {
      test.skip(true, "No priority featured image in dataset");
    }
    await expect(lcpImg).toBeVisible();
  });

  test("P3 wave 2 API not requested before scroll", async ({ page, isMobile }) => {
    test.skip(isMobile, "Mobile preloads wave 2 via IntersectionObserver rootMargin");

    let editorialRequested = false;
    page.on("request", (req) => {
      if (req.url().includes("/api/home/categories-editorial")) {
        editorialRequested = true;
      }
    });

    await page.goto("/");
    await page.waitForResponse(
      (res) => res.url().includes("/api/home/feed") && res.ok(),
      { timeout: 20_000 },
    );
    expect(editorialRequested).toBe(false);
  });

  test("P6 home feed API returns cache-control with s-maxage", async ({ request }) => {
    const res = await request.get("/api/home/feed");
    expect(res.ok()).toBeTruthy();
    const cache = res.headers()["cache-control"] ?? "";
    expect(cache).toContain("s-maxage");
    expect(cache).toContain("stale-while-revalidate");
  });

  test("P5 TV detail uses click-to-play YouTube embed", async ({ page, request }) => {
    const listRes = await request.get("/api/videos?limit=1");
    if (!listRes.ok()) {
      test.skip(true, "Videos API unavailable");
    }
    const json = (await listRes.json()) as { videos?: { slug: string }[] };
    const slug = json.videos?.[0]?.slug;
    if (!slug) {
      test.skip(true, "No published videos in dataset");
    }

    await page.goto(`/tv/${slug}`);
    await expect(page.getByTestId("tv-detail-page")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator(`[data-testid^="youtube-thumbnail-"]`)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator(`[data-testid^="youtube-embed-"]`)).toHaveCount(0);
  });
});

test.describe("Non-functional — security headers", () => {
  test("response includes X-Content-Type-Options nosniff", async ({ request }) => {
    const res = await request.get("/");
    const nosniff = res.headers()["x-content-type-options"];
    test.skip(!nosniff, "Custom headers require production build (next start)");
    expect(nosniff).toBe("nosniff");
  });
});

test.describe("Non-functional — accessibility", () => {
  test("hero search accepts keyboard input when focused", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("homepage")).toBeVisible();
    const search = page.getByTestId("hero-search-input");
    await search.focus();
    await expect(search).toBeFocused();
    await page.keyboard.type("nihongo");
    await expect(search).toHaveValue("nihongo");
  });

  test("featured carousel prev button is keyboard focusable", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("homepage-loading")).toBeHidden({ timeout: 20_000 });

    const prev = page.getByRole("button", { name: "Artikel sebelumnya" });
    if ((await prev.count()) === 0) {
      test.skip(true, "No featured carousel on this dataset");
    }

    await prev.focus();
    await expect(prev).toBeFocused();
  });

  test("featured carousel controls meet 44px touch target", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByTestId("homepage-loading")).toBeHidden({ timeout: 20_000 });

    const prev = page.getByRole("button", { name: "Artikel sebelumnya" });
    if ((await prev.count()) === 0) {
      test.skip(true, "No featured carousel on this dataset");
    }

    const box = await prev.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("search overlay uses inert when closed", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByTestId("navbar-search-overlay-root")).toHaveAttribute(
      "inert",
      "",
    );
  });

  test("A5 notification bell has accessible name", async ({ page }) => {
    await page.goto("/");
    const bell = page.getByRole("button", { name: /Notifikasi/i });
    if ((await bell.count()) === 0) {
      test.skip(true, "Notification bell hidden for guest");
    }
    await expect(bell.first()).toBeVisible();
  });
});

test.describe("Non-functional — browser smoke", () => {
  test("homepage loads primary sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("homepage")).toBeVisible();
    await expect(page.getByTestId("home-section-hero")).toBeVisible();
    await expect(page.getByTestId("home-section-today")).toBeVisible();
  });
});
