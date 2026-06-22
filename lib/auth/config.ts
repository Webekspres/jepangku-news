export type AuthProvider = 'clerk';

/** Portal auth is Clerk-only. */
export function getAuthProvider(): AuthProvider {
  return 'clerk';
}

export function isClerkAuthEnabled(): boolean {
  return true;
}

export function isClerkAuthEnabledClient(): boolean {
  return true;
}

export function getSignInPath(): string {
  return '/sign-in';
}

export function getSignUpPath(): string {
  return '/sign-up';
}
