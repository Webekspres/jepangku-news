export type SocialPlatformId =
  | "instagram"
  | "facebook"
  | "x"
  | "youtube"
  | "tiktok";

export type SocialLink = {
  id: SocialPlatformId;
  label: string;
  href: string;
};

export type SocialLinkAdmin = SocialLink & {
  isEnabled: boolean;
  sortOrder: number;
};

export const SOCIAL_PLATFORM_ORDER: SocialPlatformId[] = [
  "instagram",
  "facebook",
  "x",
  "youtube",
  "tiktok",
];

export const SOCIAL_PLATFORM_META: Record<
  SocialPlatformId,
  { label: string; defaultUrl: string }
> = {
  instagram: {
    label: "Instagram",
    defaultUrl: "https://www.instagram.com/jepangku",
  },
  facebook: {
    label: "Facebook",
    defaultUrl: "https://www.facebook.com/jepangku",
  },
  x: {
    label: "X (Twitter)",
    defaultUrl: "https://x.com/jepangku",
  },
  youtube: {
    label: "YouTube",
    defaultUrl: "https://www.youtube.com/@jepangku",
  },
  tiktok: {
    label: "TikTok",
    defaultUrl: "https://www.tiktok.com/@jepangku",
  },
};

export const SOCIAL_LINKS_CACHE_TAG = "social-links";

export type SocialLinkUpdate = {
  platform: SocialPlatformId;
  url: string;
  isEnabled: boolean;
};
