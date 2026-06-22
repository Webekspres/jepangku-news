import { test, expect } from "@playwright/test";
import {
  E2E_AUTH_SKIP_REASON,
  isE2EAuthAvailable,
  signInAs,
} from "./helpers/clerk-auth";
import { fetchFirstQuizSlug } from "./helpers/fixtures";

test.describe("Quizzes — public", () => {
  test("quiz list page loads", async ({ page }) => {
    await page.goto("/quizzes");
    await expect(page.getByTestId("quiz-list-page")).toBeVisible();
  });

  test("public quizzes API returns active quiz envelope", async ({
    request,
  }) => {
    const res = await request.get("/api/quizzes?limit=1&status=ACTIVE");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty("quizzes");
    expect(data).toHaveProperty("total");
    expect(Array.isArray(data.quizzes)).toBe(true);
  });

  test("quiz list API status filter returns only ACTIVE quizzes", async ({
    request,
  }) => {
    const res = await request.get("/api/quizzes?status=ACTIVE&limit=5");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    for (const quiz of data.quizzes ?? []) {
      expect(quiz.status).toBe("ACTIVE");
    }
  });

  test("quiz list shows cards when quizzes exist", async ({
    page,
    request,
  }) => {
    const slug = await fetchFirstQuizSlug(request);
    test.skip(!slug, "No active quizzes in database");

    await page.goto("/quizzes");
    await expect(page.getByTestId(`quiz-card-${slug}`)).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId(`quiz-card-${slug}`)).toContainText("POIN");
  });

  test("quiz detail shows questions or login prompt when content exists", async ({
    page,
    request,
  }) => {
    const slug = await fetchFirstQuizSlug(request);
    test.skip(!slug, "No active quizzes in database");

    await page.goto(`/quizzes/${slug}`);
    await expect(page.getByTestId("quiz-detail-page")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("quiz-breadcrumb")).toBeVisible();

    await expect(
      page
        .getByTestId("question-0")
        .or(page.getByTestId("quiz-login-prompt"))
        .or(page.getByTestId("quiz-completed-badge"))
        .or(page.getByTestId("quiz-result")),
    ).toBeVisible();
  });

  test("quiz detail has no timer when quiz has no time limit", async ({
    page,
    request,
  }) => {
    const slug = await fetchFirstQuizSlug(request);
    test.skip(!slug, "No active quizzes in database");

    const detailRes = await request.get(`/api/quizzes/${slug}`);
    expect(detailRes.ok()).toBeTruthy();
    const quiz = await detailRes.json();
    expect(quiz).not.toHaveProperty("timeLimit");

    await page.goto(`/quizzes/${slug}`);
    await expect(page.getByTestId("quiz-detail-page")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("quiz-timer")).toHaveCount(0);
  });

  test("quiz attempt API requires authentication", async ({ request }) => {
    const slug = await fetchFirstQuizSlug(request);
    test.skip(!slug, "No active quizzes in database");

    const res = await request.post(`/api/quizzes/${slug}/attempt`, {
      data: { answers: [] },
    });
    expect(res.status()).toBe(401);
  });

  test("quiz list navigates to detail via card link", async ({
    page,
    request,
  }) => {
    const slug = await fetchFirstQuizSlug(request);
    test.skip(!slug, "No active quizzes in database");

    await page.goto("/quizzes");
    const card = page.getByTestId(`quiz-card-${slug}`);
    await expect(card).toBeVisible({ timeout: 20_000 });
    await card.scrollIntoViewIfNeeded();
    await Promise.all([
      page.waitForURL(new RegExp(`/quizzes/${slug}`), { timeout: 20_000 }),
      card.click(),
    ]);
    await expect(page.getByTestId("quiz-detail-page")).toBeVisible();
  });

  test("quiz leaderboard supports monthly and all-time tabs", async ({
    page,
    request,
  }) => {
    const slug = await fetchFirstQuizSlug(request);
    test.skip(!slug, "No active quizzes in database");

    await page.goto(`/quizzes/${slug}`);
    await expect(page.getByTestId("quiz-leaderboard")).toBeVisible({
      timeout: 20_000,
    });

    await page.getByTestId("quiz-lb-period-sepanjang-waktu").click();
    const allTimeRes = await request.get(
      `/api/quizzes/${slug}/leaderboard?period=sepanjang-waktu`,
    );
    expect(allTimeRes.ok()).toBeTruthy();
    const allTime = await allTimeRes.json();
    expect(allTime.period).toBe("sepanjang-waktu");

    await page.getByTestId("quiz-lb-period-monthly").click();
    const monthlyRes = await request.get(
      `/api/quizzes/${slug}/leaderboard?period=monthly`,
    );
    expect(monthlyRes.ok()).toBeTruthy();
    const monthly = await monthlyRes.json();
    expect(monthly.period).toBe("monthly");
  });
});

test.describe("Quizzes — admin", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "ADMIN");
  });

  test("admin quizzes page loads with filter and create button", async ({
    page,
  }) => {
    await page.goto("/admin/quizzes");
    await expect(page.getByTestId("admin-quizzes-page")).toBeVisible({
      timeout: 25_000,
    });
    await expect(page.getByTestId("create-quiz-btn")).toBeVisible();
    await expect(page.getByTestId("quiz-filter-ACTIVE")).toBeVisible();
  });

  test("admin quiz filter switches status", async ({ page }) => {
    await page.goto("/admin/quizzes");
    await expect(page.getByTestId("quiz-filter-DRAFT")).toBeVisible({
      timeout: 25_000,
    });
    const responsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/admin/quizzes?status=DRAFT") &&
        res.status() === 200,
    );
    await page.getByTestId("quiz-filter-DRAFT").click();
    await responsePromise;
    await expect(page.getByTestId("admin-quizzes-page")).toBeVisible();
  });

  test("admin create quiz page has multi-question builder and image fields", async ({
    page,
  }) => {
    await page.goto("/admin/quizzes/create");
    await expect(page.getByTestId("admin-create-quiz-page")).toBeVisible({
      timeout: 25_000,
    });
    await expect(page.getByTestId("quiz-title-input")).toBeEditable();
    await expect(page.getByTestId("question-form-0")).toBeVisible();
    await expect(page.getByTestId("quiz-thumbnail-input")).toBeVisible();
    await expect(page.getByTestId("question-image-0")).toBeVisible();
    await expect(page.getByTestId("option-image-0-0")).toBeVisible();

    await page.getByTestId("add-question-btn").click();
    await expect(page.getByTestId("question-form-1")).toBeVisible();
  });

  test("admin quiz analytics API returns attempt and pass rate", async ({
    page,
  }) => {
    await page.goto("/admin/quizzes");
    await expect(page.getByTestId("admin-quizzes-page")).toBeVisible({
      timeout: 25_000,
    });

    const listRes = await page.request.get("/api/admin/quizzes?status=ACTIVE");
    expect(listRes.ok()).toBeTruthy();
    const quizzes = await listRes.json();
    const quizId = quizzes[0]?.id;
    test.skip(!quizId, "No quizzes for analytics");

    const res = await page.request.get(`/api/admin/analytics/quizzes/${quizId}`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty("totalAttempts");
    expect(data).toHaveProperty("passRate");
    expect(data.quiz).toHaveProperty("title");
  });
});
