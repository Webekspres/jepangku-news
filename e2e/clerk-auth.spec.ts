import { test, expect } from "@playwright/test";
import {
  CLERK_TEST_ACCOUNTS,
  CLERK_TEST_OTP,
} from "../tests/fixtures/clerk-accounts";
import {
  E2E_AUTH_SKIP_REASON,
  canSignInAs,
  isE2EAuthAvailable,
  signInAs,
} from "./helpers/clerk-auth";

test.describe("Clerk E2E auth fixture", () => {
  test("test accounts are documented with clerk_test OTP", () => {
    expect(CLERK_TEST_OTP).toBe("424242");
    expect(CLERK_TEST_ACCOUNTS.USER.email).toContain("+clerk_test@");
    expect(CLERK_TEST_ACCOUNTS.CONTRIBUTOR.email).toContain("+clerk_test@");
    expect(CLERK_TEST_ACCOUNTS.ADMIN.email).toContain("+clerk_test@");
  });

  test("USER sign-in exposes authenticated navbar state", async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "USER");
    await page.goto("/");
    await expect(page.getByTestId("homepage")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("navbar-notifications-button")).toBeVisible({
      timeout: 20_000,
    });
  });

  test("CONTRIBUTOR sign-in can reach submit-article", async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    test.skip(!(await canSignInAs("CONTRIBUTOR")), "CONTRIBUTOR Clerk test user missing");
    await signInAs(page, "CONTRIBUTOR");
    await page.goto("/submit-article");
    await expect(page.getByTestId("submit-article-page")).toBeVisible({
      timeout: 20_000,
    });
  });

  test("ADMIN sign-in can reach admin dashboard", async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "ADMIN");
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin/, { timeout: 20_000 });
  });
});
