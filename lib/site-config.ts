export type SocialPlatform = "instagram" | "x" | "youtube" | "tiktok";

export type SocialLink = {
  id: SocialPlatform;
  label: string;
  href: string;
};

const SOCIAL_ENV_KEYS: Record<SocialPlatform, { env: string; label: string }> = {
  instagram: {
    env: "NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL",
    label: "Instagram",
  },
  x: {
    env: "NEXT_PUBLIC_SOCIAL_X_URL",
    label: "X (Twitter)",
  },
  youtube: {
    env: "NEXT_PUBLIC_SOCIAL_YOUTUBE_URL",
    label: "YouTube",
  },
  tiktok: {
    env: "NEXT_PUBLIC_SOCIAL_TIKTOK_URL",
    label: "TikTok",
  },
};

/** Social profile links for navbar/footer. Omit env vars to hide icons. */
export function getSocialLinks(): SocialLink[] {
  return (Object.keys(SOCIAL_ENV_KEYS) as SocialPlatform[])
    .map((id) => {
      const { env, label } = SOCIAL_ENV_KEYS[id];
      const href = process.env[env]?.trim();
      if (!href) return null;
      return { id, label, href };
    })
    .filter((link): link is SocialLink => link !== null);
}
