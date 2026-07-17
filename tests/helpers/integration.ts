import { expect } from "bun:test";
import type { ClerkTestRole } from "../fixtures/clerk-accounts";
import { CLERK_TEST_ACCOUNTS } from "../fixtures/clerk-accounts";
import { preloadClerkTokens, isClerkAuthConfigured, ensureClerkTestAccountRoles } from "./auth";
import { createApiClient } from "./api-client";
import { getNewsBaseUrl, isNewsServerUp } from "./server";

export type IntegrationContext = {
  baseUrl: string;
  serverUp: boolean;
  authAvailable: boolean;
  tokens: Partial<Record<Exclude<ClerkTestRole, "guest">, string>>;
};

let sharedContext: IntegrationContext | null = null;

export function resetIntegrationContext(): void {
  sharedContext = null;
}

export async function setupIntegration(): Promise<IntegrationContext> {
  const baseUrl = getNewsBaseUrl();

  if (!sharedContext) {
    const serverUp = await isNewsServerUp(baseUrl);
    if (!serverUp && !process.env.CI) {
      console.warn(
        `⚠️  Integration tests need a running server at ${baseUrl} (\`bun run dev:test\`)`,
      );
    }
    sharedContext = {
      baseUrl,
      serverUp,
      authAvailable: false,
      tokens: {},
    };
  }

  if (sharedContext.serverUp && isClerkAuthConfigured()) {
    // Avoid re-minting when this worker already has all role tokens.
    const hasAllRoles =
      Boolean(sharedContext.tokens.USER) &&
      Boolean(sharedContext.tokens.CONTRIBUTOR) &&
      Boolean(sharedContext.tokens.ADMIN);
    if (!hasAllRoles) {
      await ensureClerkTestAccountRoles();
      const tokens = await preloadClerkTokens();
      sharedContext.tokens = { ...sharedContext.tokens, ...tokens };
      sharedContext.authAvailable = Object.keys(sharedContext.tokens).length > 0;
    } else {
      sharedContext.authAvailable = true;
    }
    if (!sharedContext.authAvailable && !process.env.CI) {
      console.warn(
        "⚠️  Authenticated integration tests skipped — set CLERK_SECRET_KEY and seed test users",
      );
    }
  }

  return sharedContext;
}

/** Force-refresh Clerk JWTs (e.g. after long admin test suite). */
export async function refreshIntegrationTokens(
  ctx: IntegrationContext,
): Promise<void> {
  if (!ctx.serverUp || !isClerkAuthConfigured()) return;
  const { clearClerkTokenCache } = await import("./auth");
  clearClerkTokenCache();
  ctx.tokens = await preloadClerkTokens();
  ctx.authAvailable = Object.keys(ctx.tokens).length > 0;
}

/** Returns true when the test should be skipped (not failed). */
export function skipUnless(
  ctx: IntegrationContext,
  requirement: "server" | "auth",
): boolean {
  if (!ctx.serverUp) {
    if (process.env.CI) expect(ctx.serverUp).toBe(true);
    return true;
  }
  if (requirement === "auth" && !ctx.authAvailable) {
    if (process.env.CI) expect(ctx.authAvailable).toBe(true);
    return true;
  }
  return false;
}

export function clientFor(
  ctx: IntegrationContext,
  role: ClerkTestRole = "guest",
) {
  if (role === "guest") return createApiClient(null);
  const token = ctx.tokens[role];
  if (!token) {
    throw new Error(`No Clerk token for role ${role} — create ${CLERK_TEST_ACCOUNTS[role as Exclude<ClerkTestRole, "guest">]?.email ?? role} in Clerk dev`);
  }
  return createApiClient(token);
}

export function hasRoleToken(
  ctx: IntegrationContext,
  role: Exclude<ClerkTestRole, "guest">,
): boolean {
  return Boolean(ctx.tokens[role]);
}
