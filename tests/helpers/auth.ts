import { createClerkClient } from "@clerk/backend";
import {
  CLERK_TEST_ACCOUNTS,
  type ClerkTestRole,
} from "../fixtures/clerk-accounts";

const tokenCache = new Map<Exclude<ClerkTestRole, "guest">, string>();

function isJwtExpired(jwt: string, skewSeconds = 60): boolean {
  try {
    const payload = JSON.parse(
      Buffer.from(jwt.split(".")[1] ?? "", "base64url").toString("utf8"),
    ) as { exp?: number };
    if (!payload.exp) return false;
    return Date.now() / 1000 >= payload.exp - skewSeconds;
  } catch {
    return true;
  }
}

export function isClerkAuthConfigured(): boolean {
  return Boolean(process.env.CLERK_SECRET_KEY?.trim());
}

/** Align portal DB roles with Clerk test fixtures (idempotent). */
export async function ensureClerkTestAccountRoles(): Promise<void> {
  if (!process.env.DATABASE_URL?.trim()) return;

  const { db } = await import("@/lib/db");
  const fixes: Array<{ email: string; role: "USER" | "CONTRIBUTOR" | "ADMIN" }> = [
    { email: CLERK_TEST_ACCOUNTS.USER.email, role: "USER" },
    { email: CLERK_TEST_ACCOUNTS.CONTRIBUTOR.email, role: "CONTRIBUTOR" },
    { email: CLERK_TEST_ACCOUNTS.ADMIN.email, role: "ADMIN" },
  ];

  for (const { email, role } of fixes) {
    await db.user.updateMany({
      where: { email },
      data: { role },
    });
  }
}

/** Ensure a Clerk dev test account exists (creates on miss). Returns Clerk user id. */
async function ensureClerkTestUser(
  clerk: ReturnType<typeof createClerkClient>,
  email: string,
  username: string,
): Promise<string | null> {
  const existing = await clerk.users.getUserList({
    emailAddress: [email],
    limit: 1,
  });
  if (existing.data[0]) return existing.data[0].id;

  try {
    const created = await clerk.users.createUser({
      emailAddress: [email],
      username,
      skipPasswordChecks: true,
      skipPasswordRequirement: true,
    });
    console.log(`✅ Created Clerk test user: ${email} (${created.id})`);
    return created.id;
  } catch (error) {
    console.warn(
      `Clerk test user create failed for ${email}:`,
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}

/** Mint a Clerk session JWT for integration API calls (cached per role). */
export async function getClerkSessionToken(
  role: Exclude<ClerkTestRole, "guest">,
): Promise<string | null> {
  const cached = tokenCache.get(role);
  if (cached && !isJwtExpired(cached)) return cached;
  if (cached) tokenCache.delete(role);

  const secretKey = process.env.CLERK_SECRET_KEY?.trim();
  if (!secretKey) return null;

  const account = CLERK_TEST_ACCOUNTS[role];
  const clerk = createClerkClient({ secretKey });

  try {
    const userId = await ensureClerkTestUser(clerk, account.email, account.username);
    if (!userId) return null;

    const session = await clerk.sessions.createSession({ userId });
    // Default session JWT — do not pass a named template (e.g. "session" → 404).
    const tokenResult = await clerk.sessions.getToken(session.id);
    const jwt = tokenResult?.jwt;
    if (!jwt) return null;

    tokenCache.set(role, jwt);
    return jwt;
  } catch (error) {
    console.warn(
      `Clerk session token unavailable for ${role}:`,
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
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
