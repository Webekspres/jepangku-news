import { test, expect } from "@playwright/test";
import { fetchFirstQuizSlug } from "./helpers/fixtures";

test.describe("Quizzes", () => {
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
});
