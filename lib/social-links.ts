import { Prisma, SocialPlatform as DbSocialPlatform } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { sanitizeMediaUrl } from "@/lib/sanitizer";
import {
  SOCIAL_LINKS_CACHE_TAG,
  SOCIAL_PLATFORM_META,
  SOCIAL_PLATFORM_ORDER,
  type SocialLink,
  type SocialLinkAdmin,
  type SocialLinkUpdate,
  type SocialPlatformId,
} from "@/lib/social-links-config";

export {
  SOCIAL_LINKS_CACHE_TAG,
  SOCIAL_PLATFORM_META,
  SOCIAL_PLATFORM_ORDER,
  type SocialLink,
  type SocialLinkAdmin,
  type SocialLinkUpdate,
  type SocialPlatformId,
} from "@/lib/social-links-config";

const PLATFORM_TO_DB: Record<SocialPlatformId, DbSocialPlatform> = {
  instagram: DbSocialPlatform.INSTAGRAM,
  facebook: DbSocialPlatform.FACEBOOK,
  x: DbSocialPlatform.X,
  youtube: DbSocialPlatform.YOUTUBE,
  tiktok: DbSocialPlatform.TIKTOK,
};

const DB_TO_ID: Record<DbSocialPlatform, SocialPlatformId> = {
  [DbSocialPlatform.INSTAGRAM]: "instagram",
  [DbSocialPlatform.FACEBOOK]: "facebook",
  [DbSocialPlatform.X]: "x",
  [DbSocialPlatform.YOUTUBE]: "youtube",
  [DbSocialPlatform.TIKTOK]: "tiktok",
};

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

function getDefaultPublicSocialLinks(): SocialLink[] {
  return SOCIAL_PLATFORM_ORDER.map((id) => ({
    id,
    label: SOCIAL_PLATFORM_META[id].label,
    href: SOCIAL_PLATFORM_META[id].defaultUrl,
  }));
}

// Kode error tingkat koneksi (Prisma P100x + driver pg/Node net) yang berarti
// database tidak terjangkau — misal saat prerender build tanpa DB berjalan.
const DB_UNREACHABLE_CODES = new Set([
  "P1001", // Can't reach database server
  "P1002", // Database server timeout
  "P1017", // Server has closed the connection
  "ECONNREFUSED",
  "ETIMEDOUT",
  "ENOTFOUND",
  "ECONNRESET",
]);

function isDatabaseUnreachableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }
  // Cek code baik dari PrismaClientKnownRequestError maupun error driver pg
  // yang dibungkus (mis. { code: "ECONNREFUSED" }).
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === "string" && DB_UNREACHABLE_CODES.has(code);
}

async function fetchPublicSocialLinks(): Promise<SocialLink[]> {
  try {
    const rows = await db.siteSocialLink.findMany({
      where: { isEnabled: true },
      orderBy: { sortOrder: "asc" },
    });

    return rows
      .map(toPublicLink)
      .filter((link) => Boolean(link.href.trim()));
  } catch (error) {
    if (isDatabaseUnreachableError(error)) {
      return getDefaultPublicSocialLinks();
    }
    throw error;
  }
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
    const row = byPlatform.get(PLATFORM_TO_DB[id]);
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
      const platform = PLATFORM_TO_DB[item.platform];
      return db.siteSocialLink.upsert({
        where: { platform },
        create: {
          platform,
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
      const platform = PLATFORM_TO_DB[id];
      const meta = SOCIAL_PLATFORM_META[id];
      return db.siteSocialLink.upsert({
        where: { platform },
        create: {
          platform,
          url: meta.defaultUrl,
          isEnabled: true,
          sortOrder: index,
        },
        update: {},
      });
    }),
  );
}
