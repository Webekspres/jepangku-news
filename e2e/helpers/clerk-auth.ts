import { clerk } from "@clerk/testing/playwright";
import { expect, type BrowserContext, type Page } from "@playwright/test";
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

/** True when Clerk user exists and a session token can be minted. */
export async function canSignInAs(role: AuthedRole): Promise<boolean> {
  if (!isClerkAuthConfigured()) return false;
  return Boolean(await getClerkSessionToken(role));
}

/** Inject Clerk session JWT as __session cookie (API-only fast path). */
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
      url: baseURL.endsWith("/") ? baseURL : `${baseURL}/`,
    },
  ]);
  return true;
}

async function hasAuthenticatedNavbar(page: Page, timeout = 30_000): Promise<boolean> {
  const marker = page
    .getByTestId("user-menu-button")
    .or(page.getByTestId("navbar-notifications-button"))
    .or(page.getByTestId("user-points-display"));
  try {
    await expect(marker.first()).toBeVisible({ timeout });
    return true;
  } catch {
    return false;
  }
}

async function waitForAuthenticatedUi(page: Page, timeout = 30_000): Promise<void> {
  const ok = await hasAuthenticatedNavbar(page, timeout);
  if (!ok) {
    throw new Error("Authenticated navbar did not appear after sign-in");
  }
}

/**
 * Sign in via Clerk testing helpers (ticket or email_code), then verify navbar.
 * Falls back to UI + test OTP only when programmatic sign-in cannot complete.
 */
export async function signInAs(page: Page, role: AuthedRole): Promise<void> {
  const email = CLERK_TEST_ACCOUNTS[role].email;

  await page.goto("/");
  await clerk.loaded({ page }).catch(() => undefined);

  if (await hasAuthenticatedNavbar(page, 3_000)) return;

  try {
    await clerk.signIn({ page, emailAddress: email });
  } catch {
    // Ticket flow may throw while Clerk session is still being established.
  }

  await page.goto("/");
  if (await hasAuthenticatedNavbar(page, 35_000)) return;

  try {
    await clerk.signIn({
      page,
      signInParams: { strategy: "email_code", identifier: email },
    });
  } catch {
    // email_code may be disabled when password is the only first factor.
  }

  await page.goto("/");
  if (await hasAuthenticatedNavbar(page, 20_000)) return;

  await clerkSignInUI(page, role);
  await waitForAuthenticatedUi(page, 30_000);
}

/** UI sign-in for +clerk_test@ addresses (OTP 424242). */
export async function clerkSignInUI(page: Page, role: AuthedRole): Promise<void> {
  const email = CLERK_TEST_ACCOUNTS[role].email;

  await page.goto("/");
  if (await hasAuthenticatedNavbar(page, 3_000)) return;

  await page.goto("/sign-in");
  await page.getByTestId("sign-in-page").waitFor({ state: "visible", timeout: 20_000 });

  const emailInput = page.locator('input[name="identifier"]');
  if (!(await emailInput.isVisible({ timeout: 5_000 }).catch(() => false))) {
    if (await hasAuthenticatedNavbar(page, 5_000)) return;
    await emailInput.waitFor({ state: "visible", timeout: 20_000 });
  }
  await emailInput.fill(email);

  await page
    .locator('button.cl-formButtonPrimary, button[data-localization-key="formButtonPrimary"]')
    .first()
    .click();

  const passwordInput = page.locator('input[name="password"]');
  if (await passwordInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
    const altMethod = page.getByRole("link", {
      name: /use another method|gunakan metode lain/i,
    });
    if (await altMethod.isVisible().catch(() => false)) {
      await altMethod.click();
      await page.waitForURL(/\/sign-in\/factor/, { timeout: 15_000 }).catch(() => undefined);
      const emailCode = page.getByRole("button", {
        name: /email code|kode email|verification code|email verification/i,
      });
      if (await emailCode.first().isVisible({ timeout: 10_000 }).catch(() => false)) {
        await emailCode.first().click();
      }
    }
  }

  const codeInput = page
    .getByRole("textbox", { name: /verification code|kode verifikasi/i })
    .or(page.locator('input[name="code"]'))
    .or(page.locator('input[inputmode="numeric"]'))
    .first();
  await codeInput.waitFor({ state: "visible", timeout: 25_000 });
  await codeInput.fill(CLERK_TEST_OTP);

  const verifyBtn = page.locator(
    'button.cl-formButtonPrimary, button[data-localization-key="formButtonPrimary"]',
  );
  if (await verifyBtn.first().isVisible()) {
    await verifyBtn.first().click();
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
