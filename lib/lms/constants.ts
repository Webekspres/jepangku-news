const LMS_PRODUCTION_URL = "https://kursus.jepangku.com";
const LMS_STAGING_URL = "https://dev.kursus.jepangku.com";

export const LMS_UTM_SOURCE = "jepangku.com";

/** Resolve LMS origin: explicit env → NODE_ENV production → staging/dev default. */
export function getLmsBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_LMS_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    return LMS_PRODUCTION_URL;
  }

  return LMS_STAGING_URL;
}

/** Client-safe LMS base URL (evaluated at module load). */
export const LMS_BASE_URL = getLmsBaseUrl();

export function buildLmsUrl(
  path: string,
  options?: { medium?: string; campaign?: string },
): string {
  const url = new URL(path.startsWith("/") ? path : `/${path}`, LMS_BASE_URL);
  url.searchParams.set("utm_source", LMS_UTM_SOURCE);
  url.searchParams.set("utm_medium", options?.medium ?? "homepage");
  if (options?.campaign) {
    url.searchParams.set("utm_campaign", options.campaign);
  }
  return url.toString();
}
