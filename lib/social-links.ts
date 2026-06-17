import { SocialPlatform as DbSocialPlatform } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { sanitizeMediaUrl } from "@/lib/sanitizer";

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
  { label: string; db: DbSocialPlatform; defaultUrl: string }
> = {
  instagram: {
    label: "Instagram",
    db: DbSocialPlatform.INSTAGRAM,
    defaultUrl: "https://www.instagram.com/jepangku",
  },
  facebook: {
    label: "Facebook",
    db: DbSocialPlatform.FACEBOOK,
    defaultUrl: "https://www.facebook.com/jepangku",
  },
  x: {
    label: "X (Twitter)",
    db: DbSocialPlatform.X,
    defaultUrl: "https://x.com/jepangku",
  },
  youtube: {
    label: "YouTube",
    db: DbSocialPlatform.YOUTUBE,
    defaultUrl: "https://www.youtube.com/@jepangku",
  },
  tiktok: {
    label: "TikTok",
    db: DbSocialPlatform.TIKTOK,
    defaultUrl: "https://www.tiktok.com/@jepangku",
  },
};

const DB_TO_ID: Record<DbSocialPlatform, SocialPlatformId> = {
  [DbSocialPlatform.INSTAGRAM]: "instagram",
  [DbSocialPlatform.FACEBOOK]: "facebook",
  [DbSocialPlatform.X]: "x",
  [DbSocialPlatform.YOUTUBE]: "youtube",
  [DbSocialPlatform.TIKTOK]: "tiktok",
};

export const SOCIAL_LINKS_CACHE_TAG = "social-links";

function toPublicLink(row: {
  platform: DbSocialPlatform;
  url: string;
}): SocialLink {
  const id = DB_TO_ID[row.platform];
  return {
    id,
    label: SOCIAL_PLATFORM_META[id].label,
    href: row.url,
  };
}

function toAdminLink(row: {
  platform: DbSocialPlatform;
  url: string;
  isEnabled: boolean;
  sortOrder: number;
}): SocialLinkAdmin {
  const base = toPublicLink(row);
  return { ...base, isEnabled: row.isEnabled, sortOrder: row.sortOrder };
}

async function fetchPublicSocialLinks(): Promise<SocialLink[]> {
  const rows = await db.siteSocialLink.findMany({
    where: { isEnabled: true },
    orderBy: { sortOrder: "asc" },
  });

  return rows
    .map(toPublicLink)
    .filter((link) => Boolean(link.href.trim()));
}

export const getPublicSocialLinks = unstable_cache(
  fetchPublicSocialLinks,
  ["public-social-links"],
  { revalidate: 300, tags: [SOCIAL_LINKS_CACHE_TAG] },
);

export async function getAdminSocialLinks(): Promise<SocialLinkAdmin[]> {
  const rows = await db.siteSocialLink.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const byPlatform = new Map(rows.map((row) => [row.platform, row]));

  return SOCIAL_PLATFORM_ORDER.map((id, index) => {
    const meta = SOCIAL_PLATFORM_META[id];
    const row = byPlatform.get(meta.db);
    if (row) return toAdminLink(row);
    return {
      id,
      label: meta.label,
      href: meta.defaultUrl,
      isEnabled: false,
      sortOrder: index,
    };
  });
}

export type SocialLinkUpdate = {
  platform: SocialPlatformId;
  url: string;
  isEnabled: boolean;
};

export function parseSocialLinkUpdates(
  items: unknown,
): { ok: true; updates: SocialLinkUpdate[] } | { ok: false; error: string } {
  if (!Array.isArray(items)) {
    return { ok: false, error: "Payload harus berupa array links" };
  }

  const updates: SocialLinkUpdate[] = [];

  for (const raw of items) {
    if (!raw || typeof raw !== "object") {
      return { ok: false, error: "Format link tidak valid" };
    }
    const platform = (raw as { platform?: string }).platform;
    if (!platform || !SOCIAL_PLATFORM_META[platform as SocialPlatformId]) {
      return { ok: false, error: `Platform tidak dikenal: ${platform}` };
    }
    const id = platform as SocialPlatformId;
    const isEnabled = Boolean((raw as { isEnabled?: boolean }).isEnabled);
    const urlRaw = String((raw as { url?: string }).url ?? "").trim();

    if (isEnabled && !urlRaw) {
      return { ok: false, error: `${SOCIAL_PLATFORM_META[id].label}: URL wajib jika aktif` };
    }

    if (urlRaw) {
      const safe = sanitizeMediaUrl(urlRaw);
      if (!safe) {
        return { ok: false, error: `${SOCIAL_PLATFORM_META[id].label}: URL harus http/https` };
      }
      updates.push({ platform: id, url: safe, isEnabled });
    } else {
      updates.push({ platform: id, url: "", isEnabled: false });
    }
  }

  return { ok: true, updates };
}

export async function saveSocialLinkUpdates(updates: SocialLinkUpdate[]) {
  await db.$transaction(
    updates.map((item, index) => {
      const meta = SOCIAL_PLATFORM_META[item.platform];
      return db.siteSocialLink.upsert({
        where: { platform: meta.db },
        create: {
          platform: meta.db,
          url: item.url,
          isEnabled: item.isEnabled,
          sortOrder: index,
        },
        update: {
          url: item.url,
          isEnabled: item.isEnabled,
          sortOrder: index,
        },
      });
    }),
  );
}

export async function ensureDefaultSocialLinks() {
  await db.$transaction(
    SOCIAL_PLATFORM_ORDER.map((id, index) => {
      const meta = SOCIAL_PLATFORM_META[id];
      return db.siteSocialLink.upsert({
        where: { platform: meta.db },
        create: {
          platform: meta.db,
          url: meta.defaultUrl,
          isEnabled: true,
          sortOrder: index,
        },
        update: {},
      });
    }),
  );
}
