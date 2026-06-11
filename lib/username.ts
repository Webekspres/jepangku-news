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
