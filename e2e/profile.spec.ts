import { test, expect } from "@playwright/test";
import {
  expectGuestRedirectToSignIn,
  fetchFirstAuthorUsername,
} from "./helpers/fixtures";

test.describe("Profile", () => {
  test("private profile routes redirect guest to sign-in", async ({ page }) => {
    await expectGuestRedirectToSignIn(page, "/profile");
    await expectGuestRedirectToSignIn(page, "/profile/edit");
  });

  test("public profile API validates username and handles missing user", async ({
    request,
  }) => {
    const invalid = await request.get("/api/profile/INVALID!!");
    expect(invalid.status()).toBe(400);

    const missing = await request.get("/api/profile/nonexistent_user_xyz");
    expect(missing.status()).toBe(404);
  });

  test("public profile page renders for known author", async ({
    page,
    request,
  }) => {
    const username = await fetchFirstAuthorUsername(request);
    test.skip(!username, "No article authors with username in database");

    const api = await request.get(`/api/profile/${username}`);
    expect(api.ok()).toBeTruthy();

    await page.goto(`/profile/${username}`);
    await expect(page.getByTestId("public-profile-page")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("profile-username")).toContainText(
      `@${username}`,
    );
  });

  test("unknown public profile shows not found state", async ({ page }) => {
    await page.goto("/profile/nonexistent_user_xyz");
    await expect(page.getByTestId("profile-not-found")).toBeVisible({
      timeout: 20_000,
    });
  });
});
