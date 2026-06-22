import { createClerkClient } from "@clerk/backend";
import {
  CLERK_TEST_ACCOUNTS,
  type ClerkTestRole,
} from "../fixtures/clerk-accounts";

const tokenCache = new Map<Exclude<ClerkTestRole, "guest">, string>();

export function isClerkAuthConfigured(): boolean {
  return Boolean(process.env.CLERK_SECRET_KEY?.trim());
}

/** Mint a Clerk session JWT for integration API calls (cached per role). */
export async function getClerkSessionToken(
  role: Exclude<ClerkTestRole, "guest">,
): Promise<string | null> {
  const cached = tokenCache.get(role);
  if (cached) return cached;

  const secretKey = process.env.CLERK_SECRET_KEY?.trim();
  if (!secretKey) return null;

  const account = CLERK_TEST_ACCOUNTS[role];
  const clerk = createClerkClient({ secretKey });

  const users = await clerk.users.getUserList({
    emailAddress: [account.email],
    limit: 1,
  });
  const user = users.data[0];
  if (!user) return null;

  const session = await clerk.sessions.createSession({ userId: user.id });
  const tokenResult = await clerk.sessions.getToken(session.id, "session");
  const jwt = tokenResult?.jwt;
  if (!jwt) return null;

  tokenCache.set(role, jwt);
  return jwt;
}

/** Preload session tokens for USER, CONTRIBUTOR, and ADMIN. */
export async function preloadClerkTokens(): Promise<
  Partial<Record<Exclude<ClerkTestRole, "guest">, string>>
> {
  const tokens: Partial<Record<Exclude<ClerkTestRole, "guest">, string>> = {};
  if (!isClerkAuthConfigured()) return tokens;

  for (const role of ["USER", "CONTRIBUTOR", "ADMIN"] as const) {
    const token = await getClerkSessionToken(role);
    if (token) tokens[role] = token;
  }
  return tokens;
}

export function clearClerkTokenCache(): void {
  tokenCache.clear();
}
