import type { AdSlot } from "@prisma/client";

export type PublicAdBanner = {
  id: string;
  position: string;
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
  altText: string | null;
};

export function serializePublicAdBanner(ad: AdSlot): PublicAdBanner {
  return {
    id: ad.id,
    position: ad.position,
    title: ad.title,
    imageUrl: ad.imageUrl,
    linkUrl: ad.linkUrl,
    altText: ad.altText,
  };
}

export function activeAdSlotWhere(position: string, at = new Date()) {
  return {
    position,
    isActive: true,
    AND: [
      { OR: [{ startAt: null }, { startAt: { lte: at } }] },
      { OR: [{ endAt: null }, { endAt: { gte: at } }] },
    ],
  };
}
