import type { AdSlotPosition } from '@/lib/ads/constants';

export type AdSlotDimensions = {
  width: number;
  height: number;
  label: string;
};

export const AD_SLOT_DIMENSIONS: Record<AdSlotPosition, AdSlotDimensions> = {
  'homepage-mid': { width: 1200, height: 280, label: 'Homepage tengah' },
  'homepage-sidebar': { width: 400, height: 360, label: 'Homepage sidebar' },
  'article-sidebar': { width: 400, height: 360, label: 'Artikel sidebar' },
};

export function getAdSlotDimensions(position: string): AdSlotDimensions {
  if (position in AD_SLOT_DIMENSIONS) {
    return AD_SLOT_DIMENSIONS[position as AdSlotPosition];
  }
  return AD_SLOT_DIMENSIONS['homepage-mid'];
}

export function getAdSlotAspect(position: string): number {
  const { width, height } = getAdSlotDimensions(position);
  return width / height;
}
