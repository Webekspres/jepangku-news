export type ShareMethod = "copy-link" | "whatsapp" | "twitter" | "facebook";

export type SharePlatformUrls = Record<
  Exclude<ShareMethod, "copy-link">,
  string
>;

export function buildSharePlatformUrls(
  url: string,
  title: string,
): SharePlatformUrls {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedMessage = encodeURIComponent(`${title} — ${url}`);

  return {
    whatsapp: `https://wa.me/?text=${encodedMessage}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };
}

export function openShareWindow(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}
