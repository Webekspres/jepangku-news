export const LMS_BASE_URL =
  process.env.NEXT_PUBLIC_LMS_URL ?? "https://dev.kursus.jepangku.com";

export const LMS_UTM_SOURCE = "jepangku.com";

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
