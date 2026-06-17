/** Clerk User IDs always start with `user_` (e.g. `user_2abc…`). */
const CLERK_USER_ID_PATTERN = /^user_[a-zA-Z0-9]+$/;

export function isClerkUserId(id: string): boolean {
  return CLERK_USER_ID_PATTERN.test(id);
}

/** Pre-cutover portal UUID / `seed_*` rows — cannot authenticate without Clerk migration. */
export function isLegacyPortalUserId(id: string): boolean {
  return !isClerkUserId(id);
}
