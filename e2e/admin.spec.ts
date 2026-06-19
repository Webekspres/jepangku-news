import { test, expect } from "@playwright/test";
import { expectGuestRedirectToSignIn } from "./helpers/fixtures";

test.describe("Admin smoke", () => {
  test("admin routes redirect guest to sign-in", async ({ page }) => {
    await expectGuestRedirectToSignIn(page, "/admin");
    await expectGuestRedirectToSignIn(page, "/admin/articles");
    await expectGuestRedirectToSignIn(page, "/admin/quizzes");
    await expectGuestRedirectToSignIn(page, "/admin/polls");
  });

  test("admin APIs reject unauthenticated requests", async ({ request }) => {
    const endpoints = [
      "/api/admin/stats",
      "/api/admin/articles/pending",
      "/api/admin/articles",
      "/api/admin/quizzes",
      "/api/admin/polls",
      "/api/admin/users",
    ];

    for (const path of endpoints) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(403);
    }
  });

  test("admin mutation APIs reject unauthenticated requests", async ({
    request,
  }) => {
    const createArticle = await request.post("/api/admin/articles", {
      data: { title: "E2E smoke" },
    });
    expect(createArticle.status()).toBe(403);

    const exportArticles = await request.get("/api/admin/articles/export?format=csv");
    expect(exportArticles.status()).toBe(403);
  });
});
