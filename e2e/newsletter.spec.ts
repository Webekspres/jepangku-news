import { test, expect } from "@playwright/test";
import {
  E2E_AUTH_SKIP_REASON,
  isE2EAuthAvailable,
  signInAs,
} from "./helpers/clerk-auth";
import { scrollToFooter } from "./helpers/fixtures";

test.describe("Newsletter — footer subscribe", () => {
  test("footer newsletter form is visible on homepage", async ({ page }) => {
    await page.goto("/");
    await scrollToFooter(page);
    await expect(page.getByTestId("newsletter-form")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("newsletter-email-input")).toBeEditable();
    await expect(page.getByTestId("newsletter-submit")).toBeVisible();
  });

  test("footer subscribe shows validation for empty email", async ({ page }) => {
    await page.goto("/");
    await scrollToFooter(page);
    const input = page.getByTestId("newsletter-email-input");
    await input.fill("");
    await page.getByTestId("newsletter-submit").click();
    await expect(input).toBeVisible();
    await expect(page.getByTestId("newsletter-success")).toHaveCount(0);
  });

  test("§16.5 footer social links are visible with valid external hrefs", async ({
    page,
    request,
  }) => {
    const apiRes = await request.get("/api/social-links");
    expect(apiRes.ok()).toBeTruthy();
    const { links } = (await apiRes.json()) as {
      links: { id: string; href: string }[];
    };
    test.skip(!links?.length, "No enabled social links in database");

    await page.goto("/");
    await scrollToFooter(page);
    await expect(page.getByTestId("footer-social-links")).toBeVisible({
      timeout: 15_000,
    });

    for (const link of links) {
      const anchor = page.getByTestId(`footer-social-${link.id}`);
      await expect(anchor).toBeVisible();
      await expect(anchor).toHaveAttribute("href", link.href);
      await expect(anchor).toHaveAttribute("target", "_blank");
    }
  });

  test("POST /api/newsletter/subscribe rejects empty email", async ({ request }) => {
    const res = await request.post("/api/newsletter/subscribe", { data: { email: "" } });
    expect(res.status()).toBe(400);
  });

  test("POST /api/newsletter/subscribe accepts valid guest email", async ({
    request,
  }) => {
    const email = `e2e+${Date.now()}@jepangku.com`;
    const res = await request.post("/api/newsletter/subscribe", { data: { email } });
    expect([200, 201, 429]).toContain(res.status());
    if (res.ok()) {
      const data = await res.json();
      expect(data).toHaveProperty("ok", true);
    }
  });

  test("duplicate subscribe is idempotent", async ({ request }) => {
    const email = `e2e-dup+${Date.now()}@jepangku.com`;
    const first = await request.post("/api/newsletter/subscribe", { data: { email } });
    const second = await request.post("/api/newsletter/subscribe", { data: { email } });
    expect(first.ok()).toBeTruthy();
    expect(second.ok()).toBeTruthy();
  });

  test("footer subscribe succeeds with unique email", async ({ page }) => {
    await page.goto("/");
    await scrollToFooter(page);
    const email = `e2e-ui+${Date.now()}@jepangku.com`;
    await page.getByTestId("newsletter-email-input").fill(email);
    await page.getByTestId("newsletter-submit").click();
    await expect(page.getByTestId("newsletter-success")).toBeVisible({
      timeout: 15_000,
    });
  });
});

test.describe("Newsletter — unsubscribe", () => {
  test("unsubscribe page without token shows invalid link message", async ({ page }) => {
    await page.goto("/newsletter/unsubscribe");
    await expect(page.getByText(/tidak valid|token hilang/i)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("unsubscribe with token requires login for guest", async ({ page }) => {
    await page.goto("/newsletter/unsubscribe?token=0000000000000000000000000000000000000000000000000000000000000000");
    await expect(page.getByText(/login diperlukan|masuk/i)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("GET /api/newsletter/subscription returns 401 for guest without token", async ({
    request,
  }) => {
    const res = await request.get("/api/newsletter/subscription");
    expect(res.status()).toBe(401);
  });

  test("DELETE /api/newsletter/subscription returns 401 for guest", async ({
    request,
  }) => {
    const res = await request.delete("/api/newsletter/subscription");
    expect(res.status()).toBe(401);
  });

  test("GET subscription with invalid token returns error", async ({ request }) => {
    const res = await request.get(
      "/api/newsletter/subscription?token=invalid-e2e-token",
    );
    expect([400, 401, 404]).toContain(res.status());
  });

  test.beforeEach(async ({ page }) => {
    test.skip(!isE2EAuthAvailable(), E2E_AUTH_SKIP_REASON);
    await signInAs(page, "USER");
  });

  test("authenticated user sees unsubscribe page shell with bogus token", async ({
    page,
  }) => {
    await page.goto(
      "/newsletter/unsubscribe?token=0000000000000000000000000000000000000000000000000000000000000000",
    );
    await expect(
      page.getByText(/berhenti berlangganan|gagal memuat|tidak valid/i),
    ).toBeVisible({ timeout: 20_000 });
  });
});
