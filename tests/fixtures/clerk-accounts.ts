/**
 * Clerk dev test accounts for automated & manual QA.
 *
 * All `+clerk_test@` addresses accept OTP `424242` without a real inbox.
 * Create these users once in your Clerk dev dashboard (or sign up via /sign-up).
 * `bun run db:seed` links portal DB rows to Clerk IDs when CLERK_SECRET_KEY is set.
 *
 * | Role        | Email                              | Portal role  |
 * |-------------|------------------------------------|--------------|
 * | guest       | (no session)                       | —            |
 * | USER        | budi+clerk_test@jepangku.com       | USER         |
 * | CONTRIBUTOR | kontributor+clerk_test@jepangku.com| CONTRIBUTOR  |
 * | ADMIN       | admin+clerk_test@jepangku.com      | ADMIN        |
 */
export const CLERK_TEST_OTP = "424242";

export const CLERK_TEST_ACCOUNTS = {
  guest: null,
  USER: {
    email: "budi+clerk_test@jepangku.com",
    role: "USER" as const,
    username: "budisantoso",
  },
  CONTRIBUTOR: {
    email: "kontributor+clerk_test@jepangku.com",
    role: "CONTRIBUTOR" as const,
    username: "kontributor",
  },
  ADMIN: {
    email: "admin+clerk_test@jepangku.com",
    role: "ADMIN" as const,
    username: "admin",
  },
} as const;

export type ClerkTestRole = keyof typeof CLERK_TEST_ACCOUNTS;
