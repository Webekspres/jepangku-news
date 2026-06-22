import { test, expect, type Page } from "@playwright/test";
import {
  E2E_AUTH_SKIP_REASON,
  isE2EAuthAvailable,
  signInAs,
} from "./helpers/clerk-auth";
import { expectGuestRedirectToSignIn } from "./helpers/fixtures";

test.describe("§15 Admin — dashboard & monitoring (guest)", () => {
  test("/admin redirects guest to sign-in", async ({ page }) => {
    await expectGuestRedirectToSignIn(page, "/admin");
  });

  test("/admin/activity-log redirects guest to sign-in", async ({ page }) => {
    await expectGuestRedirectToSignIn(page, "/admin/activity-log");
  });

  test("/admin/users redirects guest to sign-in", async ({ page }) => {
    await expectGuestRedirectToSignIn(page, "/admin/users");
  });
});

test.describe("§15 Admin — dashboard & monitoring (ADMIN)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "ADMIN");
  });

  async function waitForAdminShell(page: Page) {
    await page.goto("/admin");
    await expect(page.getByTestId("admin-shell")).toBeVisible({
      timeout: 45_000,
    });
  }

  test("15.1 Dashboard — stats · quick actions", async ({ page }) => {
    await waitForAdminShell(page);
    await expect(page.getByTestId("admin-dashboard")).toBeVisible({
      timeout: 25_000,
    });

    await expect(page.getByTestId("action-create-article")).toBeVisible();
    await expect(page.getByTestId("action-review")).toBeVisible();
    await expect(page.getByTestId("action-create-quiz")).toBeVisible();
    await expect(page.getByTestId("action-create-poll")).toBeVisible();

    await expect(page.getByTestId("dashboard-charts")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("chart-user-growth")).toBeVisible();
  });

  test("15.3 Activity log — audit artikel & kontributor", async ({ page }) => {
    await waitForAdminShell(page);
    await page.goto("/admin/activity-log");
    await expect(page.getByTestId("admin-activity-log")).toBeVisible({
      timeout: 25_000,
    });

    await expect(page.getByText("Pertumbuhan Pengguna")).toBeVisible();
    await expect(page.getByText("Total Pengguna")).toBeVisible();

    const toolbar = page.getByTestId("admin-activity-log");
    await expect(toolbar.getByRole("button", { name: "Artikel" })).toBeVisible();
    await expect(toolbar.getByRole("button", { name: "Kontributor" })).toBeVisible();
  });

  test("15.4 Grafik registrasi — growth chart", async ({ page }) => {
    const res = await page.request.get(
      "/api/admin/users/growth?period=30d&granularity=day",
    );
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data.series)).toBe(true);
    expect(data.series.length).toBeGreaterThan(0);

    await waitForAdminShell(page);
    await page.goto("/admin/activity-log");
    await expect(page.getByTestId("admin-activity-log")).toBeVisible({
      timeout: 25_000,
    });
    await expect(page.getByText("Total Pengguna")).toBeVisible({ timeout: 20_000 });
    await expect(
      page
        .getByTestId("admin-trend-chart")
        .or(page.getByText("Belum ada data untuk ditampilkan.")),
    ).toBeVisible({ timeout: 20_000 });
  });

  test("15.5 Manajemen user — list · detail · role", async ({ page }) => {
    await waitForAdminShell(page);
    await page.goto("/admin/users");
    await expect(page.getByTestId("admin-users-page")).toBeVisible({
      timeout: 25_000,
    });
    await expect(page.getByTestId("stat-total-pengguna")).toBeVisible();
    await expect(page.getByTestId("role-filter-all")).toBeVisible();

    const firstRow = page.locator('[data-testid^="user-row-"]').first();
    await expect(firstRow).toBeVisible({ timeout: 15_000 });
    const viewLink = firstRow.locator('[data-testid^="view-user-"]');
    await viewLink.click();

    await expect(page.getByTestId("admin-user-detail-page")).toBeVisible({
      timeout: 25_000,
    });
  });
});
