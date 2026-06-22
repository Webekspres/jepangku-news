export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const USERNAME_COOLDOWN_DAYS = 14;

const USERNAME_RE = /^[a-z0-9_]+$/;

/** Huruf kecil, angka, underscore saja. */
export function hasValidUsernameChars(username: string): boolean {
  return USERNAME_RE.test(username);
}

/** Panjang handle 3–30 karakter (setelah trim). */
export function hasValidUsernameLength(username: string): boolean {
  const len = username.trim().length;
  return len >= USERNAME_MIN_LENGTH && len <= USERNAME_MAX_LENGTH;
}

/** Validasi lengkap handle portal. */
export function isValidUsername(username: string): boolean {
  return hasValidUsernameChars(username) && hasValidUsernameLength(username);
}

/** Sisa hari cooldown ganti username. 0 = sudah boleh ganti. */
export function getUsernameCooldownDays(
  usernameChangedAt: Date | null,
  now = Date.now(),
): number {
  if (!usernameChangedAt) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysSince = (now - usernameChangedAt.getTime()) / msPerDay;
  const remaining = USERNAME_COOLDOWN_DAYS - daysSince;
  return remaining > 0 ? Math.ceil(remaining) : 0;
}

/** Normalisasi string menjadi handle URL-safe (min. 3 karakter jika memungkinkan). */
export function slugifyUsername(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 24);
}

/** Handle tampilan saat user belum punya akun portal News. */
export function fallbackUsernameFromCoreUser(user: {
  id: string;
  name: string;
}): string {
  const fromName = slugifyUsername(user.name);
  if (fromName.length >= 3) return fromName;
  return `user_${user.id.replace(/[^a-z0-9]/gi, '').slice(-8).toLowerCase()}`;
}
