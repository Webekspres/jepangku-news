import { test, expect } from "@playwright/test";
import {
  E2E_AUTH_SKIP_REASON,
  isE2EAuthAvailable,
  signInAs,
} from "./helpers/clerk-auth";
import { fetchFirstPollSlug } from "./helpers/fixtures";

test.describe("Polls — public", () => {
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

  test("poll list API returns only ACTIVE polls", async ({ request }) => {
    const res = await request.get("/api/polls?status=ACTIVE&limit=5");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    for (const poll of data.polls ?? []) {
      expect(poll.status).toBe("ACTIVE");
    }
  });

  test("poll list shows active poll cards when content exists", async ({
    page,
    request,
  }) => {
    const slug = await fetchFirstPollSlug(request);
    test.skip(!slug, "No active polls in database");

    await page.goto("/polls");
    await expect(page.getByTestId(`poll-card-${slug}`)).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId(`poll-card-${slug}`)).toContainText("POIN");
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

  test("poll detail API exposes multi-question structure", async ({
    request,
  }) => {
    const slug = await fetchFirstPollSlug(request);
    test.skip(!slug, "No active polls in database");

    const res = await request.get(`/api/polls/${slug}`);
    expect(res.ok()).toBeTruthy();
    const poll = await res.json();
    expect(Array.isArray(poll.questions)).toBe(true);
    expect(poll.questions.length).toBeGreaterThan(0);
    for (const q of poll.questions) {
      expect(Array.isArray(q.options)).toBe(true);
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    }
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

test.describe("Polls — admin", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "ADMIN");
  });

  test("admin polls page loads with create button", async ({ page }) => {
    await page.goto("/admin/polls");
    await expect(page.getByTestId("admin-polls-page")).toBeVisible({
      timeout: 25_000,
    });
    await expect(page.getByTestId("create-poll-btn")).toBeVisible();
    await expect(page.getByTestId("poll-status-filter-ACTIVE")).toBeVisible();
  });

  test("admin poll status filter switches list", async ({ page }) => {
    await page.goto("/admin/polls");
    await expect(page.getByTestId("poll-status-filter-DRAFT")).toBeVisible({
      timeout: 25_000,
    });
    const responsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/admin/polls?status=DRAFT") &&
        res.status() === 200,
    );
    await page.getByTestId("poll-status-filter-DRAFT").click();
    await responsePromise;
    await expect(page.getByTestId("admin-polls-page")).toBeVisible();
  });

  test("admin create poll page has builder and option image fields", async ({
    page,
  }) => {
    await page.goto("/admin/polls/create");
    await expect(page.getByTestId("admin-create-poll-page")).toBeVisible({
      timeout: 25_000,
    });
    await expect(page.getByTestId("poll-title-input")).toBeEditable();
    await expect(page.getByTestId("question-card-0")).toBeVisible();
    await expect(page.getByTestId("poll-thumbnail-input")).toBeVisible();
    await expect(page.getByTestId("question-image-0")).toBeVisible();
    await expect(page.getByTestId("option-image-0-0")).toBeVisible();

    await page.getByTestId("add-question-btn").click();
    await expect(page.getByTestId("question-card-1")).toBeVisible();
  });

  test("admin poll analytics API returns vote breakdown", async ({ page }) => {
    await page.goto("/admin/polls");
    await expect(page.getByTestId("admin-polls-page")).toBeVisible({
      timeout: 25_000,
    });

    const listRes = await page.request.get("/api/admin/polls?status=ACTIVE");
    expect(listRes.ok()).toBeTruthy();
    const polls = await listRes.json();
    const pollId = polls[0]?.id;
    test.skip(!pollId, "No polls for analytics");

    const res = await page.request.get(`/api/admin/analytics/polls/${pollId}`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty("totalVotes");
    expect(data).toHaveProperty("uniqueVoters");
    expect(Array.isArray(data.questionStats)).toBe(true);
    if (data.questionStats[0]) {
      expect(Array.isArray(data.questionStats[0].options)).toBe(true);
    }
    expect(data.poll).toHaveProperty("title");
  });
});
