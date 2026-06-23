const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeNewsletterEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidNewsletterEmail(email: string): boolean {
  const normalized = normalizeNewsletterEmail(email);
  return normalized.length <= 320 && EMAIL_RE.test(normalized);
}
