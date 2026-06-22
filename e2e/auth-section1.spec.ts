import { test, expect } from "@playwright/test";
import { expectGuestRedirectToSignIn } from "./helpers/fixtures";
import {
  E2E_AUTH_SKIP_REASON,
  isE2EAuthAvailable,
  signInAs,
} from "./helpers/clerk-auth";

test.describe("§1 Autentikasi & akun — E2E checklist", () => {
  test("1.1 — Clerk sign-in exposes email/password identifier field", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByTestId("sign-in-page")).toBeVisible();
    await expect(
      page.locator('input[name="identifier"], input[type="email"]').first(),
    ).toBeVisible({ timeout: 20_000 });
  });

  test("1.1 — Clerk sign-in exposes OAuth / social sign-in", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByTestId("sign-in-page")).toBeVisible();
    const social = page.locator(
      '.cl-socialButtons, [class*="socialButtons"], button:has-text("Google"), button:has-text("Continue with")',
    );
    await expect(social.first()).toBeVisible({ timeout: 20_000 });
  });

  test("1.1 — protected route preserves redirect_url for post-login return", async ({
    page,
  }) => {
    await page.goto("/bookmarks");
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 20_000 });
    expect(page.url()).toMatch(/redirect_url=%2Fbookmarks/);
  });

  test("1.2 — sign-up page renders Clerk registration shell", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.getByTestId("sign-up-page")).toBeVisible();
    await expect(
      page.locator('input[name="emailAddress"], input[type="email"]').first(),
    ).toBeVisible({ timeout: 20_000 });
  });

  test("1.2 — sign-up exposes email verification step (Clerk UI)", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.getByTestId("sign-up-page")).toBeVisible();
    const continueBtn = page.getByRole("button", { name: /continue/i });
    await expect(continueBtn.first()).toBeVisible({ timeout: 20_000 });
  });

  test("1.5 — legacy /login redirects to Clerk sign-in", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByTestId("sign-in-page")).toBeVisible();
  });

  test("1.5 — legacy /register redirects to Clerk sign-up", async ({ page }) => {
    await page.goto("/register");
    await expect(page).toHaveURL(/\/sign-up/);
    await expect(page.getByTestId("sign-up-page")).toBeVisible();
  });

  test("1.7 — guest user routes redirect to sign-in", async ({ page }) => {
    await expectGuestRedirectToSignIn(page, "/profile");
    await expectGuestRedirectToSignIn(page, "/bookmarks");
    await expectGuestRedirectToSignIn(page, "/my-articles");
    await expectGuestRedirectToSignIn(page, "/submit-article");
  });

  test("1.3 — logout clears session and shows guest navbar", async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "USER");
    await page.goto("/");
    await expect(page.getByTestId("user-menu-button")).toBeVisible({ timeout: 20_000 });
    await page.getByTestId("user-menu-button").click();
    await page.getByTestId("menu-logout").click();
    await expect(page.getByTestId("navbar-login-btn")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("user-menu-button")).not.toBeVisible();
  });

  test("1.1 — redirect after login reaches originally requested route", async ({
    page,
  }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await page.goto("/bookmarks");
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 20_000 });
    await signInAs(page, "USER");
    await page.goto("/bookmarks");
    await expect(page).toHaveURL(/\/bookmarks/, { timeout: 20_000 });
    await expect(page.getByTestId("bookmarks-page")).toBeVisible({ timeout: 20_000 });
  });

  test("1.8 — non-admin USER is denied admin shell", async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "USER");
    await page.goto("/admin");
    await expect(page.getByTestId("admin-shell")).not.toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\//);
  });

  test("1.8 — ADMIN can access admin dashboard", async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "ADMIN");
    await page.goto("/admin");
    await expect(page.getByTestId("admin-shell")).toBeVisible({ timeout: 20_000 });
  });
});
