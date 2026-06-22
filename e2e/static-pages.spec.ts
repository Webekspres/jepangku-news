import { test, expect } from "@playwright/test";
import { INFO_PAGE_SLUGS } from "../lib/info-pages";
import { NAV_CATEGORIES } from "../components/navbar/nav-config";
import { scrollToFooter } from "./helpers/fixtures";

test.describe("§18 — Halaman statis", () => {
  test("18.1 about page renders CMS content", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByTestId("info-page-about")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("info-page-content")).not.toBeEmpty();
  });

  test("18.2 contact page shows contact links", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByTestId("info-page-contact")).toBeVisible({
      timeout: 15_000,
    });
    const content = page.getByTestId("info-page-content");
    await expect(content.locator('a[href^="mailto:"]').first()).toBeVisible();
  });

  for (const slug of [
    "advertise",
    "media-partner",
    "career",
    "internship",
    "privacy-policy",
    "terms-of-service",
    "disclaimer",
  ] as const) {
    test(`18.x ${slug} page loads published content`, async ({ page }) => {
      await page.goto(`/${slug}`);
      await expect(page.getByTestId(`info-page-${slug}`)).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.getByTestId("info-page-content")).not.toBeEmpty();
    });
  }

  test("info page sidebar lists all static pages", async ({ page }) => {
    await page.goto("/about");
    const sidebar = page.getByTestId("info-page-sidebar");
    await expect(sidebar).toBeVisible({ timeout: 15_000 });
    for (const slug of INFO_PAGE_SLUGS) {
      await expect(sidebar.getByTestId(`info-nav-${slug}`)).toBeVisible();
    }
  });
});

test.describe("§18.10 — Navbar sidebar mobile drawer", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByTestId("homepage")).toBeVisible();
  });

  test("sidebar toggle opens drawer with category links", async ({ page }) => {
    await page.getByTestId("navbar-sidebar-toggle").click();
    await expect(page.getByTestId("navbar-sidebar-panel")).toBeVisible({
      timeout: 10_000,
    });

    for (const cat of NAV_CATEGORIES) {
      await expect(
        page.getByTestId(`navbar-sidebar-category-${cat.slug}`),
      ).toBeVisible();
    }
  });

  test("sidebar closes via close button", async ({ page }) => {
    await page.getByTestId("navbar-sidebar-toggle").click();
    await expect(page.getByTestId("navbar-sidebar-panel")).toBeVisible();
    await page.getByTestId("navbar-sidebar-close").click();
    await expect(page.getByTestId("navbar-sidebar-panel")).toBeHidden({
      timeout: 10_000,
    });
  });
});

test.describe("§18.11 — Footer jelajahi & newsletter", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await scrollToFooter(page);
  });

  test("footer jelajahi links point to discovery routes", async ({ page }) => {
    const footer = page.getByTestId("main-footer");
    await expect(footer.getByRole("link", { name: "Artikel" })).toHaveAttribute(
      "href",
      "/articles",
    );
    await expect(footer.getByRole("link", { name: "Kuis" })).toHaveAttribute(
      "href",
      "/quizzes",
    );
    await expect(footer.getByRole("link", { name: "Polling" })).toHaveAttribute(
      "href",
      "/polls",
    );
    await expect(
      footer.getByRole("link", { name: "Peringkat" }),
    ).toHaveAttribute("href", "/leaderboard");
  });

  test("footer newsletter form is visible", async ({ page }) => {
    await expect(page.getByTestId("newsletter-form")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("newsletter-email-input")).toBeEditable();
    await expect(page.getByTestId("newsletter-submit")).toBeVisible();
  });
});
