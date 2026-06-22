import { test as base, expect, type Page } from "@playwright/test";
import type { AuthedRole } from "./clerk-auth";
import {
  E2E_AUTH_SKIP_REASON,
  isE2EAuthAvailable,
  signInAs,
} from "./clerk-auth";

type RoleFixtures = {
  clerkRole: AuthedRole;
};

/** Playwright test extended with optional `clerkRole` project option. */
export const test = base.extend<RoleFixtures>({
  clerkRole: ["USER", { option: true }],
});

export { expect, signInAs, isE2EAuthAvailable, E2E_AUTH_SKIP_REASON };

/** Call in `beforeEach` to sign in the default page fixture. */
export async function beforeEachSignIn(page: Page, role: AuthedRole): Promise<void> {
  if (!isE2EAuthAvailable()) {
    test.skip(true, E2E_AUTH_SKIP_REASON);
  }
  await signInAs(page, role);
}
