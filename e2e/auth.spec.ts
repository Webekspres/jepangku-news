import { test, expect } from "@playwright/test";
import { expectGuestRedirectToSignIn } from "./helpers/fixtures";

test.describe("Auth", () => {
  test("sign-in page renders Clerk form shell", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByTestId("sign-in-page")).toBeVisible();
  });

  test("sign-up page renders Clerk form shell", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.getByTestId("sign-up-page")).toBeVisible();
  });

  test("legacy /login redirects to Clerk sign-in", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByTestId("sign-in-page")).toBeVisible();
  });

  test("legacy /register redirects to Clerk sign-up", async ({ page }) => {
    await page.goto("/register");
    await expect(page).toHaveURL(/\/sign-up/);
    await expect(page.getByTestId("sign-up-page")).toBeVisible();
  });

  test("auth APIs reject guest and deprecated local login", async ({
    request,
  }) => {
    const me = await request.get("/api/auth/me");
    expect(me.status()).toBe(401);

    const login = await request.post("/api/auth/login");
    expect(login.status()).toBe(410);

    const register = await request.post("/api/auth/register");
    expect(register.status()).toBe(410);
  });

  test("protected user routes redirect guest to sign-in", async ({ page }) => {
    await expectGuestRedirectToSignIn(page, "/profile");
    await expectGuestRedirectToSignIn(page, "/profile/edit");
    await expectGuestRedirectToSignIn(page, "/bookmarks");
    await expectGuestRedirectToSignIn(page, "/my-articles");
  });
});
