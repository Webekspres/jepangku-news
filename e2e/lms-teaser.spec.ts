import { test, expect } from "@playwright/test";

test.describe("§13 LMS teaser — homepage", () => {
  test("hero Kursus quick link opens external LMS with UTM", async ({ page }) => {
    await page.goto("/");
    const kursusLink = page.getByTestId("hero-quick-link-kursus");
    await expect(kursusLink).toBeVisible();
    await expect(kursusLink).toHaveAttribute("target", "_blank");
    await expect(kursusLink).toHaveAttribute("rel", "noopener noreferrer");

    const href = await kursusLink.getAttribute("href");
    expect(href).toBeTruthy();
    const url = new URL(href!);
    expect(url.hostname).toMatch(/kursus\.jepangku\.com$/);
    expect(url.pathname).toBe("/kursus");
    expect(url.searchParams.get("utm_source")).toBe("jepangku.com");
    expect(url.searchParams.get("utm_medium")).toBe("homepage");
  });

  test("LMS section loads placeholder or live course cards after scroll", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    await page.getByTestId("home-sentinel-lms").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("lms-loading")).toBeHidden({
      timeout: 25_000,
    });
    await expect(page.getByTestId("home-lms-teaser")).toBeVisible({
      timeout: 25_000,
    });

    const res = await request.get("/api/home/lms-teaser");
    expect(res.ok()).toBeTruthy();
    const data = (await res.json()) as {
      source: "live" | "placeholder";
      courses: { slug: string }[];
      catalogUrl: string;
    };

    if (data.source === "placeholder" || data.courses.length === 0) {
      await expect(page.getByTestId("lms-coming-soon")).toBeVisible();
      await expect(page.getByTestId("lms-placeholder-cta")).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Katalog Kursus Segera Hadir" }),
      ).toBeVisible();
    } else {
      const first = data.courses[0]!;
      await expect(page.getByTestId(`lms-course-card-${first.slug}`)).toBeVisible();
      await expect(page.getByTestId("lms-catalog-cta")).toBeVisible();
    }

    const catalog = new URL(data.catalogUrl);
    expect(catalog.searchParams.get("utm_source")).toBe("jepangku.com");
  });
});
