import { test, expect } from "@playwright/test";
import {
  fetchFirstAuthorUsername,
} from "./helpers/fixtures";
import {
  E2E_AUTH_SKIP_REASON,
  isE2EAuthAvailable,
  signInAs,
} from "./helpers/clerk-auth";

test.describe("§2 Profil & data user — E2E checklist", () => {
  test("2.1 — /profile shows name, username, avatar, and points", async ({
    page,
  }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "USER");
    await page.goto("/profile");
    await expect(page.getByTestId("profile-page")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("h1").first()).not.toBeEmpty();
    await expect(page.getByText(/^@/)).toBeVisible();
    await expect(page.getByTestId("profile-avatar")).toBeVisible();
    await expect(page.getByText("TOTAL POIN")).toBeVisible();
  });

  test("2.2 — edit profile updates display name", async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "USER");
    await page.goto("/profile/edit");
    await expect(page.getByTestId("edit-profile-page")).toBeVisible({
      timeout: 20_000,
    });

    const displayInput = page.getByTestId("input-display-name");
    const original = await displayInput.inputValue();
    const updated = `QA ${Date.now()}`;
    await displayInput.fill(updated);
    await page.getByTestId("save-profile-btn").click();
    await expect(page.getByTestId("profile-page")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("h1").first()).toContainText(updated);

    await page.getByTestId("edit-profile-btn").click();
    await page.getByTestId("input-display-name").fill(original);
    await page.getByTestId("save-profile-btn").click();
    await expect(page.getByTestId("profile-page")).toBeVisible({ timeout: 20_000 });
  });

  test("2.2 — edit profile validates empty name", async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "USER");
    await page.goto("/profile/edit");
    await expect(page.getByTestId("edit-profile-page")).toBeVisible({
      timeout: 20_000,
    });
    await page.getByTestId("input-name").fill("");
    await page.getByTestId("save-profile-btn").click();
    await expect(page.getByTestId("edit-profile-error")).toBeVisible();
  });

  test("2.3 — avatar upload opens crop modal", async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "USER");
    await page.goto("/profile/edit");
    await expect(page.getByTestId("upload-avatar-btn")).toBeVisible({
      timeout: 20_000,
    });

    const buffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    );
    await page.getByTestId("avatar-file-input").setInputFiles({
      name: "avatar.png",
      mimeType: "image/png",
      buffer,
    });
    await expect(page.getByTestId("avatar-crop-modal")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("2.3 — avatar appears in navbar after profile load", async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "USER");
    await page.goto("/profile");
    await expect(page.getByTestId("profile-avatar")).toBeVisible({ timeout: 20_000 });
    await page.goto("/");
    await expect(page.getByTestId("user-menu-button")).toBeVisible({ timeout: 20_000 });
  });

  test("2.4 — username field shows cooldown hint when locked", async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "USER");
    await page.goto("/profile/edit");
    await expect(page.getByTestId("input-username")).toBeVisible({ timeout: 20_000 });
    const usernameInput = page.getByTestId("input-username");
    const isDisabled = await usernameInput.isDisabled();
    if (isDisabled) {
      await expect(page.getByText(/hari lagi|cooldown/i)).toBeVisible();
    } else {
      await expect(usernameInput).toBeEnabled();
    }
  });

  test("2.5 — public profile shows article stats and list", async ({
    page,
    request,
  }) => {
    const username = await fetchFirstAuthorUsername(request);
    test.skip(!username, "No published article authors in database");

    const api = await request.get(`/api/profile/${username}`);
    expect(api.ok()).toBeTruthy();
    const data = (await api.json()) as {
      profile: { stats: { publishedArticles: number }; isContributor: boolean };
      articles: unknown[];
    };

    await page.goto(`/profile/${username}`);
    await expect(page.getByTestId("public-profile-page")).toBeVisible({
      timeout: 20_000,
    });

    if (data.profile.isContributor && data.profile.stats.publishedArticles > 0) {
      await expect(page.getByTestId("profile-articles-section")).toBeVisible();
      await expect(page.getByTestId("profile-articles-section")).toContainText(
        String(data.profile.stats.publishedArticles),
      );
    }
  });

  test("2.6 — unknown public profile returns not found UI", async ({ page }) => {
    await page.goto("/profile/nonexistent_user_xyz");
    await expect(page.getByTestId("profile-not-found")).toBeVisible({
      timeout: 20_000,
    });
  });

  test("2.7 — gamification balance visible in navbar", async ({ page, request }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "USER");

    const gamRes = await request.get("/api/user/gamification");
    test.skip(gamRes.status() === 401, "Gamification requires auth session in request context");

    await page.goto("/");
    const pointsEl = page.getByTestId("user-points-display");
    await expect(pointsEl).toBeVisible({ timeout: 20_000 });

    if (gamRes.ok()) {
      const { totalPoints } = (await gamRes.json()) as { totalPoints: number };
      await expect(pointsEl).toContainText(String(totalPoints));
    }
  });
});
