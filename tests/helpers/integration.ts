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

export async function setupIntegration(): Promise<IntegrationContext> {
  if (sharedContext) return sharedContext;

  const baseUrl = getNewsBaseUrl();
  const serverUp = await isNewsServerUp(baseUrl);
  if (serverUp && isClerkAuthConfigured()) {
    await ensureClerkTestAccountRoles();
  }
  const tokens = serverUp ? await preloadClerkTokens() : {};
  const authAvailable =
    isClerkAuthConfigured() && Object.keys(tokens).length > 0;

  if (!serverUp && !process.env.CI) {
    console.warn(
      `⚠️  Integration tests need a running server at ${baseUrl} (\`bun dev\`)`,
    );
  }
  if (serverUp && !authAvailable && !process.env.CI) {
    console.warn(
      "⚠️  Authenticated integration tests skipped — set CLERK_SECRET_KEY and seed test users",
    );
  }

  sharedContext = { baseUrl, serverUp, authAvailable, tokens };
  return sharedContext;
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
