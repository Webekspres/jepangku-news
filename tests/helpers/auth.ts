import { createClerkClient } from "@clerk/backend";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import {
  CLERK_TEST_ACCOUNTS,
  type ClerkTestRole,
} from "../fixtures/clerk-accounts";

type AuthRole = Exclude<ClerkTestRole, "guest">;

const tokenCache = new Map<AuthRole, string>();
const userIdCache = new Map<string, string>();

/** Shared across `bun test --isolate` workers so we don't mint 3 JWTs per file. */
const SHARED_TOKEN_PATH = join(process.cwd(), ".tmp", "clerk-test-tokens.json");

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : String(error);
  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
      ? (error as { status: number }).status
      : null;
  return (
    status === 429 ||
    /too many requests|rate.?limit|429/i.test(message)
  );
}

async function withClerkRetry<T>(
  label: string,
  fn: () => Promise<T>,
  attempts = 6,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRateLimitError(error) || attempt === attempts) throw error;
      const delayMs = Math.min(30_000, 500 * 2 ** (attempt - 1));
      console.warn(
        `Clerk rate-limited during ${label} (attempt ${attempt}/${attempts}); retrying in ${delayMs}ms`,
      );
      await sleep(delayMs);
    }
  }
  throw lastError;
}

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

function readSharedTokenCache(): Partial<Record<AuthRole, string>> {
  try {
    if (!existsSync(SHARED_TOKEN_PATH)) return {};
    const raw = JSON.parse(readFileSync(SHARED_TOKEN_PATH, "utf8")) as Partial<
      Record<AuthRole, string>
    >;
    const valid: Partial<Record<AuthRole, string>> = {};
    for (const role of ["USER", "CONTRIBUTOR", "ADMIN"] as const) {
      const jwt = raw[role];
      if (jwt && !isJwtExpired(jwt)) {
        valid[role] = jwt;
        tokenCache.set(role, jwt);
      }
    }
    return valid;
  } catch {
    return {};
  }
}

function writeSharedTokenCache(tokens: Partial<Record<AuthRole, string>>): void {
  try {
    mkdirSync(join(process.cwd(), ".tmp"), { recursive: true });
    const merged = { ...readSharedTokenCache(), ...tokens };
    writeFileSync(SHARED_TOKEN_PATH, JSON.stringify(merged), "utf8");
  } catch (error) {
    console.warn(
      "Failed to persist Clerk test token cache:",
      error instanceof Error ? error.message : String(error),
    );
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
  const cached = userIdCache.get(email);
  if (cached) return cached;

  const existing = await withClerkRetry(`users.getUserList(${email})`, () =>
    clerk.users.getUserList({
      emailAddress: [email],
      limit: 1,
    }),
  );
  if (existing.data[0]) {
    userIdCache.set(email, existing.data[0].id);
    return existing.data[0].id;
  }

  try {
    const created = await withClerkRetry(`users.createUser(${email})`, () =>
      clerk.users.createUser({
        emailAddress: [email],
        username,
        skipPasswordChecks: true,
        skipPasswordRequirement: true,
      }),
    );
    console.log(`✅ Created Clerk test user: ${email} (${created.id})`);
    userIdCache.set(email, created.id);
    return created.id;
  } catch (error) {
    console.warn(
      `Clerk test user create failed for ${email}:`,
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}

async function mintSessionJwt(
  clerk: ReturnType<typeof createClerkClient>,
  userId: string,
  role: AuthRole,
): Promise<string | null> {
  // Prefer an existing active session to avoid createSession rate limits.
  const sessions = await withClerkRetry(`sessions.getSessionList(${role})`, () =>
    clerk.sessions.getSessionList({ userId, status: "active", limit: 5 }),
  );
  const existing = sessions.data[0];
  if (existing) {
    const tokenResult = await withClerkRetry(`sessions.getToken(${role})`, () =>
      clerk.sessions.getToken(existing.id),
    );
    if (tokenResult?.jwt) return tokenResult.jwt;
  }

  const session = await withClerkRetry(`sessions.createSession(${role})`, () =>
    clerk.sessions.createSession({ userId }),
  );
  const tokenResult = await withClerkRetry(`sessions.getToken(new ${role})`, () =>
    clerk.sessions.getToken(session.id),
  );
  return tokenResult?.jwt ?? null;
}

/** Mint a Clerk session JWT for integration API calls (cached per role). */
export async function getClerkSessionToken(role: AuthRole): Promise<string | null> {
  const cached = tokenCache.get(role);
  if (cached && !isJwtExpired(cached)) return cached;
  if (cached) tokenCache.delete(role);

  const shared = readSharedTokenCache();
  const sharedJwt = shared[role];
  if (sharedJwt) return sharedJwt;

  const secretKey = process.env.CLERK_SECRET_KEY?.trim();
  if (!secretKey) return null;

  const account = CLERK_TEST_ACCOUNTS[role];
  const clerk = createClerkClient({ secretKey });

  try {
    const userId = await ensureClerkTestUser(clerk, account.email, account.username);
    if (!userId) return null;

    const jwt = await mintSessionJwt(clerk, userId, role);
    if (!jwt) return null;

    tokenCache.set(role, jwt);
    writeSharedTokenCache({ [role]: jwt });
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
export async function preloadClerkTokens(): Promise<Partial<Record<AuthRole, string>>> {
  const tokens: Partial<Record<AuthRole, string>> = {};
  if (!isClerkAuthConfigured()) return tokens;

  const shared = readSharedTokenCache();
  Object.assign(tokens, shared);

  for (const role of ["USER", "CONTRIBUTOR", "ADMIN"] as const) {
    if (tokens[role]) continue;
    const token = await getClerkSessionToken(role);
    if (token) tokens[role] = token;
    // Small gap between roles reduces burst 429s when minting fresh tokens.
    if (!shared[role]) await sleep(250);
  }
  return tokens;
}

export function clearClerkTokenCache(): void {
  tokenCache.clear();
  userIdCache.clear();
  try {
    if (existsSync(SHARED_TOKEN_PATH)) {
      writeFileSync(SHARED_TOKEN_PATH, "{}", "utf8");
    }
  } catch {
    // ignore cleanup errors
  }
}
