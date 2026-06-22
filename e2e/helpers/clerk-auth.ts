import type { BrowserContext, Page } from "@playwright/test";
import {
  CLERK_TEST_ACCOUNTS,
  CLERK_TEST_OTP,
  type ClerkTestRole,
} from "../../tests/fixtures/clerk-accounts";
import {
  getClerkSessionToken,
  isClerkAuthConfigured,
} from "../../tests/helpers/auth";

export type AuthedRole = Exclude<ClerkTestRole, "guest">;

export function isE2EAuthAvailable(): boolean {
  return isClerkAuthConfigured();
}

export const E2E_AUTH_SKIP_REASON =
  "Clerk E2E auth not configured (CLERK_SECRET_KEY + seeded test users)";

function getBaseUrl(): string {
  return process.env.NEWS_BASE_URL ?? "http://localhost:3000";
}

function getCookieDomain(baseURL: string): string {
  try {
    return new URL(baseURL).hostname;
  } catch {
    return "localhost";
  }
}

/** Inject Clerk session JWT as __session cookie (fast, reliable for CI). */
export async function injectClerkSession(
  context: BrowserContext,
  role: AuthedRole,
  baseURL = getBaseUrl(),
): Promise<boolean> {
  const token = await getClerkSessionToken(role);
  if (!token) return false;

  await context.addCookies([
    {
      name: "__session",
      value: token,
      domain: getCookieDomain(baseURL),
      path: "/",
      httpOnly: true,
      secure: baseURL.startsWith("https"),
      sameSite: "Lax",
    },
  ]);
  return true;
}

/** Sign in via cookie injection, falling back to Clerk UI + test OTP. */
export async function signInAs(page: Page, role: AuthedRole): Promise<void> {
  const baseURL = getBaseUrl();
  const injected = await injectClerkSession(page.context(), role, baseURL);
  if (injected) {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    return;
  }
  await clerkSignInUI(page, role);
}

/** UI sign-in for +clerk_test@ addresses (OTP 424242). */
export async function clerkSignInUI(page: Page, role: AuthedRole): Promise<void> {
  const email = CLERK_TEST_ACCOUNTS[role].email;
  await page.goto("/sign-in");
  await page.getByTestId("sign-in-page").waitFor({ state: "visible", timeout: 20_000 });

  const emailInput = page.locator('input[name="identifier"]');
  await emailInput.waitFor({ state: "visible", timeout: 20_000 });
  await emailInput.fill(email);

  await page.getByRole("button", { name: /continue|lanjut/i }).click();

  const codeInput = page
    .locator('input[name="code"]')
    .or(page.locator('input[inputmode="numeric"]'))
    .first();
  await codeInput.waitFor({ state: "visible", timeout: 20_000 });
  await codeInput.fill(CLERK_TEST_OTP);

  const verifyBtn = page.getByRole("button", { name: /continue|lanjut|verify/i });
  if (await verifyBtn.isVisible()) {
    await verifyBtn.click();
  }

  await page.waitForURL((url) => !url.pathname.includes("/sign-in"), {
    timeout: 30_000,
  });
}

/** Authenticated API request context using Clerk JWT. */
export async function authedRequestHeaders(
  role: AuthedRole,
): Promise<Record<string, string> | null> {
  const token = await getClerkSessionToken(role);
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}
