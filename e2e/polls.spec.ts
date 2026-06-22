import { test, expect } from "@playwright/test";
import { fetchFirstPollSlug } from "./helpers/fixtures";

test.describe("Polls", () => {
  test("poll list page loads", async ({ page }) => {
    await page.goto("/polls");
    await expect(page.getByTestId("poll-list-page")).toBeVisible();
  });

  test("public polls API returns active poll envelope", async ({ request }) => {
    const res = await request.get("/api/polls?limit=1&status=ACTIVE");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty("polls");
    expect(data).toHaveProperty("total");
    expect(Array.isArray(data.polls)).toBe(true);
  });

  test("poll detail shows questions when content exists", async ({
    page,
    request,
  }) => {
    const slug = await fetchFirstPollSlug(request);
    test.skip(!slug, "No active polls in database");

    await page.goto(`/polls/${slug}`);
    await expect(page.getByTestId("poll-detail-page")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("back-to-polls")).toBeVisible();

    await expect(
      page
        .getByTestId("poll-question-0")
        .or(page.getByTestId("poll-completed-badge")),
    ).toBeVisible();
  });

  test("poll vote API requires authentication", async ({ request }) => {
    const slug = await fetchFirstPollSlug(request);
    test.skip(!slug, "No active polls in database");

    const res = await request.post(`/api/polls/${slug}/vote`, {
      data: { votes: [] },
    });
    expect(res.status()).toBe(401);
  });

  test("poll list navigates to detail via card link", async ({
    page,
    request,
  }) => {
    const slug = await fetchFirstPollSlug(request);
    test.skip(!slug, "No active polls in database");

    await page.goto("/polls");
    const card = page.getByTestId(`poll-card-${slug}`);
    await expect(card).toBeVisible({ timeout: 20_000 });
    await card.scrollIntoViewIfNeeded();
    await Promise.all([
      page.waitForURL(new RegExp(`/polls/${slug}`), { timeout: 20_000 }),
      card.click(),
    ]);
    await expect(page.getByTestId("poll-detail-page")).toBeVisible();
  });
});
