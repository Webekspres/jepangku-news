const DEFAULT_BASE_URL = "http://localhost:3000";

export function getNewsBaseUrl(): string {
  return process.env.NEWS_BASE_URL ?? DEFAULT_BASE_URL;
}

/** Returns true when the Next.js dev/production server responds on /api/health. */
export async function isNewsServerUp(
  baseUrl = getNewsBaseUrl(),
): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/api/health`, {
      signal: AbortSignal.timeout(5_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
